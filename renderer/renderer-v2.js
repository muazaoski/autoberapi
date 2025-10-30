// State
let groups = [];
let currentGroupId = null;
let tiktokCredentials = { username: '', password: '', headless: true };
let appSettings = {
  headless: true,
  minimizeToTray: true,
  startMinimized: false,
  openAtLogin: false,
  showNotifications: true
};
let isRunning = false;

// DOM Elements
const groupsList = document.getElementById('groupsList');
const addGroupBtn = document.getElementById('addGroupBtn');
const emptyState = document.getElementById('emptyState');
const groupEditor = document.getElementById('groupEditor');
const groupNameInput = document.getElementById('groupName');
const deleteGroupBtn = document.getElementById('deleteGroupBtn');
const scheduleEnabled = document.getElementById('scheduleEnabled');
const timeInputGroup = document.getElementById('timeInputGroup');
const scheduleTime = document.getElementById('scheduleTime');
const targetsList = document.getElementById('targetsList');
const addTargetBtn = document.getElementById('addTargetBtn');
const saveGroupBtn = document.getElementById('saveGroupBtn');
const runGroupBtn = document.getElementById('runGroupBtn');
const tiktokUsername = document.getElementById('tiktokUsername');
const tiktokPassword = document.getElementById('tiktokPassword');
const saveCredsBtn = document.getElementById('saveCredsBtn');
const clearBtn = document.getElementById('clearBtn');
const consoleElement = document.getElementById('console');
const statusElement = document.getElementById('status');
const statusText = statusElement.querySelector('.status-text');

// Initialize
async function init() {
  await loadData();
  renderGroups();
  addConsoleLog('✅ AutoBerapi ready!', 'success');

  // Get initial scheduler status
  try {
    const status = await window.electronAPI.getSchedulerStatus();
    if (status.activeJobs > 0) {
      addConsoleLog(`📅 Active schedules: ${status.activeJobs}`, 'info');
    }
  } catch (error) {
    console.error('Error getting scheduler status:', error);
  }
}

// Load data from storage
async function loadData() {
  try {
    const data = await window.electronAPI.loadGroups();
    if (data) {
      groups = data.groups || [];
      tiktokCredentials = data.credentials || { username: '', password: '', headless: true };
      appSettings = data.settings || {
        headless: true,
        minimizeToTray: true,
        startMinimized: false,
        openAtLogin: false,
        showNotifications: true
      };
      tiktokUsername.value = tiktokCredentials.username || '';
      tiktokPassword.value = tiktokCredentials.password || '';

      // Load settings into modal
      loadSettingsIntoModal();

      addConsoleLog('✅ Data loaded successfully', 'success');
    }
  } catch (error) {
    addConsoleLog('⚠️ No existing data found', 'warning');
  }
}

// Save data to storage
async function saveData() {
  try {
    const data = {
      groups: groups,
      credentials: tiktokCredentials,
      settings: appSettings
    };
    await window.electronAPI.saveGroups(data);
    addConsoleLog('✅ Data saved successfully', 'success');
  } catch (error) {
    addConsoleLog(`❌ Failed to save: ${error.message}`, 'error');
  }
}

// Generate unique ID
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Render groups list
function renderGroups() {
  groupsList.innerHTML = '';

  if (groups.length === 0) {
    groupsList.innerHTML = '<div class="empty-groups">No groups yet</div>';
    return;
  }

  groups.forEach(group => {
    const div = document.createElement('div');
    div.className = 'group-item';
    if (group.id === currentGroupId) {
      div.classList.add('active');
    }

    const targetCount = group.targets ? group.targets.length : 0;
    const scheduleText = group.scheduleEnabled ? `⏰ ${group.scheduleTime}` : 'Manual';

    div.innerHTML = `
      <div class="group-name">${group.name}</div>
      <div class="group-meta">${targetCount} target(s) • ${scheduleText}</div>
    `;

    div.onclick = () => selectGroup(group.id);
    groupsList.appendChild(div);
  });
}

// Add new group
function addGroup() {
  const newGroup = {
    id: generateId(),
    name: 'New Group',
    scheduleEnabled: false,
    scheduleTime: '10:00',
    targets: []
  };

  groups.push(newGroup);
  selectGroup(newGroup.id);
  renderGroups();
  saveData();
  addConsoleLog(`✅ Created group: ${newGroup.name}`, 'success');
}

// Select group
function selectGroup(groupId) {
  currentGroupId = groupId;
  const group = groups.find(g => g.id === groupId);

  if (!group) return;

  emptyState.style.display = 'none';
  groupEditor.style.display = 'flex';

  groupNameInput.value = group.name;
  scheduleEnabled.checked = group.scheduleEnabled || false;
  scheduleTime.value = group.scheduleTime || '10:00';
  timeInputGroup.style.display = group.scheduleEnabled ? 'flex' : 'none';

  renderTargets(group);
  renderGroups();
}

// Render targets for current group
function renderTargets(group) {
  targetsList.innerHTML = '';

  if (!group.targets || group.targets.length === 0) {
    targetsList.innerHTML = '<div class="empty-targets">No targets yet. Click "Add Target" to add one.</div>';
    return;
  }

  group.targets.forEach((target, index) => {
    const div = document.createElement('div');
    div.className = 'target-item';
    div.innerHTML = `
      <div class="target-item-header">
        <span class="target-number">Target ${index + 1}</span>
        <button class="btn-icon btn-delete" onclick="removeTarget('${target.id}')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <input type="text" placeholder="Username" value="${target.username || ''}"
             onchange="updateTarget('${target.id}', 'username', this.value)">
      <input type="text" placeholder="Message" value="${target.message || ''}"
             onchange="updateTarget('${target.id}', 'message', this.value)">
    `;
    targetsList.appendChild(div);
  });
}

// Add target to current group
function addTarget() {
  const group = groups.find(g => g.id === currentGroupId);
  if (!group) return;

  if (!group.targets) group.targets = [];

  const newTarget = {
    id: generateId(),
    username: '',
    message: 'hey! keeping the streak 💅'
  };

  group.targets.push(newTarget);
  renderTargets(group);
  addConsoleLog('✅ Added new target', 'success');
}

// Update target
function updateTarget(targetId, field, value) {
  const group = groups.find(g => g.id === currentGroupId);
  if (!group) return;

  const target = group.targets.find(t => t.id === targetId);
  if (target) {
    target[field] = value;
  }
}

// Remove target
function removeTarget(targetId) {
  const group = groups.find(g => g.id === currentGroupId);
  if (!group) return;

  group.targets = group.targets.filter(t => t.id !== targetId);
  renderTargets(group);
  renderGroups();
  addConsoleLog('✅ Target removed', 'success');
}

// Save current group
async function saveGroup() {
  const group = groups.find(g => g.id === currentGroupId);
  if (!group) return;

  group.name = groupNameInput.value || 'Unnamed Group';
  group.scheduleEnabled = scheduleEnabled.checked;
  group.scheduleTime = scheduleTime.value;

  renderGroups();
  await saveData();

  // Reload schedules after saving
  try {
    const result = await window.electronAPI.reloadSchedules();
    if (result.success) {
      addConsoleLog(`✅ Group "${group.name}" saved`, 'success');
      if (group.scheduleEnabled) {
        addConsoleLog(`📅 Schedule activated: ${group.scheduleTime} daily`, 'info');
      }
    }
  } catch (error) {
    addConsoleLog(`⚠️ Error reloading schedules: ${error.message}`, 'warning');
  }
}

// Delete current group
async function deleteGroup() {
  if (!currentGroupId) return;

  const group = groups.find(g => g.id === currentGroupId);
  if (!group) return;

  if (!confirm(`Delete group "${group.name}"?`)) return;

  groups = groups.filter(g => g.id !== currentGroupId);
  currentGroupId = null;

  emptyState.style.display = 'flex';
  groupEditor.style.display = 'none';

  renderGroups();
  await saveData();

  // Reload schedules after deletion
  try {
    await window.electronAPI.reloadSchedules();
    addConsoleLog(`✅ Group deleted`, 'success');
  } catch (error) {
    addConsoleLog(`⚠️ Error reloading schedules: ${error.message}`, 'warning');
  }
}

// Run current group
async function runGroup() {
  const group = groups.find(g => g.id === currentGroupId);
  if (!group) return;

  if (!group.targets || group.targets.length === 0) {
    addConsoleLog('❌ No targets in this group', 'error');
    return;
  }

  if (!tiktokCredentials.username || !tiktokCredentials.password) {
    addConsoleLog('❌ Please save TikTok credentials first', 'error');
    return;
  }

  // Validate targets
  const invalidTargets = group.targets.filter(t => !t.username || !t.message);
  if (invalidTargets.length > 0) {
    addConsoleLog('❌ Some targets are missing username or message', 'error');
    return;
  }

  isRunning = true;
  updateStatus('running', 'Running...');
  runGroupBtn.disabled = true;

  addConsoleLog('\n' + '='.repeat(50), 'muted');
  addConsoleLog(`🚀 Running group: ${group.name}`, 'info');
  addConsoleLog(`📊 Targets: ${group.targets.length}`, 'info');
  addConsoleLog('='.repeat(50) + '\n', 'muted');

  try {
    const config = {
      username: tiktokCredentials.username,
      password: tiktokCredentials.password,
      targets: group.targets,
      headless: appSettings.headless ? 'true' : 'false'
    };

    const result = await window.electronAPI.runGroup(config);

    if (result.success) {
      updateStatus('ready', 'Ready');
      addConsoleLog('\n🎉 Group execution completed!', 'success');
    } else {
      updateStatus('error', 'Error');
      addConsoleLog('\n💀 Group execution failed', 'error');
    }
  } catch (error) {
    updateStatus('error', 'Error');
    addConsoleLog(`\n❌ Fatal error: ${error.message}`, 'error');
  } finally {
    isRunning = false;
    runGroupBtn.disabled = false;
  }
}

// Save credentials
async function saveCredentials() {
  tiktokCredentials.username = tiktokUsername.value.trim();
  tiktokCredentials.password = tiktokPassword.value.trim();
  tiktokCredentials.headless = appSettings.headless;

  if (!tiktokCredentials.username || !tiktokCredentials.password) {
    addConsoleLog('❌ Please enter both username and password', 'error');
    return;
  }

  await saveData();

  // Reload schedules after saving credentials
  try {
    await window.electronAPI.reloadSchedules();
    addConsoleLog('✅ Credentials saved', 'success');
  } catch (error) {
    addConsoleLog(`⚠️ Error reloading schedules: ${error.message}`, 'warning');
  }
}

// Console functions
function addConsoleLog(text, type = 'default') {
  const line = document.createElement('div');
  line.className = `console-line console-${type}`;
  line.textContent = text;
  consoleElement.appendChild(line);
  consoleElement.scrollTop = consoleElement.scrollHeight;
}

function clearConsole() {
  consoleElement.innerHTML = '';
  addConsoleLog('Console cleared', 'muted');
}

function updateStatus(status, text) {
  statusElement.className = `status ${status}`;
  statusText.textContent = text;
}

// Listen for bot logs
window.electronAPI.onBotLog((data) => {
  const text = data.toString();
  let type = 'default';

  if (text.includes('✅') || text.includes('🎉')) type = 'success';
  else if (text.includes('❌') || text.includes('💀') || text.includes('Error')) type = 'error';
  else if (text.includes('⚠️')) type = 'warning';
  else if (text.includes('🚀') || text.includes('📱') || text.includes('💬') || text.includes('📅') || text.includes('⏰')) type = 'info';

  addConsoleLog(text.trim(), type);
});

// Listen for scheduler status updates
window.electronAPI.onSchedulerStatus((data) => {
  console.log('Scheduler status update:', data);
  if (data.active !== undefined) {
    // Update status display if needed
    updateStatus('ready', `Ready • ${data.active} scheduled`);
  }
});

// Settings Modal functions
function openSettingsModal() {
  const modal = document.getElementById('settingsModal');
  loadSettingsIntoModal();
  modal.style.display = 'flex';
}

function closeSettingsModal() {
  const modal = document.getElementById('settingsModal');
  modal.style.display = 'none';
}

function loadSettingsIntoModal() {
  document.getElementById('headlessModeSetting').checked = appSettings.headless;
  document.getElementById('minimizeToTray').checked = appSettings.minimizeToTray;
  document.getElementById('startMinimized').checked = appSettings.startMinimized;
  document.getElementById('openAtLogin').checked = appSettings.openAtLogin;
  document.getElementById('showNotifications').checked = appSettings.showNotifications;
}

async function saveSettings() {
  appSettings.headless = document.getElementById('headlessModeSetting').checked;
  appSettings.minimizeToTray = document.getElementById('minimizeToTray').checked;
  appSettings.startMinimized = document.getElementById('startMinimized').checked;
  appSettings.openAtLogin = document.getElementById('openAtLogin').checked;
  appSettings.showNotifications = document.getElementById('showNotifications').checked;

  // Update credentials with headless setting
  tiktokCredentials.headless = appSettings.headless;

  await saveData();

  // Apply settings to main process
  try {
    await window.electronAPI.updateSettings(appSettings);
    addConsoleLog('✅ Settings saved', 'success');
    addConsoleLog(`🔧 Headless mode: ${appSettings.headless ? 'ON' : 'OFF'}`, 'info');
    addConsoleLog(`📌 Start with Windows: ${appSettings.openAtLogin ? 'ON' : 'OFF'}`, 'info');
  } catch (error) {
    addConsoleLog(`⚠️ Error applying settings: ${error.message}`, 'warning');
  }

  closeSettingsModal();
}

// Disclaimer Modal functions
function openDisclaimerModal() {
  const modal = document.getElementById('disclaimerModal');
  modal.style.display = 'flex';
}

function closeDisclaimerModal() {
  const modal = document.getElementById('disclaimerModal');
  modal.style.display = 'none';
}

// Event Listeners
addGroupBtn.addEventListener('click', addGroup);
deleteGroupBtn.addEventListener('click', deleteGroup);
scheduleEnabled.addEventListener('change', (e) => {
  timeInputGroup.style.display = e.target.checked ? 'flex' : 'none';
});
addTargetBtn.addEventListener('click', addTarget);
saveGroupBtn.addEventListener('click', saveGroup);
runGroupBtn.addEventListener('click', runGroup);
saveCredsBtn.addEventListener('click', saveCredentials);
clearBtn.addEventListener('click', clearConsole);

// Settings modal listeners
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

settingsBtn.addEventListener('click', openSettingsModal);
closeSettingsBtn.addEventListener('click', closeSettingsModal);
saveSettingsBtn.addEventListener('click', saveSettings);

// Close settings modal when clicking outside
document.getElementById('settingsModal').addEventListener('click', (e) => {
  if (e.target.id === 'settingsModal') {
    closeSettingsModal();
  }
});

// Disclaimer modal listeners
const disclaimerBtn = document.getElementById('disclaimerBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const acceptBtn = document.getElementById('acceptBtn');

disclaimerBtn.addEventListener('click', openDisclaimerModal);
closeModalBtn.addEventListener('click', closeDisclaimerModal);
acceptBtn.addEventListener('click', closeDisclaimerModal);

// Close modal when clicking outside
document.getElementById('disclaimerModal').addEventListener('click', (e) => {
  if (e.target.id === 'disclaimerModal') {
    closeDisclaimerModal();
  }
});

// Make functions global for inline onclick
window.removeTarget = removeTarget;
window.updateTarget = updateTarget;

// Initialize app
init();
