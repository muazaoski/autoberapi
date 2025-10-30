# TikTok Streak Bot - Windows Task Scheduler Setup
# Run this as Administrator to set up daily automation

Write-Host "🔥 Setting up TikTok Streak Bot Daily Schedule..." -ForegroundColor Cyan

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script needs to run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit
}

# Bot details
$botName = "TikTok Streak Bot"
$botPath = "C:\Users\muaz\tiktok-streak-bot\schedule-bot.bat"
$triggerTime = "10:00"  # 10 AM daily

Write-Host "📋 Bot Details:" -ForegroundColor Green
Write-Host "  Name: $botName" -ForegroundColor White
Write-Host "  Path: $botPath" -ForegroundColor White
Write-Host "  Time: $triggerTime daily" -ForegroundColor White
Write-Host ""

# Check if bot file exists
if (-not (Test-Path $botPath)) {
    Write-Host "❌ Bot file not found at: $botPath" -ForegroundColor Red
    Write-Host "Make sure you're in the right directory!" -ForegroundColor Yellow
    pause
    exit
}

# Remove existing task if it exists
Write-Host "🧹 Cleaning up existing task..." -ForegroundColor Yellow
try {
    Unregister-ScheduledTask -TaskName $botName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "✅ Removed existing task" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ No existing task found" -ForegroundColor Blue
}

# Create new scheduled task
Write-Host "⚙️ Creating new scheduled task..." -ForegroundColor Yellow

# Create trigger (daily at specified time)
$trigger = New-ScheduledTaskTrigger -Daily -At $triggerTime

# Create action (run the bot)
$action = New-ScheduledTaskAction -Execute $botPath

# Create settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Create principal (run as current user)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType InteractiveToken

# Register the task
try {
    Register-ScheduledTask -TaskName $botName -Trigger $trigger -Action $action -Settings $settings -Principal $principal -Description "Automatically sends TikTok DM to maintain streak daily"
    Write-Host "✅ Scheduled task created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create scheduled task: $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit
}

Write-Host ""
Write-Host "🎉 SETUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📅 Your bot will run daily at $triggerTime" -ForegroundColor Cyan
Write-Host "🔍 To manage the task:" -ForegroundColor Cyan
Write-Host "   1. Open Task Scheduler" -ForegroundColor White
Write-Host "   2. Look for '$botName'" -ForegroundColor White
Write-Host "   3. Right-click to enable/disable/modify" -ForegroundColor White
Write-Host ""
Write-Host "🧪 To test manually:" -ForegroundColor Cyan
Write-Host "   Double-click: $botPath" -ForegroundColor White
Write-Host ""
Write-Host "📸 Screenshots will be saved in: C:\Users\muaz\tiktok-streak-bot\" -ForegroundColor Cyan
Write-Host ""

# Test the bot file
Write-Host "🧪 Testing bot file..." -ForegroundColor Yellow
if (Test-Path $botPath) {
    Write-Host "✅ Bot file is accessible" -ForegroundColor Green
} else {
    Write-Host "❌ Bot file not accessible" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

