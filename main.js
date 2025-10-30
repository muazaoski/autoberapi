const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true,
    titleBarStyle: 'default',
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('renderer/index.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// IPC Handlers
ipcMain.handle('load-config', async () => {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const config = {};

      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          config[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      });

      return config;
    }
    return null;
  } catch (error) {
    console.error('Error loading config:', error);
    return null;
  }
});

ipcMain.handle('save-config', async (event, config) => {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = `TIKTOK_USERNAME=${config.username}
TIKTOK_PASSWORD=${config.password}
TARGET_USERNAME=${config.target}
DM_MESSAGE=${config.message}
HEADLESS=${config.headless}`;

    fs.writeFileSync(envPath, envContent, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving config:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('run-bot', async (event, config) => {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');

    // Set environment variables
    const env = {
      ...process.env,
      TIKTOK_USERNAME: config.username,
      TIKTOK_PASSWORD: config.password,
      TARGET_USERNAME: config.target,
      DM_MESSAGE: config.message,
      HEADLESS: config.headless
    };

    const bot = spawn('node', ['send-dm.js'], {
      cwd: __dirname,
      env: env
    });

    let output = '';

    bot.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      mainWindow.webContents.send('bot-log', text);
    });

    bot.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      mainWindow.webContents.send('bot-log', text);
    });

    bot.on('close', (code) => {
      if (code === 0) {
        mainWindow.webContents.send('bot-log', '\n✅ Bot completed successfully!\n');
        resolve({ success: true, output });
      } else {
        mainWindow.webContents.send('bot-log', `\n❌ Bot failed with code ${code}\n`);
        resolve({ success: false, output, code });
      }
    });
  });
});
