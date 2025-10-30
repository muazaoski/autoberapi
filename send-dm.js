import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Configuration
const config = {
  username: process.env.TIKTOK_USERNAME,
  password: process.env.TIKTOK_PASSWORD,
  targetUsername: process.env.TARGET_USERNAME,
  message: process.env.DM_MESSAGE || "hey! keeping the streak alive 💅",
  headless: process.env.HEADLESS === 'true',
};

// Validate config
if (!config.username || !config.password || !config.targetUsername) {
  console.error('❌ Missing required environment variables!');
  console.error('Make sure to copy .env.example to .env and fill in your details');
  process.exit(1);
}

async function sendTikTokDM() {
  console.log('🚀 Starting TikTok Streak Bot...');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
      defaultViewport: {
        width: 1280,
        height: 720
      }
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📱 Navigating to TikTok...');
    await page.goto('https://www.tiktok.com/login', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });

    // Wait a bit for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔐 Attempting to log in...');
    
    // Try different login methods
    console.log('🔍 Looking for login form...');
    
    // Wait a bit for page to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Click on "Use phone / email / username" option first
    console.log('🖱️ Clicking "Use phone / email / username" option...');
    
    // First, let's find all elements with data-e2e="channel-item" and check their text
    const channelItems = await page.$$('[data-e2e="channel-item"]');
    console.log(`Found ${channelItems.length} channel items`);
    
    let clicked = false;
    for (let i = 0; i < channelItems.length; i++) {
      const text = await channelItems[i].evaluate(el => el.textContent?.trim());
      console.log(`Channel item ${i + 1}: "${text}"`);
      
      if (text && text.includes('Use phone / email / username')) {
        console.log('✅ Found the correct login option!');
        await channelItems[i].click();
        console.log('✅ Clicked "Use phone / email / username" option');
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      console.log('⚠️ Could not find "Use phone / email / username" option, trying alternative selectors...');
      // Try alternative selectors
      const altSelectors = [
        'div:has-text("Use phone / email / username")',
        'div[class*="channel-item"]:has-text("Use phone")',
        'div[role="link"]:has-text("Use phone")',
        'div:has-text("phone / email")'
      ];
      
      for (const selector of altSelectors) {
        try {
          const element = await page.waitForSelector(selector, { timeout: 2000 });
          if (element) {
            await element.click();
            console.log(`✅ Clicked login option with selector: ${selector}`);
            clicked = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
    }
    
    if (!clicked) {
      throw new Error('Could not find "Use phone / email / username" option');
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Now we need to click "Log in with email or username" to get to username/password form
    console.log('🖱️ Looking for "Log in with email or username" option...');
    try {
      const emailLoginOption = await page.waitForSelector('a[href="/login/phone-or-email/email"]', { timeout: 5000 });
      await emailLoginOption.click();
      console.log('✅ Clicked "Log in with email or username" option');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.log('⚠️ Could not find email login option, trying alternative selectors...');
      // Try alternative selectors
      const emailSelectors = [
        'a:has-text("Log in with email or username")',
        'a[href*="email"]',
        'a[href*="username"]',
        'button:has-text("email or username")',
        'div:has-text("email or username")'
      ];
      
      let clicked = false;
      for (const selector of emailSelectors) {
        try {
          const element = await page.waitForSelector(selector, { timeout: 2000 });
          if (element) {
            await element.click();
            console.log(`✅ Clicked email login option with selector: ${selector}`);
            clicked = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!clicked) {
        throw new Error('Could not find "Log in with email or username" option');
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Try to find username/email input with multiple possible selectors
    const usernameSelectors = [
      'input[name="username"]',
      'input[placeholder*="Email"]', 
      'input[placeholder*="username"]',
      'input[placeholder*="email"]',
      'input[type="text"]',
      'input[data-e2e="login-username"]',
      'input[data-e2e="login-email"]'
    ];
    
    let usernameInput = null;
    for (const selector of usernameSelectors) {
      try {
        usernameInput = await page.waitForSelector(selector, { timeout: 2000 });
        if (usernameInput) {
          console.log(`✅ Found username input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!usernameInput) {
      throw new Error('Could not find username/email input field. TikTok may have changed their login page.');
    }
    
    await usernameInput.type(config.username, { delay: 100 });
    
    console.log('📝 Entered username/email');
    
    // Find and fill password
    const passwordSelectors = [
      'input[type="password"]',
      'input[data-e2e="login-password"]',
      'input[placeholder*="password"]',
      'input[placeholder*="Password"]'
    ];
    
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      try {
        passwordInput = await page.waitForSelector(selector, { timeout: 2000 });
        if (passwordInput) {
          console.log(`✅ Found password input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!passwordInput) {
      throw new Error('Could not find password input field.');
    }
    
    await passwordInput.type(config.password, { delay: 100 });
    console.log('🔑 Entered password');
    
    // Click login button
    const loginButtonSelectors = [
      'button[data-e2e="login-button"]',
      'button[type="submit"]',
      'button[data-e2e="login-submit-button"]',
      'button:has-text("Log in")',
      'button:has-text("Login")',
      'button:has-text("Sign in")'
    ];
    
    let loginButton = null;
    for (const selector of loginButtonSelectors) {
      try {
        loginButton = await page.waitForSelector(selector, { timeout: 2000 });
        if (loginButton) {
          console.log(`✅ Found login button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!loginButton) {
      throw new Error('Could not find login button.');
    }
    
    await loginButton.click();
    
    console.log('⏳ Waiting for login to complete...');
    
    // Wait for navigation after login (with better error handling)
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    } catch (e) {
      console.log('⚠️ Navigation timeout, but login might have succeeded. Continuing...');
      // Wait a bit more and continue
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Check if we need to handle 2FA or verification
    const currentUrl = page.url();
    if (currentUrl.includes('verification') || currentUrl.includes('captcha')) {
      console.log('⚠️ CAPTCHA or verification detected!');
      console.log('🤖 You might need to handle this manually or use a different approach');
      console.log('💡 Tip: Try running with HEADLESS=false to see what\'s happening');
      
      // Wait for user to manually complete verification if not headless
      if (!config.headless) {
        console.log('⏸️ Waiting 60 seconds for you to complete verification...');
        await new Promise(resolve => setTimeout(resolve, 60000));
      } else {
        throw new Error('Verification required - cannot continue in headless mode');
      }
    }
    
    console.log('✅ Login successful!');
    
    // Navigate to messages/DMs
    console.log('💬 Navigating to messages...');
    await page.goto('https://www.tiktok.com/messages', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Search for the target user or find their conversation
    console.log(`🔍 Looking for conversation with @${config.targetUsername} (nickname: ayen)...`);
    
    // Look for existing conversation with "ayen"
    console.log('🔍 Looking for existing conversation with "ayen"...');
    const chatListItems = await page.$$('[data-e2e="chat-list-item"]');
    console.log(`Found ${chatListItems.length} chat list items`);
    
    let foundConversation = false;
    for (let i = 0; i < chatListItems.length; i++) {
      const text = await chatListItems[i].evaluate(el => el.textContent?.trim());
      console.log(`Chat item ${i + 1}: "${text}"`);
      
      if (text && text.toLowerCase().includes('ayen')) {
        console.log('✅ Found conversation with "ayen"!');
        try {
          await chatListItems[i].click();
          foundConversation = true;
          break;
        } catch (clickError) {
          console.log('⚠️ Direct click failed, trying alternative click method...');
          // Try clicking the parent element or using evaluate
          try {
            await chatListItems[i].evaluate(el => el.click());
            foundConversation = true;
            break;
          } catch (evaluateError) {
            console.log('⚠️ Evaluate click also failed, trying to find parent clickable element...');
            // Try to find a clickable parent
            const clickableParent = await chatListItems[i].evaluateHandle(el => {
              let current = el;
              while (current && current !== document.body) {
                if (current.tagName === 'A' || current.tagName === 'BUTTON' || 
                    current.getAttribute('role') === 'button' || 
                    current.getAttribute('tabindex') !== null) {
                  return current;
                }
                current = current.parentElement;
              }
              return null;
            });
            
            if (clickableParent) {
              await clickableParent.click();
              foundConversation = true;
              break;
            }
          }
        }
      }
    }
    
    if (!foundConversation) {
      console.log('⚠️ Could not find existing conversation, trying search...');
      
      // Try to find search input
      const searchSelector = 'input[placeholder*="Search"], input[data-e2e="search-user-input"]';
      try {
        await page.waitForSelector(searchSelector, { timeout: 5000 });
        // Search for their nickname "ayen" instead of username
        await page.type(searchSelector, "ayen", { delay: 100 });
        console.log('🔍 Searching for "ayen"...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Click on the user from search results
        const userResult = await page.waitForSelector(`[data-e2e="search-user-result"]`, { timeout: 5000 });
        await userResult.click();
        foundConversation = true;
      } catch (e) {
        console.log('⚠️ Search also failed');
        throw new Error('Could not find conversation with "ayen"');
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find message input and send message
    console.log('✍️ Sending message...');
    
    // Wait a bit for the chat to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Try multiple selectors for message input
    const messageInputSelectors = [
      'textarea[placeholder*="message"]',
      'div[contenteditable="true"]',
      'input[data-e2e="message-input"]',
      'textarea[data-e2e="message-input"]',
      'div[data-e2e="message-input"]',
      'input[placeholder*="Message"]',
      'textarea[placeholder*="Message"]',
      'div[role="textbox"]',
      'input[type="text"]'
    ];
    
    let messageInput = null;
    for (const selector of messageInputSelectors) {
      try {
        messageInput = await page.waitForSelector(selector, { timeout: 2000 });
        if (messageInput) {
          console.log(`✅ Found message input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!messageInput) {
      throw new Error('Could not find message input field');
    }
    
    await messageInput.type(config.message, { delay: 50 });
    
    console.log('📝 Message typed, pressing Enter to send...');
    
    // Press Enter to send the message
    await page.keyboard.press('Enter');
    
    console.log('✅ Message sent successfully!');
    console.log(`📤 Sent: "${config.message}"`);
    console.log('🔥 Streak maintained! W behavior fr fr');
    
    // Wait a bit to see the message sent
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take a screenshot for proof
    const screenshotPath = join(__dirname, 'last-dm-screenshot.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);
    
  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    console.error('💀 Stack:', error.stack);
    
    if (browser) {
      const screenshotPath = join(__dirname, 'error-screenshot.png');
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          await pages[0].screenshot({ path: screenshotPath });
          console.log(`📸 Error screenshot saved to: ${screenshotPath}`);
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
sendTikTokDM()
  .then(() => {
    console.log('🎉 Bot completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💀 Fatal error:', error);
    process.exit(1);
  });

