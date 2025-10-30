const { app, BrowserWindow, ipcMain, Tray, Menu, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

let mainWindow;
let tray = null;
let scheduledJobs = {}; // Store active cron jobs
let appSettings = {
  headless: true,
  minimizeToTray: true,
  startMinimized: false,
  openAtLogin: false,
  showNotifications: true
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-v2.js')
    },
    frame: true,
    titleBarStyle: 'default',
    icon: path.join(__dirname, '21d.ico')
  });

  mainWindow.loadFile('renderer/index-v2.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  // Handle minimize to tray based on settings
  mainWindow.on('close', function (event) {
    if (!app.isQuitting && appSettings.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();

      // Show notification on first minimize
      if (!mainWindow.minimizedOnce) {
        mainWindow.minimizedOnce = true;
        console.log('App minimized to tray');
        if (appSettings.showNotifications) {
          try {
            new Notification({
              title: 'AutoBerapi',
              body: 'App minimized to system tray. Schedules are still running.',
              icon: path.join(__dirname, '21d.ico')
            }).show();
          } catch (e) {
            console.log('Could not show notification:', e);
          }
        }
      }
    }
    return false;
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '21d.ico');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show AutoBerapi',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'Scheduler Status',
      click: () => {
        const activeCount = Object.keys(scheduledJobs).length;
        console.log(`Active schedules: ${activeCount}`);
        if (mainWindow) {
          mainWindow.webContents.send('bot-log', `📅 Active schedules: ${activeCount}\n`);
          mainWindow.show();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('AutoBerapi - TikTok Streak Bot');
  tray.setContextMenu(contextMenu);

  // Double click to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    } else {
      createWindow();
    }
  });
}

// IPC Handlers

// Load groups data
ipcMain.handle('load-groups', async () => {
  try {
    const dataPath = path.join(__dirname, 'groups-data.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading groups:', error);
    return null;
  }
});

// Save groups data
ipcMain.handle('save-groups', async (event, data) => {
  try {
    const dataPath = path.join(__dirname, 'groups-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving groups:', error);
    return { success: false, error: error.message };
  }
});

// Run group (send messages to multiple targets)
async function runGroupExecution(config, groupName = 'Group') {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');

    // Create temp file with group config
    const tempConfigPath = path.join(__dirname, 'temp-group-config.json');
    fs.writeFileSync(tempConfigPath, JSON.stringify(config), 'utf8');

    const bot = spawn('node', ['send-dm-group.js', tempConfigPath], {
      cwd: __dirname
    });

    let output = '';

    bot.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      if (mainWindow) {
        mainWindow.webContents.send('bot-log', text);
      }
    });

    bot.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      if (mainWindow) {
        mainWindow.webContents.send('bot-log', text);
      }
    });

    bot.on('close', (code) => {
      // Clean up temp file
      try {
        if (fs.existsSync(tempConfigPath)) {
          fs.unlinkSync(tempConfigPath);
        }
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }

      if (code === 0) {
        if (mainWindow) {
          mainWindow.webContents.send('bot-log', '\n✅ Group execution completed successfully!\n');
        }
        resolve({ success: true, output });
      } else {
        if (mainWindow) {
          mainWindow.webContents.send('bot-log', `\n❌ Group execution failed with code ${code}\n`);
        }
        resolve({ success: false, output, code });
      }
    });
  });
}

ipcMain.handle('run-group', async (event, config) => {
  return runGroupExecution(config);
});

// Scheduler functions
function stopAllSchedules() {
  console.log('Stopping all scheduled jobs...');
  Object.keys(scheduledJobs).forEach(jobId => {
    if (scheduledJobs[jobId]) {
      scheduledJobs[jobId].stop();
      console.log(`Stopped job: ${jobId}`);
    }
  });
  scheduledJobs = {};
}

function loadAndStartSchedules() {
  console.log('Loading and starting schedules...');
  stopAllSchedules();

  try {
    const dataPath = path.join(__dirname, 'groups-data.json');
    if (!fs.existsSync(dataPath)) {
      console.log('No groups data found');
      return;
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const groups = data.groups || [];

    groups.forEach(group => {
      if (group.scheduleEnabled && group.scheduleTime && group.targets && group.targets.length > 0) {
        const [hours, minutes] = group.scheduleTime.split(':');
        const cronExpression = `${minutes} ${hours} * * *`; // Daily at specified time

        console.log(`Setting up schedule for "${group.name}" at ${group.scheduleTime} (cron: ${cronExpression})`);

        const job = cron.schedule(cronExpression, async () => {
          console.log(`\n⏰ Scheduled execution triggered for: ${group.name}`);
          if (mainWindow) {
            mainWindow.webContents.send('bot-log', `\n⏰ Scheduled execution started: ${group.name}\n`);
          }

          // Show notification
          if (appSettings.showNotifications) {
            try {
              new Notification({
                title: 'AutoBerapi - Scheduled Run',
                body: `Sending messages for group: ${group.name}`,
                icon: path.join(__dirname, '21d.ico')
              }).show();
            } catch (e) {
              console.log('Could not show notification:', e);
            }
          }

          // Prepare config for this group
          const config = {
            username: data.credentials?.username,
            password: data.credentials?.password,
            targets: group.targets,
            headless: data.credentials?.headless !== false ? 'true' : 'false'
          };

          if (!config.username || !config.password) {
            console.error(`⚠️ Credentials not set for scheduled group: ${group.name}`);
            if (mainWindow) {
              mainWindow.webContents.send('bot-log', `⚠️ Skipping "${group.name}" - credentials not configured\n`);
            }
            return;
          }

          // Run the group
          const result = await runGroupExecution(config, group.name);

          // Show completion notification
          if (appSettings.showNotifications) {
            try {
              new Notification({
                title: result.success ? 'Messages Sent!' : 'Send Failed',
                body: result.success ? `Group "${group.name}" completed successfully.` : `Group "${group.name}" encountered an error.`,
                icon: path.join(__dirname, '21d.ico')
              }).show();
            } catch (e) {
              console.log('Could not show notification:', e);
            }
          }
        }, {
          scheduled: true,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        scheduledJobs[group.id] = job;
        console.log(`✅ Scheduled "${group.name}" to run daily at ${group.scheduleTime}`);

        if (mainWindow) {
          mainWindow.webContents.send('bot-log', `✅ Scheduled "${group.name}" to run daily at ${group.scheduleTime}\n`);
        }
      }
    });

    const activeCount = Object.keys(scheduledJobs).length;
    console.log(`✅ Active schedules: ${activeCount}`);
    if (mainWindow) {
      mainWindow.webContents.send('bot-log', `📅 Total active schedules: ${activeCount}\n`);
      mainWindow.webContents.send('scheduler-status', { active: activeCount });
    }

  } catch (error) {
    console.error('Error loading schedules:', error);
  }
}

// Reload schedules
ipcMain.handle('reload-schedules', async () => {
  try {
    loadAndStartSchedules();
    return { success: true, activeJobs: Object.keys(scheduledJobs).length };
  } catch (error) {
    console.error('Error reloading schedules:', error);
    return { success: false, error: error.message };
  }
});

// Get scheduler status
ipcMain.handle('get-scheduler-status', async () => {
  return {
    success: true,
    activeJobs: Object.keys(scheduledJobs).length,
    jobs: Object.keys(scheduledJobs)
  };
});

// Update app settings
ipcMain.handle('update-settings', async (event, settings) => {
  try {
    appSettings = { ...appSettings, ...settings };

    // Handle auto-start
    if (settings.openAtLogin !== undefined) {
      app.setLoginItemSettings({
        openAtLogin: settings.openAtLogin,
        openAsHidden: settings.startMinimized || false,
        path: process.execPath,
        args: settings.startMinimized ? ['--hidden'] : []
      });
      console.log(`Auto-start ${settings.openAtLogin ? 'enabled' : 'disabled'}`);
    }

    // Send notification if enabled and settings saved
    if (appSettings.showNotifications) {
      try {
        new Notification({
          title: 'Settings Saved',
          body: 'Your preferences have been updated successfully.',
          icon: path.join(__dirname, '21d.ico')
        }).show();
      } catch (e) {
        console.log('Could not show notification:', e);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: error.message };
  }
});

// Load app settings from storage
function loadAppSettings() {
  try {
    const dataPath = path.join(__dirname, 'groups-data.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      if (data.settings) {
        appSettings = { ...appSettings, ...data.settings };
        console.log('App settings loaded:', appSettings);
      }
    }
  } catch (error) {
    console.error('Error loading app settings:', error);
  }
}

// Start scheduler when app is ready
app.whenReady().then(() => {
  // Load settings first
  loadAppSettings();

  createTray();
  createWindow();

  // Check if should start minimized
  if (appSettings.startMinimized && process.argv.includes('--hidden')) {
    mainWindow.hide();
  }

  // Give the window a moment to load, then start schedules
  setTimeout(() => {
    loadAndStartSchedules();
  }, 2000);
});

// Prevent app from quitting when all windows are closed (run in background)
app.on('window-all-closed', function () {
  // Keep app running in tray on all platforms
  // Don't quit - let the tray "Quit" button handle that
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

// Stop all schedules when app quits
app.on('before-quit', () => {
  console.log('App quitting, stopping all schedules...');
  stopAllSchedules();
});
