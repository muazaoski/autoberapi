import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Use stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read config from temp file
const configPath = process.argv[2];
if (!configPath) {
  console.error('❌ No config file provided');
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));

// Validate config
if (!config.username || !config.password) {
  console.error('❌ Missing TikTok credentials');
  process.exit(1);
}

if (!config.targets || config.targets.length === 0) {
  console.error('❌ No targets provided');
  process.exit(1);
}

async function sendToMultipleTargets() {
  console.log('🚀 Starting AutoBerapi Group Sender...');
  console.log(`📊 Total targets: ${config.targets.length}`);

  const cookiesPath = join(__dirname, 'tiktok-cookies.json');
  let browser;

  try {
    // Launch browser with extra anti-detection
    browser = await puppeteer.launch({
      headless: config.headless === 'true',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--lang=en-US,en;q=0.9',
      ],
      defaultViewport: {
        width: 1280,
        height: 720
      },
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();

    // Enhanced user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

    // Set extra headers to look more human
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    // Try to load existing cookies
    let needsLogin = true;
    if (existsSync(cookiesPath)) {
      console.log('🍪 Found saved cookies, attempting to restore session...');
      try {
        const cookies = JSON.parse(readFileSync(cookiesPath, 'utf8'));
        await page.setCookie(...cookies);

        // Test if cookies are still valid
        await page.goto('https://www.tiktok.com/messages', {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check if we're logged in by looking for logout/profile indicators
        const currentUrl = page.url();
        if (currentUrl.includes('/messages') && !currentUrl.includes('/login')) {
          console.log('✅ Session restored successfully! Skipping login.');
          needsLogin = false;
        } else {
          console.log('⚠️ Session expired, need to login again');
        }
      } catch (error) {
        console.log('⚠️ Could not restore session, will login:', error.message);
      }
    }

    if (needsLogin) {
      // Login to TikTok
      console.log('📱 Navigating to TikTok login...');
      await page.goto('https://www.tiktok.com/login', {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('🔐 Logging in...');

    // Click on "Use phone / email / username" option
    const channelItems = await page.$$('[data-e2e="channel-item"]');
    let clicked = false;
    for (let i = 0; i < channelItems.length; i++) {
      const text = await channelItems[i].evaluate(el => el.textContent?.trim());
      if (text && text.includes('Use phone / email / username')) {
        await channelItems[i].click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      throw new Error('Could not find login option');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click "Log in with email or username"
    try {
      const emailLoginOption = await page.waitForSelector('a[href="/login/phone-or-email/email"]', { timeout: 5000 });
      await emailLoginOption.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.log('⚠️ Alternative login method...');
    }

    // Enter username
    const usernameSelectors = [
      'input[name="username"]',
      'input[placeholder*="Email"]',
      'input[placeholder*="username"]',
      'input[type="text"]'
    ];

    let usernameInput = null;
    for (const selector of usernameSelectors) {
      try {
        usernameInput = await page.waitForSelector(selector, { timeout: 2000 });
        if (usernameInput) break;
      } catch (e) {}
    }

    if (!usernameInput) {
      throw new Error('Could not find username input');
    }

    await usernameInput.type(config.username, { delay: 100 });
    console.log('📝 Entered username');

    // Enter password
    const passwordInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await passwordInput.type(config.password, { delay: 100 });
    console.log('🔑 Entered password');

    // Click login button
    const loginButton = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
    await loginButton.click();
    console.log('⏳ Waiting for login...');

      try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Check for CAPTCHA or verification
      const currentUrl = page.url();
      if (currentUrl.includes('verification') || currentUrl.includes('captcha')) {
        console.log('🤖 CAPTCHA detected!');

        if (config.headless === 'false') {
          console.log('⏸️ Please solve the CAPTCHA manually...');
          console.log('⏳ Waiting 120 seconds for you to complete it...');
          await new Promise(resolve => setTimeout(resolve, 120000));
        } else {
          console.log('❌ CAPTCHA detected in headless mode!');
          console.log('💡 Solution: Run with headless mode OFF, solve CAPTCHA once, then cookies will be saved');
          throw new Error('CAPTCHA detected - cannot continue in headless mode. Run with visible browser first.');
        }
      }

      console.log('✅ Login successful!');

      // Save cookies for future use
      console.log('🍪 Saving session cookies...');
      const cookies = await page.cookies();
      writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
      console.log('✅ Cookies saved! Future runs will skip login.');
    }

    // Loop through each target
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < config.targets.length; i++) {
      const target = config.targets[i];
      console.log(`\n[${i + 1}/${config.targets.length}] Processing target: @${target.username}`);

      try {
        // Navigate to messages
        await page.goto('https://www.tiktok.com/messages', {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Search for conversation
        console.log(`🔍 Looking for @${target.username}...`);
        const chatListItems = await page.$$('[data-e2e="chat-list-item"]');

        let foundConversation = false;
        for (let j = 0; j < chatListItems.length; j++) {
          const text = await chatListItems[j].evaluate(el => el.textContent?.trim());
          if (text && text.toLowerCase().includes(target.username.toLowerCase())) {
            console.log(`✅ Found conversation with @${target.username}`);
            await chatListItems[j].click();
            foundConversation = true;
            break;
          }
        }

        if (!foundConversation) {
          console.log(`⚠️ Conversation not found, trying search...`);
          // Try search
          const searchSelector = 'input[placeholder*="Search"], input[data-e2e="search-user-input"]';
          try {
            await page.waitForSelector(searchSelector, { timeout: 5000 });
            await page.type(searchSelector, target.username, { delay: 100 });
            await new Promise(resolve => setTimeout(resolve, 2000));

            const userResult = await page.waitForSelector(`[data-e2e="search-user-result"]`, { timeout: 5000 });
            await userResult.click();
            foundConversation = true;
          } catch (e) {
            throw new Error(`Could not find conversation with @${target.username}`);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Send message
        console.log(`✍️ Sending message to @${target.username}...`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        const messageInputSelectors = [
          'textarea[placeholder*="message"]',
          'div[contenteditable="true"]',
          'input[data-e2e="message-input"]',
          'div[role="textbox"]'
        ];

        let messageInput = null;
        for (const selector of messageInputSelectors) {
          try {
            messageInput = await page.waitForSelector(selector, { timeout: 2000 });
            if (messageInput) break;
          } catch (e) {}
        }

        if (!messageInput) {
          throw new Error('Could not find message input');
        }

        await messageInput.type(target.message, { delay: 50 });
        await page.keyboard.press('Enter');

        console.log(`✅ Message sent to @${target.username}`);
        console.log(`📤 "${target.message}"`);

        successCount++;

        // Wait between targets to avoid rate limiting
        if (i < config.targets.length - 1) {
          console.log('⏸️ Waiting before next target...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error) {
        console.error(`❌ Failed to send to @${target.username}: ${error.message}`);
        failCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Total: ${config.targets.length}`);
    console.log('='.repeat(50));

    // Take screenshot
    const screenshotPath = join(__dirname, 'last-group-screenshot.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

  } catch (error) {
    console.error('❌ Error occurred:', error.message);

    if (browser) {
      const screenshotPath = join(__dirname, 'error-screenshot.png');
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          await pages[0].screenshot({ path: screenshotPath });
          console.log(`📸 Error screenshot saved: ${screenshotPath}`);
        }
      } catch (screenshotError) {
        console.error('Could not take error screenshot:', screenshotError.message);
      }
    }

    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🚪 Browser closed');
    }
  }
}

// Run the bot
sendToMultipleTargets()
  .then(() => {
    console.log('🎉 Group sender completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💀 Fatal error:', error);
    process.exit(1);
  });
