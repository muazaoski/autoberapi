# TikTok Streak Bot - Simple Windows Task Scheduler Setup
Write-Host "🔥 Setting up TikTok Streak Bot Daily Schedule..." -ForegroundColor Cyan

# Bot details
$botName = "TikTok Streak Bot"
$botPath = "C:\Users\muaz\tiktok-streak-bot\schedule-bot.bat"
$triggerTime = "10:00"

Write-Host "📋 Bot Details:" -ForegroundColor Green
Write-Host "  Name: $botName" -ForegroundColor White
Write-Host "  Path: $botPath" -ForegroundColor White
Write-Host "  Time: $triggerTime daily" -ForegroundColor White
Write-Host ""

# Check if bot file exists
if (-not (Test-Path $botPath)) {
    Write-Host "❌ Bot file not found at: $botPath" -ForegroundColor Red
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
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

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
Write-Host "🔍 To manage: Open Task Scheduler and look for '$botName'" -ForegroundColor Cyan
Write-Host "🧪 To test: Double-click $botPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
Read-Host
