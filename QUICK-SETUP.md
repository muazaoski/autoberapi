# 🚀 TikTok Streak Bot - Windows Scheduler Setup

## EZ Mode Setup (No n8n needed!)

### Step 1: Run the Setup Script 🔧

**Right-click PowerShell and select "Run as Administrator"**, then run:

```powershell
cd C:\Users\muaz\tiktok-streak-bot
.\setup-scheduler.ps1
```

This will:
- ✅ Create a Windows Task Scheduler job
- ✅ Set it to run daily at 10 AM
- ✅ Configure it to run your bot automatically
- ✅ Test that everything works

### Step 2: Test It Manually 🧪

Double-click this file to test:
```
C:\Users\muaz\tiktok-streak-bot\schedule-bot.bat
```

This should:
- Open a command window
- Run the bot
- Show you the process
- Take a screenshot

### Step 3: Check Task Scheduler 📅

1. Press `Win + R`
2. Type `taskschd.msc`
3. Press Enter
4. Look for "TikTok Streak Bot"
5. Right-click to enable/disable/modify

## 🎯 What Happens Daily

Every day at 10 AM (or your chosen time):
1. 🤖 Bot starts automatically
2. 🌐 Opens Chrome
3. 🔐 Logs into TikTok
4. 💬 Finds conversation with "ayen"
5. 📝 Sends your message
6. 📸 Takes screenshot
7. 🚪 Closes browser

## ⚙️ Customize Schedule

To change the time, edit `setup-scheduler.ps1`:
```powershell
$triggerTime = "18:00"  # 6 PM instead of 10 AM
```

Then run the setup script again.

## 🔧 Troubleshooting

### Bot doesn't run
- Check Task Scheduler if the task is enabled
- Make sure your computer is on at the scheduled time
- Check the "Last Run Result" in Task Scheduler

### Bot fails
- Run `schedule-bot.bat` manually to see error
- Check `error-screenshot.png` for visual clues
- Make sure your `.env` file has correct credentials

### Want to stop it
- Open Task Scheduler
- Find "TikTok Streak Bot"
- Right-click → Disable

## 📁 Files Created

- `schedule-bot.bat` - The bot runner
- `setup-scheduler.ps1` - Setup script
- `last-dm-screenshot.png` - Proof it worked
- `error-screenshot.png` - If something went wrong

## 🎉 You're All Set!

Your TikTok streak will be maintained automatically every day! No more manual work needed bestie! 🔥

**Built different** 😤  
**W setup** 💅  
**Periodt** ✨

