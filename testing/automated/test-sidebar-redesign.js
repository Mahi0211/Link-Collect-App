import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5070';
const USER_EMAIL = 'lionelmahi9@gmail.com';
const USER_PASS = 'Mahin@99';
const SCREENSHOTS_DIR = 'd:/FBNation/LinkCollect/testing/bug-screenshots/after';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runSidebarRedesignTests() {
  console.log('=== STARTING SIDEBAR REDESIGN VERIFICATION TESTS ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();

  const results = [];
  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name} ${details ? '(' + details + ')' : ''}`);
      results.push({ name, status: 'PASS', details });
    } else {
      console.error(`[FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
      results.push({ name, status: 'FAIL', details });
    }
  }

  try {
    // 1. Login
    console.log('\n--- Step 1: Navigating to LinkCollect and logging in ---');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Switch to Sign In tab
    const signInTab = page.locator('button:has-text("Sign In")').first();
    if (await signInTab.isVisible()) {
      await signInTab.click();
      await page.waitForTimeout(400);

      const emailInput = page.locator('input[name="identifier"], input[placeholder*="name@example.com"]').first();
      const loginPassInput = page.locator('input[name="password"]').first();
      await emailInput.fill(USER_EMAIL);
      await loginPassInput.fill(USER_PASS);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
      await page.waitForSelector('aside', { timeout: 10000 });
    }

    assert('Logged in successfully', (await page.locator('aside').isVisible()));

    // 2. Verify Smart Organize removed
    console.log('\n--- Step 2: Verifying Smart Organize removed ---');
    const smartOrganize = page.locator('text="Smart Organize"');
    const smartOrganizeCount = await smartOrganize.count();
    assert('Smart Organize card removed from sidebar', smartOrganizeCount === 0, `Count: ${smartOrganizeCount}`);

    // 3. Verify Old Social removed from navigation list
    console.log('\n--- Step 3: Verifying Old Social item removed from list ---');
    const oldFriendsSharing = page.locator('button:has-text("Friends & Sharing")');
    const oldFriendsCount = await oldFriendsSharing.count();
    assert('Old Friends & Sharing item removed from list', oldFriendsCount === 0, `Count: ${oldFriendsCount}`);

    // 4. Verify 3-button quick access layout
    console.log('\n--- Step 4: Verifying 3-Button Quick-Access layout ---');
    const profileBtn = page.locator('button[title*="Profile" i]').first();
    const socialBtn = page.locator('button[title*="Social" i]').first();
    const chatBtn = page.locator('button[title*="Chat" i]').first();

    assert('Profile button is visible', await profileBtn.isVisible());
    assert('Social button is visible', await socialBtn.isVisible());
    assert('Chat button is visible', await chatBtn.isVisible());

    // Check avatar or initial inside Profile button
    const profileAvatar = profileBtn.locator('img, div');
    assert('Profile button contains avatar / initials', await profileAvatar.count() > 0);

    // Check active notification badge on Chat
    const chatBadge = chatBtn.locator('span:has-text("2")');
    assert('Chat button contains active badge ("2")', await chatBadge.isVisible());

    // Screenshot default state
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'SIDEBAR-001-redesign-default.png') });
    console.log('Saved screenshot: SIDEBAR-001-redesign-default.png');

    // 5. Test Profile Button Navigation
    console.log('\n--- Step 5: Testing Profile Button click ---');
    await profileBtn.click();
    await page.waitForTimeout(600);
    const profileHeader = page.locator('text="Profile & Account Settings"').first();
    assert('Profile button navigates to Profile Page', await profileHeader.isVisible());
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'SIDEBAR-002-profile-active.png') });
    console.log('Saved screenshot: SIDEBAR-002-profile-active.png');

    // 6. Test Social Button Click (Opens Friends Modal)
    console.log('\n--- Step 6: Testing Social Button click ---');
    await socialBtn.click();
    await page.waitForTimeout(600);
    const friendsModalHeader = page.locator('text="Friends & Network"').first();
    assert('Social button opens Friends Modal', await friendsModalHeader.isVisible());
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'SIDEBAR-003-social-modal-open.png') });
    console.log('Saved screenshot: SIDEBAR-003-social-modal-open.png');

    // Close Friends Modal
    const closeModalBtn = page.locator('button[title="Close"]').or(page.locator('button:has-text("✕")')).first();
    if (await closeModalBtn.isVisible()) {
      await closeModalBtn.click();
      await page.waitForTimeout(400);
    }

    // 7. Test Chat Button Click (Opens Chat Coming Soon Page)
    console.log('\n--- Step 7: Testing Chat Button click ---');
    await chatBtn.click();
    await page.waitForTimeout(600);
    const chatPreviewHeader = page.locator('text="Realtime Chat & Community Threads"').or(page.locator('text="v2.5 Preview"')).first();
    assert('Chat button navigates to Chat Coming Soon page', await chatPreviewHeader.isVisible());
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'SIDEBAR-004-chat-page-active.png') });
    console.log('Saved screenshot: SIDEBAR-004-chat-page-active.png');

    // Test Back button in Chat page
    const backBtn = page.locator('button:has-text("Back to Bookmarks")').first();
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(400);
      const allBookmarksHeader = page.locator('text="All Bookmarks"').first();
      assert('Back button on Chat page returns to All Bookmarks', await allBookmarksHeader.isVisible());
    }

    // 8. Mobile Breakpoint Test
    console.log('\n--- Step 8: Testing Mobile Breakpoint (390x844) ---');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    // If sidebar is closed on mobile, open it via header hamburger button
    const aside = page.locator('aside');
    const isAsideVisible = await aside.isVisible();
    if (!isAsideVisible) {
      const headerHamburger = page.locator('header button').first();
      await headerHamburger.click();
      await page.waitForTimeout(500);
    }

    const mobileProfileBtn = aside.locator('button[title*="Profile" i]').first();
    const mobileSocialBtn = aside.locator('button[title*="Social" i]').first();
    const mobileChatBtn = aside.locator('button[title*="Chat" i]').first();

    assert('Mobile: Profile button visible in drawer', await mobileProfileBtn.isVisible());
    assert('Mobile: Social button visible in drawer', await mobileSocialBtn.isVisible());
    assert('Mobile: Chat button visible in drawer', await mobileChatBtn.isVisible());

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'SIDEBAR-005-mobile-responsive.png') });
    console.log('Saved screenshot: SIDEBAR-005-mobile-responsive.png');

    console.log('\n=== ALL SIDEBAR REDESIGN TESTS COMPLETED ===');
    const failed = results.filter(r => r.status === 'FAIL');
    console.log(`Summary: ${results.length - failed.length}/${results.length} assertions passed.`);
    if (failed.length > 0) {
      console.error('Failed tests:', failed);
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected error during test execution:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runSidebarRedesignTests();
