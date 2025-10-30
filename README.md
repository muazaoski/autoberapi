# AutoBerapi - TikTok Streak Bot

<div align="center">

![AutoBerapi](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)

**Automated TikTok DM sender to maintain your streaks - Built with Electron & Puppeteer**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [CAPTCHA Bypass](#captcha-bypass) • [Screenshots](#screenshots)

</div>

---

## ⚠️ IMPORTANT DISCLAIMERS

**Legal Notice:**
- This tool is for **educational purposes only**
- Automating TikTok interactions **violates TikTok's Terms of Service**
- Your account may be **banned or suspended** for using automation
- The author is **not responsible** for any account actions or consequences
- **Use at your own risk**

**Ethical Use:**
- This tool is intended for **personal use only** (maintaining legitimate streaks with friends)
- **DO NOT** use this for:
  - Spam or harassment
  - Mass messaging strangers
  - Commercial purposes
  - Any activity that harms others or TikTok's platform

**By using this software, you acknowledge and accept these risks.**

---

## 🚀 Features

### Core Functionality
- ✅ **Automated DM Sending** - Send messages to multiple TikTok users automatically
- ✅ **Group Management** - Organize targets into groups with custom messages
- ✅ **Smart Scheduling** - Set daily schedules for automatic message sending
- ✅ **Session Persistence** - Login once, cookies saved for 2-4 weeks
- ✅ **Multi-Target Support** - Send to unlimited users in one run

### Advanced Features
- 🥷 **CAPTCHA Bypass** - Stealth mode + cookie persistence to avoid CAPTCHAs
- 🔒 **Anti-Detection** - Puppeteer-extra stealth plugin masks automation
- 🎯 **Headless Mode** - Run browser invisibly in background
- 📅 **Cron Scheduling** - Built-in scheduler, no external tools needed
- 🔔 **Desktop Notifications** - Get notified when messages are sent

### UI & Experience
- 🎨 **Modern Dark UI** - Sleek black & white interface
- ⚙️ **Settings Panel** - Customize behavior, startup, notifications
- 💾 **System Tray** - Minimize to tray, runs 24/7 in background
- 🚀 **Auto-Start** - Launch with Windows for unattended operation
- 📊 **Real-time Console** - Monitor all bot activity live

---

## 📥 Installation

### Option 1: Installer (Recommended)
1. Download `AutoBerapi Setup 2.0.0.exe` from [Releases](../../releases)
2. Run the installer
3. Follow the setup wizard
4. Launch from Desktop shortcut or Start Menu

### Option 2: Portable
1. Download `win-unpacked.zip` from [Releases](../../releases)
2. Extract to any folder
3. Run `AutoBerapi.exe`
4. No installation required

### Requirements
- Windows 10/11
- Internet connection
- TikTok account

---

## 🎯 Quick Start Guide

### First Time Setup (IMPORTANT!)

1. **Launch the app**

2. **Configure Credentials**
   - Enter your TikTok username/email
   - Enter your TikTok password
   - Click "Save Credentials"

3. **First Run - CAPTCHA Handling**
   - Click "Settings" button
   - **UNCHECK "Headless Mode"** ⚠️ (browser will be visible)
   - Click "Save Settings"

4. **Create a Group**
   - Click the + button in Groups section
   - Enter group name (e.g., "Friends")
   - Add targets:
     - Username: @their_username
     - Message: "hey! keeping the streak 💅"
   - Click "Save Group"

5. **Test Run**
   - Click "Run Now"
   - Browser opens (visible)
   - **Manually solve any CAPTCHA if it appears** 🤖
   - Bot logs in and sends messages
   - Console shows: "✅ Cookies saved!"

6. **Enable Automation**
   - Click "Settings"
   - **CHECK "Headless Mode"** back on ✅
   - Optional: Enable schedule for daily automation
   - Click "Save Settings"

7. **Future Runs**
   - Bot uses saved cookies - no login needed!
   - No CAPTCHA prompts
   - Instant message sending
   - Runs invisibly in background

---

## 🛡️ CAPTCHA Bypass

### How It Works

1. **Stealth Mode** 🥷
   - Uses `puppeteer-extra-plugin-stealth`
   - Removes automation fingerprints
   - Browser looks like a real user
   - **Significantly reduces CAPTCHA triggers**

2. **Cookie Persistence** 🍪
   - Saves login session after first successful login
   - Reuses session for 2-4 weeks
   - **Skips login entirely** on future runs
   - No CAPTCHA risk after first time

3. **Manual Solve Option** 👤
   - First run: Browser opens visibly
   - You solve CAPTCHA once manually
   - Cookies saved automatically
   - Never asked again (until cookies expire)

### Success Rate
- **First Login:** May encounter CAPTCHA (solve once manually)
- **After Cookie Save:** 99% CAPTCHA-free ✅
- **Session Lasts:** 2-4 weeks typically

---

## ⚙️ Settings

### Automation Settings
- **Headless Mode** - Run browser invisibly (disable for first run)

### App Behavior  
- **Minimize to Tray** - X button minimizes instead of closing
- **Start Minimized** - Launch directly to system tray

### System Integration
- **Start with Windows** - Auto-launch on boot (for 24/7 operation)

### Performance
- **Show Notifications** - Desktop alerts for scheduled sends

---

## 📅 Scheduling

### Setting Up Auto-Send

1. Create a group with targets
2. Enable "Enable scheduled sending"
3. Set time (e.g., 10:00 AM)
4. Click "Save Group"
5. App runs automatically at that time daily

### Requirements for 24/7
- Enable "Start with Windows" in Settings
- Enable "Minimize to Tray" in Settings
- Leave app running (minimized to tray)

---

## 🎨 Features Showcase

### What Makes This Special

- **Cookie-Based Sessions** - Industry-leading session persistence
- **Stealth Technology** - Advanced anti-detection measures
- **Zero External Dependencies** - No n8n, no task scheduler, all built-in
- **Modern Architecture** - Electron + Node.js + Puppeteer
- **Production Ready** - Fully tested, error handling, logging

---

## 🛠️ Tech Stack

- **Electron** - Cross-platform desktop framework
- **Puppeteer** - Browser automation
- **Puppeteer-Extra + Stealth Plugin** - Anti-detection
- **Node-Cron** - Built-in scheduling
- **Vanilla JavaScript** - Fast & lightweight UI

---

## 🔧 Troubleshooting

### CAPTCHA Keeps Appearing
1. Delete `tiktok-cookies.json`
2. Run with headless mode OFF
3. Solve CAPTCHA manually once
4. Enable headless mode again

### "Login Failed"
- Check username/password are correct
- Try running with headless OFF to see the issue
- TikTok may require 2FA (handle manually)

### "Can't Find Conversation"
- Make sure you've messaged the person before
- Or the username is correct

### Schedules Not Running
- Ensure app is running (check system tray)
- Check "Start with Windows" is enabled
- Verify credentials are saved

---

## 📝 Development

### Build from Source

```bash
# Clone repo
git clone https://github.com/yourusername/autoberapi.git
cd autoberapi

# Install dependencies
npm install

# Run in development
npm start

# Build for Windows
npm run build:win
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## ⚠️ Final Warning

This bot automates TikTok interactions which violates their Terms of Service. Your account could be banned. Use responsibly and at your own risk. This is for educational purposes only.

---

## 💬 Support

Found a bug? Have a feature request? [Open an issue](../../issues)

---

<div align="center">

**Built with 🔥 for the automation grindset**

Made by developers, for developers

[⬆ Back to Top](#autoberapi---tiktok-streak-bot)

</div>
