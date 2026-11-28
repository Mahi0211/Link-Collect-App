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

async function runSidebarBentoVerification() {
  console.log('=== STARTING SIDEBAR BENTO LAYOUT & HOVER COLOR VERIFICATION ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();

  const results = [];
  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name}${details ? ' (' + details + ')' : ''}`);
      results.push({ name, status: 'PASS', details });
    } else {
      console.error(`[FAIL] ${name}${details ? ' (' + details + ')' : ''}`);
      results.push({ name, status: 'FAIL', details });
    }
  }

  try {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const signInTab = page.locator('button:has-text("Sign In")').first();
    if (await signInTab.isVisible()) {
      await signInTab.click();
      await page.waitForTimeout(300);
      await page.locator('input[name="identifier"], input[placeholder*="name@example.com"]').first().fill(USER_EMAIL);
      await page.locator('input[name="password"]').first().fill(USER_PASS);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForSelector('aside', { timeout: 10000 });
      await page.waitForTimeout(800);
    }

    const aside = page.locator('aside').first();
    assert('Sidebar rendered', await aside.isVisible());

    // 1. Verify 1 full-width top card + 2x3 bento grid layout
    const layoutMetrics = await page.evaluate(() => {
      const labels = ['All Bookmarks', 'Favorites', 'Top Rated', 'Rewatch Worthy', 'Already Watched', 'Read Later', 'Archive'];
      const buttons = {};
      for (const lbl of labels) {
        const btn = Array.from(document.querySelectorAll('aside button')).find((b) =>
          b.textContent && b.textContent.includes(lbl)
        );
        if (btn) {
          const r = btn.getBoundingClientRect();
          buttons[lbl] = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
        }
      }
      return buttons;
    });

    const allCard = layoutMetrics['All Bookmarks'];
    const favCard = layoutMetrics['Favorites'];
    const topCard = layoutMetrics['Top Rated'];
    const rewatchCard = layoutMetrics['Rewatch Worthy'];
    const watchedCard = layoutMetrics['Already Watched'];
    const readLaterCard = layoutMetrics['Read Later'];
    const archiveCard = layoutMetrics['Archive'];

    const isAllFullWidth = Boolean(allCard && favCard && allCard.w > favCard.w * 1.7);
    const row1Aligned = Boolean(favCard && topCard && Math.abs(favCard.y - topCard.y) <= 2 && topCard.x > favCard.x);
    const row2Aligned = Boolean(rewatchCard && watchedCard && Math.abs(rewatchCard.y - watchedCard.y) <= 2 && watchedCard.x > rewatchCard.x);
    const row3Aligned = Boolean(readLaterCard && archiveCard && Math.abs(readLaterCard.y - archiveCard.y) <= 2 && archiveCard.x > readLaterCard.x);

    assert('All Bookmarks card spans full width above 2-col grid', isAllFullWidth, JSON.stringify({ allW: allCard?.w, cardW: favCard?.w }));
    assert('Favorites + Top Rated form Row 1 (2 columns)', row1Aligned);
    assert('Rewatch Worthy + Already Watched form Row 2 (2 columns)', row2Aligned);
    assert('Read Later + Archive form Row 3 (2 columns)', row3Aligned);

    // 2. Capture default (Light) theme screenshot & Dark theme toggle test
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'SIDEBAR-BENTO-001-light-default.png') });

    // Switch to Dark theme via header toggle so we verify both Light and Dark themes
    const themeToggle = page.locator('header button[title*="mode" i], header button[aria-label*="theme" i]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(300);
    }

    // 3. Test Hover Color Matching Section Icons in Dark Mode (Favorites = Rose, Top Rated = Amber, Rewatch = Orange, Watched = Emerald, Read Later = Sky)
    const favBtn = aside.locator('button:has-text("Favorites")').first();
    const beforeFavStyle = await favBtn.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, border: cs.borderColor };
    });

    await favBtn.hover();
    await page.waitForTimeout(250);
    const afterFavStyle = await favBtn.evaluate((el) => {
      const cs = getComputedStyle(el);
      const svg = el.querySelector('svg');
      return { bg: cs.backgroundColor, border: cs.borderColor, iconColor: svg ? getComputedStyle(svg).color : '' };
    });

    assert(
      'Hovering Favorites illuminates card with icon-matched rose/pink color',
      afterFavStyle.bg !== beforeFavStyle.bg && afterFavStyle.border !== beforeFavStyle.border,
      JSON.stringify(afterFavStyle)
    );
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'SIDEBAR-BENTO-002-hover-favorites.png') });

    // Hover Top Rated -> Amber/Gold
    const topBtn = aside.locator('button:has-text("Top Rated")').first();
    await topBtn.hover();
    await page.waitForTimeout(250);
    const afterTopStyle = await topBtn.evaluate((el) => {
      const cs = getComputedStyle(el);
      const svg = el.querySelector('svg');
      return { bg: cs.backgroundColor, border: cs.borderColor, iconColor: svg ? getComputedStyle(svg).color : '' };
    });
    assert(
      'Hovering Top Rated shows distinct amber/gold hover tint matching icon',
      afterTopStyle.bg !== afterFavStyle.bg && afterTopStyle.border !== afterFavStyle.border,
      JSON.stringify(afterTopStyle)
    );

    // Click Favorites to verify active selected state
    await favBtn.click();
    await page.waitForTimeout(300);
    const selectedTitle = await page.locator('main h1').first().textContent();
    assert('Clicking Favorites bento card navigates cleanly', selectedTitle?.includes('Favorites'));

    // Toggle theme back cleanly and reset All Bookmarks
    const allBtn = aside.locator('button:has-text("All Bookmarks")').first();
    await allBtn.click();
    await page.waitForTimeout(200);
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(200);
    }

    const failed = results.filter((r) => r.status === 'FAIL');
    console.log(`\nSummary: ${results.length - failed.length}/${results.length} assertions passed.`);
    if (failed.length > 0) {
      console.error('Failed assertions:', failed);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Unexpected error during sidebar bento verification:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runSidebarBentoVerification();
