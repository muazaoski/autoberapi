# 🚀 Quick Start Guide - TikTok Streak Bot

## Step 1: Configure Your Credentials ✍️

Edit the `.env` file in this folder (`C:\Users\muaz\tiktok-streak-bot\.env`):

```bash
# Open with notepad
notepad .env
```

Fill in your info:
```env
TIKTOK_USERNAME=your_actual_username_or_email
TIKTOK_PASSWORD=your_actual_password
TARGET_USERNAME=the_person_you_dm
DM_MESSAGE=yo bestie! keeping the streak alive 💅✨
HEADLESS=false
```

**Important:** Set `HEADLESS=false` for your first run so you can see what's happening!

## Step 2: Test It Manually 🧪

Run the bot once manually to make sure it works:

```bash
npm run send
```

Watch it work! It should:
1. Open Chrome
2. Go to TikTok
3. Log in
4. Navigate to DMs
5. Send your message
6. Take a screenshot

If it works, you'll see: `✅ Message sent successfully!`

## Step 3: Set Up n8n Workflow 🤖

### Option A: Import the Workflow (EASIEST)

1. Start n8n:
   ```bash
   n8n
   ```

2. Open n8n in your browser (usually `http://localhost:5678`)

3. Click **"+ Add workflow"** or go to **Workflows**

4. Click the **3 dots menu** (⋮) → **Import from File**

5. Select `n8n-workflow.json` from this folder

6. **IMPORTANT:** Edit the "Send TikTok DM" node and make sure the path is correct:
   ```
   cd C:\Users\muaz\tiktok-streak-bot && npm run send
   ```

7. Click **Save** and **Activate** (toggle the switch in the top right)

### Option B: Create Manually

1. Start n8n: `n8n`

2. Create new workflow

3. Add these nodes:

   **Node 1: Schedule Trigger**
   - Type: Schedule Trigger
   - Mode: Every Day
   - Hour: 10 (or whenever you want)
   - Minute: 0

   **Node 2: Execute Command**
   - Type: Execute Command
   - Command: `cd C:\Users\muaz\tiktok-streak-bot && npm run send`

   **Node 3: IF (optional)**
   - Check if `exitCode` equals `0`
   - True = success
   - False = failure

4. Connect the nodes: Schedule → Execute → IF

5. Save and Activate!

## Step 4: Customize Schedule ⏰

Edit the cron expression in n8n to change when it runs:

- **Daily at 10 AM**: `0 10 * * *`
- **Daily at 9 PM**: `0 21 * * *`
- **Twice a day (10 AM & 6 PM)**: `0 10,18 * * *`
- **Every 12 hours**: `0 */12 * * *`

## Step 5: Add Notifications (Optional) 📱

Replace the "No Op" nodes in the workflow with actual notifications:

### Discord Webhook
- Add "HTTP Request" node
- Method: POST
- URL: Your Discord webhook URL
- Body: `{"content": "✅ TikTok streak maintained!"}`

### Telegram
- Add "Telegram" node
- Connect your bot
- Send message on success/failure

### Email
- Add "Send Email" node
- Configure your email provider
- Get notified if the bot fails

## 🔧 Troubleshooting

### "Login failed" or CAPTCHA
- TikTok might require verification
- Run with `HEADLESS=false` first
- Complete any 2FA manually
- After first successful login, it should be easier

### "Can't find conversation"
- Make sure you've messaged this person before
- Or update the script to start a new conversation
- Check that `TARGET_USERNAME` is correct

### n8n says "command not found"
- Make sure the path is correct in the Execute Command node
- Try running the command manually in PowerShell first
- Check that npm is in your PATH

### Script times out
- Increase timeout values in `send-dm.js`
- Check your internet connection
- TikTok might be slow to load

## ⚠️ Important Warnings

1. **TikTok ToS**: This might violate TikTok's Terms of Service. Use at your own risk!
2. **Account Ban**: Your account could get flagged or banned
3. **Rate Limiting**: Don't spam. Once a day should be fine
4. **Security**: Never share your `.env` file or commit it to git
5. **CAPTCHA**: TikTok might ask for verification randomly

## 📸 Check If It Worked

After each run, check:
- `last-dm-screenshot.png` - shows the sent message
- Console logs in n8n execution history
- Actually open TikTok and check the conversation

## 🎯 Pro Tips

1. **Test first**: Always run manually with `HEADLESS=false` before automating
2. **Start simple**: Use a simple message like "hey!" first
3. **Monitor it**: Check n8n logs for the first few days
4. **Backup login**: Keep 2FA on but save your session
5. **Change timing**: Don't send at exactly the same time every day (too sus)

## 🔥 You're All Set!

Your bot is now ready to maintain those TikTok streaks on autopilot!

Questions? Check the main README.md or the code comments.

**Built different** 😤  
**W setup** 🔥  
**Periodt** 💅

---

Made with automation grindset energy ✨


