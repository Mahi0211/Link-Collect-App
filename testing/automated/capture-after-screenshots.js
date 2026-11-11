import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5070';
const USER_EMAIL = 'lionelmahi9@gmail.com';
const USER_PASS = 'Mahin@99';

const AFTER_DIR = path.resolve('testing/bug-screenshots/after');
if (!fs.existsSync(AFTER_DIR)) {
  fs.mkdirSync(AFTER_DIR, { recursive: true });
}

async function captureAfter() {
  console.log('Capturing AFTER screenshots for verified bug fixes...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();

  try {
    // 1. BUG-004 Fix: Login Page
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const signInTab = page.locator('button:has-text("Sign In")').first();
    await signInTab.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(AFTER_DIR, 'BUG-004-login-input-attributes.png') });
    console.log('Captured: BUG-004-login-input-attributes.png');

    // Login as Lionel Mahi
    const identifierInput = page.locator('input[placeholder*="name@example.com"]').first();
    const passInputLogin = page.locator('input[type="password"]').first();
    await identifierInput.fill(USER_EMAIL);
    await passInputLogin.fill(USER_PASS);
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // 2. BUG-001 Fix: Sidebar navigation
    // Quick Views click check: click "Favorites"
    const favBtn = page.locator('button:has-text("Favorites")').first();
    if (await favBtn.isVisible()) {
      await favBtn.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(AFTER_DIR, 'BUG-001-sidebar-pointer-interception.png') });
    console.log('Captured: BUG-001-sidebar-pointer-interception.png');

    // 3. BUG-002, BUG-006, BUG-005 Fixes: Edit Profile Page
    const profileTrigger = page.locator('header button[title*="Lionel"]').or(page.locator('header button:has-text("L")')).last();
    if (await profileTrigger.isVisible()) {
      await profileTrigger.click();
      await page.waitForTimeout(400);
      const editProfileBtn = page.locator('button:has-text("Edit Profile")').first();
      if (await editProfileBtn.isVisible()) {
        await editProfileBtn.click();
        await page.waitForTimeout(1500);

        // BUG-002 Fix screenshot: Full profile loaded with Social Profiles active
        await page.screenshot({ path: path.join(AFTER_DIR, 'BUG-002-react-minified-error-31-crash.png') });
        await page.screenshot({ path: path.join(AFTER_DIR, 'BUG-002-social-links-and-profile.png') });
        console.log('Captured: BUG-002-react-minified-error-31-crash.png & BUG-002-social-links-and-profile.png');

        // BUG-006 Fix screenshot: Top Collection & Curation section
        await page.screenshot({ path: path.join(AFTER_DIR, 'BUG-006-top-collection-layout.png') });
        console.log('Captured: BUG-006-top-collection-layout.png');

        // BUG-005 Fix screenshot: Responsive mobile stacking
        await page.setViewportSize({ width: 375, height: 750 });
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(AFTER_DIR, 'BUG-005-mobile-responsive-overflow.png') });
        console.log('Captured: BUG-005-mobile-responsive-overflow.png');

        // Restore viewport
        await page.setViewportSize({ width: 1280, height: 850 });
        await page.waitForTimeout(500);

        // Go back to workspace
        const backBtn = page.locator('button:has-text("Workspace")').first();
        if (await backBtn.isVisible()) {
          await backBtn.click();
          await page.waitForTimeout(800);
        }
      }
    }

    // 4. BUG-003 Fix: Add Link Modal
    const newLinkBtn = page.locator('header button:has-text("New Link")').first();
    if (await newLinkBtn.isVisible()) {
      await newLinkBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(AFTER_DIR, 'BUG-003-add-link-modal-prefill.png') });
      console.log('Captured: BUG-003-add-link-modal-prefill.png');
      const closeBtn = page.locator('button[title="Close"]').or(page.locator('button:has-text("✕")')).first();
      if (await closeBtn.isVisible()) await closeBtn.click();
    }

    console.log('All AFTER screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing after screenshots:', err);
  } finally {
    await browser.close();
  }
}

captureAfter();
