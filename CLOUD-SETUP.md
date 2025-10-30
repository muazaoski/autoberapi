# Running AutoBerapi 24/7 Without Your PC

## Option 1: GitHub Actions (FREE & Recommended)

GitHub Actions lets your bot run in the cloud completely free, even when your PC is off.

### Setup Steps:

#### 1. Push Your Code to GitHub

```bash
cd C:\Users\muaz\tiktok-streak-bot
git init
git add .
git commit -m "Initial commit"
gh repo create autoberapi --public --source=. --remote=origin
git push -u origin main
```

#### 2. Add Secrets to GitHub

Go to your repo on GitHub:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:
   - `TIKTOK_USERNAME` → your TikTok username
   - `TIKTOK_PASSWORD` → your TikTok password
   - `TARGET_USERNAME` → who you're messaging
   - `DM_MESSAGE` → your message (e.g., "hey! keeping the streak 💅")

#### 3. Enable GitHub Actions

The workflow file is already created at `.github/workflows/auto-dm.yml`

It will run automatically every day at 10 AM UTC.

#### 4. Adjust Schedule (Optional)

Edit `.github/workflows/auto-dm.yml` and change the cron:

```yaml
schedule:
  - cron: '0 10 * * *'  # 10 AM UTC daily
  # Examples:
  # - cron: '0 */12 * * *'  # Every 12 hours
  # - cron: '0 22 * * *'    # 10 PM UTC daily
```

**Cron Time Converter**: https://crontab.guru

#### 5. Test It

- Go to **Actions** tab in your GitHub repo
- Click on the workflow
- Click **Run workflow** to test manually

### Limitations:
- GitHub Actions has a 6-hour timeout per job
- Runs are logged publicly (don't output passwords!)
- May not work if TikTok detects GitHub's IP as suspicious

---

## Option 2: Oracle Cloud VPS (FREE Forever)

Get a free server that runs 24/7.

### Setup Steps:

#### 1. Create Oracle Cloud Account
- Go to https://cloud.oracle.com/
- Sign up (requires credit card but it's FREE)
- Create a compute instance (choose Ubuntu)

#### 2. SSH into Server

```bash
ssh ubuntu@your-server-ip
```

#### 3. Install Node.js

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Verify installation
node --version
npm --version
```

#### 4. Upload Your Bot

```bash
# Clone from GitHub
git clone https://github.com/yourusername/autoberapi.git
cd autoberapi

# Or upload manually with SCP:
# scp -r C:\Users\muaz\tiktok-streak-bot ubuntu@your-server-ip:~/autoberapi
```

#### 5. Install Dependencies

```bash
npm install
```

#### 6. Configure Environment

```bash
nano .env
```

Paste:
```env
TIKTOK_USERNAME=your_username
TIKTOK_PASSWORD=your_password
TARGET_USERNAME=target_user
DM_MESSAGE=hey! keeping the streak 💅
HEADLESS=true
```

Save with `Ctrl+X`, `Y`, `Enter`

#### 7. Test Run

```bash
node send-dm.js
```

#### 8. Set Up Daily Cron Job

```bash
# Edit cron
crontab -e

# Add this line (runs daily at 10 AM):
0 10 * * * cd ~/autoberapi && node send-dm.js >> ~/autoberapi/cron.log 2>&1

# Save and exit
```

#### 9. Keep It Running with PM2 (Optional)

```bash
# Install PM2
sudo npm install -g pm2

# Create a script that runs on schedule
pm2 start send-dm.js --cron "0 10 * * *" --name autoberapi

# Make it run on server restart
pm2 startup
pm2 save
```

#### 10. Check Logs

```bash
# View cron log
tail -f ~/autoberapi/cron.log

# View PM2 logs
pm2 logs autoberapi
```

---

## Option 3: Railway.app (Easy but Paid after trial)

Easiest deployment, but costs after free trial.

### Setup:

1. Go to https://railway.app/
2. Connect GitHub account
3. Deploy your repo
4. Add environment variables in Railway dashboard
5. Set up cron with Railway's built-in scheduler

---

## Option 4: Keep PC On + Task Scheduler

If you want to keep your PC on and just automate it:

### Windows Task Scheduler:

1. Open Task Scheduler
2. Create Basic Task
3. Name: "AutoBerapi Daily"
4. Trigger: Daily at your preferred time
5. Action: Start a program
   - Program: `cmd.exe`
   - Arguments: `/c cd C:\Users\muaz\tiktok-streak-bot && npm run send`
6. Finish

Your PC needs to stay on, but the app doesn't need to be open.

---

## Comparison:

| Option | Cost | Ease | PC Off? | Best For |
|--------|------|------|---------|----------|
| **GitHub Actions** | FREE | ⭐⭐⭐⭐ | ✅ Yes | Most users |
| **Oracle Cloud** | FREE | ⭐⭐⭐ | ✅ Yes | Full control |
| **Railway** | $5+/mo | ⭐⭐⭐⭐⭐ | ✅ Yes | Easy setup |
| **Task Scheduler** | FREE | ⭐⭐⭐⭐⭐ | ❌ No | PC stays on |

---

## Recommended: GitHub Actions

For most people, **GitHub Actions is the best option**:
- Completely free
- No server management
- Works when PC is off
- Easy to set up

Just push your code, add secrets, and it runs automatically!
