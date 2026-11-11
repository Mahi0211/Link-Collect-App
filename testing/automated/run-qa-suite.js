import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5070';
const USER_EMAIL = 'lionelmahi9@gmail.com';
const USER_PASS = 'Mahin@99';

async function run() {
  console.log('=== Starting LinkCollect QA Automation Suite ===');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('  [Browser Console Error]:', msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
    console.log('  [Browser Page Error]:', err.message);
  });

  try {
    console.log('\n--- Test 1: Navigation to Login Page ---');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    console.log('Page loaded. URL:', page.url(), 'Title:', await page.title());

    // Take screenshot of Login page
    await page.screenshot({ path: 'testing/bug-screenshots/login-page.png' });

    console.log('\n--- Test 2: Switch to Sign In Tab ---');
    const signInTab = page.locator('button:has-text("Sign In")').first();
    if (await signInTab.isVisible()) {
      await signInTab.click();
      await page.waitForTimeout(500);
    }

    console.log('\n--- Test 3: Perform Login as Lionel Mahi ---');
    // Find email and password inputs
    const emailInput = page.locator('input[type="email"]').first();
    const passInput = page.locator('input[type="password"]').first();
    await emailInput.fill(USER_EMAIL);
    await passInput.fill(USER_PASS);

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(1500);

    console.log('Post-login URL:', page.url());
    await page.screenshot({ path: 'testing/bug-screenshots/dashboard-loaded.png' });

    console.log('\n--- Test 4: Open Profile / Edit Profile Page ---');
    // Look for user profile button or avatar or menu
    const profileBtn = page.locator('text=Profile').or(page.locator('[title*="Profile"]')).or(page.locator('button:has-text("Lionel Mahi")')).or(page.locator('text=Lionel Mahi')).first();
    if (await profileBtn.isVisible()) {
      console.log('Found profile button, clicking...');
      await profileBtn.click();
      await page.waitForTimeout(500);

      const editProfileOpt = page.locator('text=Edit Profile').or(page.locator('text=Profile & Settings')).first();
      if (await editProfileOpt.isVisible()) {
        console.log('Found Edit Profile option, clicking...');
        await editProfileOpt.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'testing/bug-screenshots/edit-profile-view.png' });
      }
    }

    console.log('\nConsole Errors encountered during run:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log(consoleErrors);
    }

  } catch (err) {
    console.error('Test run failed:', err);
  } finally {
    await browser.close();
    console.log('=== QA Automation Suite Completed ===');
  }
}

run();
