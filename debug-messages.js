import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const config = {
  username: process.env.TIKTOK_USERNAME,
  password: process.env.TIKTOK_PASSWORD,
  targetUsername: process.env.TARGET_USERNAME,
  message: process.env.DM_MESSAGE || "hey! keeping the streak alive 💅",
  headless: false, // Always visible for debugging
};

async function debugMessages() {
  console.log('🔍 Starting TikTok Messages Debug...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
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
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📱 Navigating to TikTok login...');
    await page.goto('https://www.tiktok.com/login', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Click on "Use phone / email / username" option first
    console.log('🖱️ Clicking "Use phone / email / username" option...');
    const channelItems = await page.$$('[data-e2e="channel-item"]');
    let clicked = false;
    for (let i = 0; i < channelItems.length; i++) {
      const text = await channelItems[i].evaluate(el => el.textContent?.trim());
      if (text && text.includes('Use phone / email / username')) {
        await channelItems[i].click();
        console.log('✅ Clicked "Use phone / email / username" option');
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      throw new Error('Could not find login option');
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Click "Log in with email or username"
    console.log('🖱️ Clicking "Log in with email or username" option...');
    const emailLoginOption = await page.waitForSelector('a[href="/login/phone-or-email/email"]', { timeout: 5000 });
    await emailLoginOption.click();
    console.log('✅ Clicked "Log in with email or username" option');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fill login form
    console.log('🔐 Filling login form...');
    const usernameInput = await page.waitForSelector('input[name="username"]', { timeout: 5000 });
    await usernameInput.type(config.username, { delay: 100 });
    
    const passwordInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await passwordInput.type(config.password, { delay: 100 });
    
    const loginButton = await page.waitForSelector('button[data-e2e="login-button"]', { timeout: 5000 });
    await loginButton.click();
    
    console.log('⏳ Waiting for login...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Navigate to messages
    console.log('💬 Navigating to messages...');
    await page.goto('https://www.tiktok.com/messages', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('📸 Taking screenshot of messages page...');
    await page.screenshot({ path: join(__dirname, 'debug-messages-page.png') });
    
    console.log('🔍 Analyzing messages page...');
    
    // Get page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(`📄 Page title: ${title}`);
    console.log(`🌐 Current URL: ${url}`);
    
    // Look for search input
    const searchInputs = await page.$$eval('input', inputs => 
      inputs.map(input => ({
        type: input.type,
        placeholder: input.placeholder,
        className: input.className,
        'data-e2e': input.getAttribute('data-e2e')
      }))
    );
    
    console.log('🔍 Found input fields:');
    searchInputs.forEach((input, index) => {
      console.log(`  ${index + 1}. Type: ${input.type}, Placeholder: "${input.placeholder}", Data-e2e: ${input['data-e2e']}`);
    });
    
    // Look for conversation elements
    const conversationElements = await page.$$eval('[class*="conversation"], [class*="message"], [class*="chat"]', elements => 
      elements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        text: el.textContent?.trim().substring(0, 100)
      }))
    );
    
    console.log('💬 Found conversation elements:');
    conversationElements.forEach((el, index) => {
      console.log(`  ${index + 1}. ${el.tagName}: ${el.className} - "${el.text}"`);
    });
    
    // Look for any clickable elements that might be conversations
    const clickableElements = await page.$$eval('a, button, div[role="button"], div[tabindex]', elements => 
      elements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        text: el.textContent?.trim().substring(0, 50),
        'data-e2e': el.getAttribute('data-e2e')
      }))
    );
    
    console.log('🖱️ Found clickable elements:');
    clickableElements.forEach((el, index) => {
      if (el.text && el.text.length > 0) {
        console.log(`  ${index + 1}. ${el.tagName}: "${el.text}" (${el['data-e2e']})`);
      }
    });
    
    console.log('✅ Debug complete! Check debug-messages-page.png for visual reference.');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    if (browser) {
      console.log('⏸️ Keeping browser open for 30 seconds so you can see the page...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      await browser.close();
    }
  }
}

debugMessages();

