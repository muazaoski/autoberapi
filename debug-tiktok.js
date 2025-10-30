import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function debugTikTokLogin() {
  console.log('🔍 Starting TikTok Login Debug...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Always visible for debugging
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
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: join(__dirname, 'debug-login-page.png') });
    
    console.log('🔍 Analyzing page content...');
    
    // Get page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Get current URL
    const url = page.url();
    console.log(`🌐 Current URL: ${url}`);
    
    // Look for all input fields
    const inputs = await page.$$eval('input', inputs => 
      inputs.map(input => ({
        type: input.type,
        name: input.name,
        placeholder: input.placeholder,
        id: input.id,
        className: input.className,
        'data-e2e': input.getAttribute('data-e2e'),
        'data-testid': input.getAttribute('data-testid')
      }))
    );
    
    console.log('📝 Found input fields:');
    inputs.forEach((input, index) => {
      console.log(`  ${index + 1}. Type: ${input.type}, Name: ${input.name}, Placeholder: ${input.placeholder}, ID: ${input.id}, Data-e2e: ${input['data-e2e']}`);
    });
    
    // Look for all buttons
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(button => ({
        text: button.textContent?.trim(),
        type: button.type,
        className: button.className,
        'data-e2e': button.getAttribute('data-e2e'),
        'data-testid': button.getAttribute('data-testid')
      }))
    );
    
    console.log('🔘 Found buttons:');
    buttons.forEach((button, index) => {
      console.log(`  ${index + 1}. Text: "${button.text}", Type: ${button.type}, Data-e2e: ${button['data-e2e']}`);
    });
    
    // Look for forms
    const forms = await page.$$eval('form', forms => 
      forms.map(form => ({
        action: form.action,
        method: form.method,
        className: form.className,
        'data-e2e': form.getAttribute('data-e2e')
      }))
    );
    
    console.log('📋 Found forms:');
    forms.forEach((form, index) => {
      console.log(`  ${index + 1}. Action: ${form.action}, Method: ${form.method}, Data-e2e: ${form['data-e2e']}`);
    });
    
    // Check if there are any login-related elements
    const loginElements = await page.$$eval('[class*="login"], [class*="Login"], [id*="login"], [id*="Login"]', elements => 
      elements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        text: el.textContent?.trim().substring(0, 100)
      }))
    );
    
    console.log('🔐 Found login-related elements:');
    loginElements.forEach((el, index) => {
      console.log(`  ${index + 1}. ${el.tagName}: ${el.className} (${el.id}) - "${el.text}"`);
    });
    
    console.log('✅ Debug complete! Check debug-login-page.png for visual reference.');
    console.log('💡 Use this info to update the selectors in send-dm.js');
    
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

debugTikTokLogin();

