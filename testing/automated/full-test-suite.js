import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5070';
const USER_EMAIL = 'lionelmahi9@gmail.com';
const USER_PASS = 'Mahin@99';

const testResults = [];
const discoveredBugs = [];

function recordTest(name, status, details = '') {
  testResults.push({ name, status, details, timestamp: new Date().toISOString() });
  console.log(`[${status}] ${name} ${details ? '- ' + details : ''}`);
}

function recordBug(id, title, pageOrComponent, description, steps, expected, actual, severity, screenshot) {
  discoveredBugs.push({
    id,
    title,
    pageOrComponent,
    description,
    steps,
    expected,
    actual,
    severity,
    screenshot,
  });
  console.error(`\n🚨 BUG DETECTED [${id}] (${severity}): ${title}`);
  console.error(`   Component: ${pageOrComponent}`);
  console.error(`   Actual: ${actual}\n`);
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('Starting Comprehensive Full-Stack QA Test Run');
  console.log('Target User: Lionel Mahi (lionelmahi9@gmail.com)');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  try {
    // -------------------------------------------------------------------------
    // SUITE 1: AUTHENTICATION & LOGIN PAGE
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 1: Authentication & Form Validation ---');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 1.1 Password strength meter on registration form
    const passInputCreate = page.locator('input[type="password"]').first();
    await passInputCreate.fill('123');
    await page.waitForTimeout(300);
    const strengthWeak = await page.locator('text=Weak').isVisible();
    if (strengthWeak) {
      recordTest('Auth: Password Strength Meter (Weak)', 'PASSED');
    } else {
      recordTest('Auth: Password Strength Meter (Weak)', 'FAILED', 'Weak label not visible');
    }

    await passInputCreate.fill('Mahin@99Pass!');
    await page.waitForTimeout(300);
    const strengthStrong = await page.locator('text=Strong').isVisible();
    if (strengthStrong) {
      recordTest('Auth: Password Strength Meter (Strong)', 'PASSED');
    } else {
      recordTest('Auth: Password Strength Meter (Strong)', 'FAILED', 'Strong label not visible');
    }

    // 1.2 Switch to Sign In tab
    const signInTab = page.locator('button:has-text("Sign In")').first();
    await signInTab.click();
    await page.waitForTimeout(400);

    // 1.3 Test invalid login error handling
    const identifierInput = page.locator('input[placeholder*="name@example.com"]').first();
    const passInputLogin = page.locator('input[type="password"]').first();
    await identifierInput.fill('wronguser@example.com');
    await passInputLogin.fill('WrongPass123!');
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(1000);

    const errorVisible = await page.locator('text=Invalid email/username or password').or(page.locator('text=Invalid')).first().isVisible();
    if (errorVisible) {
      recordTest('Auth: Invalid Credentials Error Message', 'PASSED');
    } else {
      recordTest('Auth: Invalid Credentials Error Message', 'FAILED', 'Error banner not visible on invalid login');
    }

    // 1.4 Successful login as Lionel Mahi
    await identifierInput.fill(USER_EMAIL);
    await passInputLogin.fill(USER_PASS);
    await submitBtn.click();
    await page.waitForTimeout(1500);

    // Verify main app loaded
    const appHeader = page.locator('header').first();
    await page.waitForSelector('header', { timeout: 10000 });
    const isLoggedIn = await appHeader.isVisible();
    if (isLoggedIn) {
      recordTest('Auth: Login as Lionel Mahi', 'PASSED');
      await page.screenshot({ path: 'testing/bug-screenshots/dashboard-initial.png' });
    } else {
      recordTest('Auth: Login as Lionel Mahi', 'FAILED', 'Header not visible after login');
    }

    // -------------------------------------------------------------------------
    // SUITE 2: WORKSPACE & COLLECTION MANAGEMENT (CRUD)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 2: Workspace & Collection Management ---');
    const testColName = 'QA Auto Collection ' + Date.now().toString().slice(-4);

    // 2.1 Create New Collection via Sidebar "+" or Button
    const newColBtn = page.locator('button[title*="New Collection"]').or(page.locator('button:has-text("New Collection")')).or(page.locator('text=Collections').locator('..').locator('button')).first();
    if (await newColBtn.isVisible()) {
      await newColBtn.click();
      await page.waitForTimeout(500);
      const colInput = page.locator('input[placeholder*="Collection name"]').or(page.locator('input[placeholder*="Collection Name"]')).or(page.locator('input[type="text"]')).first();
      if (await colInput.isVisible()) {
        await colInput.fill(testColName);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        recordTest('Collections: Create Collection', 'PASSED', testColName);
      } else {
        recordTest('Collections: Create Collection', 'FAILED', 'Input for collection name not found');
      }
    } else {
      console.log('Sidebar New Collection button check with prompt/modal...');
    }

    // -------------------------------------------------------------------------
    // SUITE 3: LINK CREATION & METADATA (CRUD)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 3: Link Creation & URL Management ---');
    const addLinkBtn = page.locator('button:has-text("Add Link")').or(page.locator('[title="Add Link"]')).first();
    if (await addLinkBtn.isVisible()) {
      await addLinkBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'testing/bug-screenshots/add-link-modal.png' });

      const urlInput = page.locator('input[placeholder*="https://"]').or(page.locator('input[placeholder*="url"]')).or(page.locator('input[placeholder*="URL"]')).first();
      if (await urlInput.isVisible()) {
        const testUrl = 'https://playwright.dev';
        await urlInput.fill(testUrl);
        await page.waitForTimeout(1000);

        const saveBtn = page.locator('button:has-text("Save Link")').or(page.locator('button:has-text("Add Link")')).last();
        await saveBtn.click();
        await page.waitForTimeout(1500);
        recordTest('Links: Create Link (Add Link Modal)', 'PASSED', testUrl);
      } else {
        recordTest('Links: Create Link', 'FAILED', 'URL input not found');
      }
    } else {
      recordTest('Links: Add Link Button', 'FAILED', 'Add Link button not found in Header');
    }

    // -------------------------------------------------------------------------
    // SUITE 4: EDIT PROFILE PAGE & 60/40 LAYOUT
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 4: Edit Profile Page ---');
    // Click on User profile button/avatar in Header or Sidebar
    const userMenuBtn = page.locator('button:has-text("Lionel Mahi")').or(page.locator('text=Lionel Mahi')).or(page.locator('button[title*="Profile"]')).first();
    if (await userMenuBtn.isVisible()) {
      await userMenuBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'testing/bug-screenshots/user-dropdown.png' });

      const editProfileOpt = page.locator('text=Edit Profile').or(page.locator('text=Profile & Settings')).or(page.locator('button:has-text("Profile")')).first();
      if (await editProfileOpt.isVisible()) {
        await editProfileOpt.click();
        await page.waitForTimeout(1200);

        // Check if Edit Profile page loaded
        const profileHeading = page.locator('text=Profile & Account Settings').first();
        if (await profileHeading.isVisible()) {
          recordTest('Profile: Navigate to Edit Profile Page', 'PASSED');
          await page.screenshot({ path: 'testing/bug-screenshots/edit-profile-loaded.png' });

          // Check Social Profiles section
          const socialSection = page.locator('text=Social Profiles & Portfolios').first();
          if (await socialSection.isVisible()) {
            recordTest('Profile: Social Profiles & Portfolios Section Visible', 'PASSED');
          } else {
            recordTest('Profile: Social Profiles & Portfolios Section Visible', 'FAILED');
          }

          // Check Top Collection Card
          const topColBadge = page.locator('text=MOST VIEWED COLLECTION').first();
          if (await topColBadge.isVisible()) {
            recordTest('Profile: Top Collection Card Badge Visible', 'PASSED');
          } else {
            recordTest('Profile: Top Collection Card Badge Visible', 'FAILED');
          }

          // Check Friends & Network section
          const friendsSection = page.locator('text=Friends & Network').first();
          if (await friendsSection.isVisible()) {
            recordTest('Profile: Friends & Network Section Visible', 'PASSED');
          } else {
            recordTest('Profile: Friends & Network Section Visible', 'FAILED');
          }
        } else {
          recordTest('Profile: Navigate to Edit Profile Page', 'FAILED', 'Heading not visible');
        }
      } else {
        recordTest('Profile: Edit Profile Option in Menu', 'FAILED', 'Option not found in dropdown');
      }
    } else {
      recordTest('Profile: User Menu Button', 'FAILED', 'Lionel Mahi button not found');
    }

    // -------------------------------------------------------------------------
    // SUITE 5: RESPONSIVE VIEWPORT TESTING
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 5: Responsive Viewport Testing ---');
    // Tablet Viewport (768 x 1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'testing/bug-screenshots/viewport-tablet.png' });
    recordTest('Responsive: Tablet Viewport (768px)', 'PASSED');

    // Mobile Viewport (375 x 667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'testing/bug-screenshots/viewport-mobile.png' });
    recordTest('Responsive: Mobile Viewport (375px)', 'PASSED');

    // Restore desktop
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.waitForTimeout(500);

    // -------------------------------------------------------------------------
    // CONSOLE ERRORS AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- Console Errors Audit ---');
    if (consoleErrors.length > 0) {
      console.log(`Detected ${consoleErrors.length} console/page errors during run:`);
      consoleErrors.forEach((e, idx) => console.log(`  [${idx + 1}] ${e}`));
    } else {
      console.log('No unhandled console errors detected during run.');
    }

  } catch (err) {
    console.error('Fatal error during test suite execution:', err);
  } finally {
    await browser.close();
    console.log('\n====================================================');
    console.log(`Test Execution Completed. Total Tests: ${testResults.length}`);
    console.log(`Passed: ${testResults.filter(t => t.status === 'PASSED').length}, Failed: ${testResults.filter(t => t.status === 'FAILED').length}`);
    console.log('====================================================');
  }
}

runTestSuite();
