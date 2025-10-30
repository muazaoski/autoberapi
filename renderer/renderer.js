// DOM Elements
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const targetInput = document.getElementById('target');
const messageInput = document.getElementById('message');
const headlessCheckbox = document.getElementById('headless');
const saveBtn = document.getElementById('saveBtn');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const consoleElement = document.getElementById('console');
const statusElement = document.getElementById('status');
const statusText = statusElement.querySelector('.status-text');

let isRunning = false;

// Load config on startup
async function loadConfig() {
  try {
    const config = await window.electronAPI.loadConfig();
    if (config) {
      usernameInput.value = config.TIKTOK_USERNAME || '';
      passwordInput.value = config.TIKTOK_PASSWORD || '';
      targetInput.value = config.TARGET_USERNAME || '';
      messageInput.value = config.DM_MESSAGE || 'hey! keeping the streak alive 💅';
      headlessCheckbox.checked = config.HEADLESS === 'true';

      addConsoleLog('✅ Configuration loaded successfully', 'success');
    }
  } catch (error) {
    addConsoleLog('⚠️ No existing configuration found', 'warning');
  }
}

// Save configuration
async function saveConfig() {
  const config = {
    username: usernameInput.value.trim(),
    password: passwordInput.value.trim(),
    target: targetInput.value.trim(),
    message: messageInput.value.trim() || 'hey! keeping the streak alive 💅',
    headless: headlessCheckbox.checked.toString()
  };

  if (!config.username || !config.password || !config.target) {
    addConsoleLog('❌ Please fill in all required fields (username, password, target)', 'error');
    return false;
  }

  try {
    const result = await window.electronAPI.saveConfig(config);
    if (result.success) {
      addConsoleLog('✅ Configuration saved successfully', 'success');
      return true;
    } else {
      addConsoleLog(`❌ Failed to save configuration: ${result.error}`, 'error');
      return false;
    }
  } catch (error) {
    addConsoleLog(`❌ Error saving configuration: ${error.message}`, 'error');
    return false;
  }
}

// Run bot
async function runBot() {
  if (isRunning) {
    addConsoleLog('⚠️ Bot is already running', 'warning');
    return;
  }

  const config = {
    username: usernameInput.value.trim(),
    password: passwordInput.value.trim(),
    target: targetInput.value.trim(),
    message: messageInput.value.trim() || 'hey! keeping the streak alive 💅',
    headless: headlessCheckbox.checked.toString()
  };

  if (!config.username || !config.password || !config.target) {
    addConsoleLog('❌ Please fill in all required fields before running', 'error');
    return;
  }

  isRunning = true;
  updateStatus('running', 'Running...');
  runBtn.disabled = true;
  saveBtn.disabled = true;

  addConsoleLog('\n' + '='.repeat(50), 'muted');
  addConsoleLog('🚀 Starting AutoBerapi...', 'info');
  addConsoleLog('='.repeat(50) + '\n', 'muted');

  try {
    const result = await window.electronAPI.runBot(config);

    if (result.success) {
      updateStatus('ready', 'Ready');
      addConsoleLog('\n🎉 Bot execution completed successfully!', 'success');
    } else {
      updateStatus('error', 'Error');
      addConsoleLog('\n💀 Bot execution failed', 'error');
    }
  } catch (error) {
    updateStatus('error', 'Error');
    addConsoleLog(`\n❌ Fatal error: ${error.message}`, 'error');
  } finally {
    isRunning = false;
    runBtn.disabled = false;
    saveBtn.disabled = false;
  }
}

// Add log to console
function addConsoleLog(text, type = 'default') {
  const line = document.createElement('div');
  line.className = `console-line console-${type}`;
  line.textContent = text;
  consoleElement.appendChild(line);
  consoleElement.scrollTop = consoleElement.scrollHeight;
}

// Clear console
function clearConsole() {
  consoleElement.innerHTML = '';
  addConsoleLog('Console cleared', 'muted');
}

// Update status
function updateStatus(status, text) {
  statusElement.className = `status ${status}`;
  statusText.textContent = text;
}

// Listen for bot logs
window.electronAPI.onBotLog((data) => {
  const text = data.toString();

  // Determine log type based on content
  let type = 'default';
  if (text.includes('✅') || text.includes('🎉')) {
    type = 'success';
  } else if (text.includes('❌') || text.includes('💀') || text.includes('Error')) {
    type = 'error';
  } else if (text.includes('⚠️')) {
    type = 'warning';
  } else if (text.includes('🚀') || text.includes('📱') || text.includes('💬')) {
    type = 'info';
  }

  addConsoleLog(text.trim(), type);
});

// Event Listeners
saveBtn.addEventListener('click', saveConfig);
runBtn.addEventListener('click', runBot);
clearBtn.addEventListener('click', clearConsole);

// Handle About link
document.getElementById('aboutLink').addEventListener('click', (e) => {
  e.preventDefault();
  addConsoleLog('\n' + '='.repeat(50), 'muted');
  addConsoleLog('AutoBerapi v1.0.0', 'info');
  addConsoleLog('Automated TikTok DM sender to maintain streaks', 'default');
  addConsoleLog('Built with Electron + Puppeteer', 'default');
  addConsoleLog('='.repeat(50) + '\n', 'muted');
});

// Handle Disclaimer link
document.getElementById('disclaimerLink').addEventListener('click', (e) => {
  e.preventDefault();
  addConsoleLog('\n' + '='.repeat(50), 'muted');
  addConsoleLog('⚠️ DISCLAIMER', 'warning');
  addConsoleLog('This bot is for educational purposes only.', 'default');
  addConsoleLog('Automating TikTok interactions may violate their Terms of Service.', 'default');
  addConsoleLog('Use responsibly and at your own risk.', 'default');
  addConsoleLog('The developer is not responsible for any account actions.', 'default');
  addConsoleLog('='.repeat(50) + '\n', 'muted');
});

// Load config on startup
loadConfig();
