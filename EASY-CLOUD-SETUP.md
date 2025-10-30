# Easy Cloud Setup for Non-Technical Users

## The Easiest Way: Desktop App Only

If you don't want to deal with cloud hosting, just use the desktop app:

1. **Download** `AutoBerapi-Setup.exe`
2. **Install** and open the app
3. **Enter** your TikTok credentials
4. **Click "Run Bot"** whenever you want to send a message

**Note:** Your PC needs to be on when you want the bot to run.

---

## For 24/7 Automation (PC Can Be Off)

Unfortunately, running without your PC requires some technical setup. Here's the **simplest** method:

### GitHub Actions (Step-by-Step)

**Time Required:** 10-15 minutes
**Technical Level:** Beginner (but requires following instructions carefully)

#### Step 1: Create GitHub Account
Go to https://github.com and sign up (it's free)

#### Step 2: Download GitHub Desktop
1. Go to https://desktop.github.com/
2. Download and install GitHub Desktop
3. Sign in with your GitHub account

#### Step 3: Upload This Project
1. Open GitHub Desktop
2. Click **File** → **Add Local Repository**
3. Browse to `C:\Users\muaz\tiktok-streak-bot`
4. Click **Publish repository**
5. Name it: `autoberapi`
6. **Uncheck** "Keep this code private" (or keep it private, your choice)
7. Click **Publish repository**

#### Step 4: Add Your Credentials (Securely)
1. Go to your repository on GitHub.com
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Add these 4 secrets:

| Name | Value |
|------|-------|
| `TIKTOK_USERNAME` | Your TikTok username |
| `TIKTOK_PASSWORD` | Your TikTok password |
| `TARGET_USERNAME` | Who you're messaging |
| `DM_MESSAGE` | Your message (e.g., "hey! streak 💅") |

Click **Add secret** after each one.

#### Step 5: Enable GitHub Actions
1. Go to **Actions** tab in your repository
2. If it says "Workflows disabled", click **Enable workflows**
3. You'll see "AutoBerapi Daily DM" workflow
4. Click on it → **Run workflow** to test

#### Step 6: It's Running!
- The bot will now run automatically every day at 10 AM UTC
- You can manually trigger it anytime from the Actions tab
- Your PC can be off, it runs on GitHub's servers

#### To Change Schedule:
1. Edit `.github/workflows/auto-dm.yml` on GitHub
2. Change the cron time (use https://crontab.guru to help)
3. Commit the change

---

## Why This Method?
- ✅ **Free forever**
- ✅ Works when PC is off
- ✅ No server management needed
- ✅ Your credentials are encrypted (GitHub Secrets)
- ✅ Can see logs if something fails

## Why It's Still Not "Easy"?
- Requires understanding GitHub
- Needs to add secrets correctly
- Cron syntax is confusing
- Debugging failures requires reading logs

---

## The Truth

**For true "public friendliness", you'd need to build a web service where:**
- Users just enter credentials on a website
- Click "Start automation"
- Pay $2-5/month for hosting

This would require:
- Frontend website
- Backend server
- Database
- User authentication
- Payment processing

That's a **much bigger project** but would make it accessible to anyone.

---

## My Recommendation

**For now:**
- Share the **.exe desktop app** for non-technical users
- Share the **GitHub Actions method** for technical users
- Both are documented and ready to go

**For the future:**
- If you want to make it truly public-friendly, consider building a hosted web service
- But that's a bigger commitment (hosting costs, maintenance, support)
