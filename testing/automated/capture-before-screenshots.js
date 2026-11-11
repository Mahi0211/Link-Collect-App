import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5070';
const USER_EMAIL = 'lionelmahi9@gmail.com';
const USER_PASS = 'Mahin@99';

const BEFORE_DIR = path.resolve('testing/bug-screenshots/before');
if (!fs.existsSync(BEFORE_DIR)) {
  fs.mkdirSync(BEFORE_DIR, { recursive: true });
}

async function captureBefore() {
  console.log('Capturing BEFORE screenshots of reproducible bugs...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();

  try {
    // 1. BUG-004: Login Page Input Type
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const signInTab = page.locator('button:has-text("Sign In")').first();
    await signInTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(BEFORE_DIR, 'BUG-004-login-input-attributes.png') });
    console.log('Captured: BUG-004-login-input-attributes.png');

    // Login as Lionel Mahi
    const identifierInput = page.locator('input[placeholder*="name@example.com"]').first();
    const passInputLogin = page.locator('input[type="password"]').first();
    await identifierInput.fill(USER_EMAIL);
    await passInputLogin.fill(USER_PASS);
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // 2. BUG-001: Sidebar click interception
    // In current Sidebar.jsx, Quick Views have inner div onClick={onOpenEditProfile}
    await page.screenshot({ path: path.join(BEFORE_DIR, 'BUG-001-sidebar-pointer-interception.png') });
    console.log('Captured: BUG-001-sidebar-pointer-interception.png');

    // 3. Open Edit Profile Page to check BUG-002, BUG-005, BUG-006
    // Trigger user dropdown from header
    const profileTrigger = page.locator('header button[title*="Lionel"]').or(page.locator('header button:has-text("L")')).last();
    if (await profileTrigger.isVisible()) {
      await profileTrigger.click();
      await page.waitForTimeout(400);
      const editProfileBtn = page.locator('button:has-text("Edit Profile")').first();
      if (await editProfileBtn.isVisible()) {
        await editProfileBtn.click();
        await page.waitForTimeout(1500);

        // Capture Desktop view of EditProfilePage
        await page.screenshot({ path: path.join(BEFORE_DIR, 'BUG-002-social-links-and-profile.png') });
        console.log('Captured: BUG-002-social-links-and-profile.png');

        await page.screenshot({ path: path.join(BEFORE_DIR, 'BUG-006-top-collection-layout.png') });
        console.log('Captured: BUG-006-top-collection-layout.png');

        // Capture Mobile (375px) squished 60/40 layout (BUG-005)
        await page.setViewportSize({ width: 375, height: 750 });
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(BEFORE_DIR, 'BUG-005-mobile-responsive-overflow.png') });
        console.log('Captured: BUG-005-mobile-responsive-overflow.png');

        // Restore viewport
        await page.setViewportSize({ width: 1280, height: 850 });
        await page.waitForTimeout(500);

        // Go back to main workspace
        const backBtn = page.locator('button:has-text("Workspace")').first();
        if (await backBtn.isVisible()) {
          await backBtn.click();
          await page.waitForTimeout(800);
        }
      }
    }

    // 4. BUG-003: Open Add Link Modal
    const addLinkBtn = page.locator('header button:has-text("New Link")').or(page.locator('header button[title*="Add Link"]')).first();
    if (await addLinkBtn.isVisible()) {
      await addLinkBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(BEFORE_DIR, 'BUG-003-collection-name-mismatch.png') });
      console.log('Captured: BUG-003-collection-name-mismatch.png');
      const closeBtn = page.locator('button[title="Close"]').or(page.locator('button:has-text("✕")')).first();
      if (await closeBtn.isVisible()) await closeBtn.click();
    }

    console.log('All BEFORE screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing before screenshots:', err);
  } finally {
    await browser.close();
  }
}

captureBefore();

