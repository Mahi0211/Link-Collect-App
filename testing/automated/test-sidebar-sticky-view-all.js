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

async function runStickyHeaderViewAllTests() {
  console.log('=== STARTING STICKY HEADER & CONTEXT-AWARE VIEW ALL VERIFICATION ===');
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
    // Augment collections & links via Playwright route interception on top of real backend schemas
    // so both Collections (28+) and Tags (36+) overflow a standard 850px desktop sidebar cleanly.
    await page.route('**/api/collections', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      const response = await route.fetch();
      const body = await response.json().catch(() => null);
      if (Array.isArray(body)) {
        const sample = body[0] || {};
        const augmented = [...body];
        for (let i = 1; i <= 24; i++) {
          augmented.push({
            ...sample,
            id: 9000 + i,
            collectionName: `Curated Archive ${String(i).padStart(2, '0')}`,
            isPublic: i % 3 === 0,
            totalLinks: (i % 5) + 1,
          });
        }
        return route.fulfill({ response, json: augmented });
      }
      return route.fulfill({ response, json: body });
    });

    await page.route('**/api/links*', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      const response = await route.fetch();
      const body = await response.json().catch(() => null);
      if (Array.isArray(body) && body.length > 0) {
        const extraTags = Array.from({ length: 90 }, (_, idx) => `Topic-${String(idx + 1).padStart(2, '0')}`);
        const augmented = body.map((item, idx) =>
          idx === 0 ? { ...item, customTags: [...(item.customTags || []), ...extraTags] } : item
        );
        return route.fulfill({ response, json: augmented });
      }
      return route.fulfill({ response, json: body });
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const signInTab = page.locator('button:has-text("Sign In")').first();
    if (await signInTab.isVisible()) {
      await signInTab.click();
      await page.waitForTimeout(250);
      await page.locator('input[name="identifier"], input[placeholder*="name@example.com"]').first().fill(USER_EMAIL);
      await page.locator('input[name="password"]').first().fill(USER_PASS);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForSelector('aside', { timeout: 10000 });
      await page.waitForTimeout(900);
    }

    const scrollBox = page.locator('[data-sidebar-scroll="true"]').first();
    const stickyHeader = page.locator('[data-sticky-header]').first();
    const viewAllBtn = page.locator('[data-testid="sidebar-view-all-btn"]');

    assert('Sidebar scroll container and sticky header mounted', (await scrollBox.isVisible()) && (await stickyHeader.isVisible()));

    // 1. Before scroll (scrollTop === 0): not sticky, View All hidden
    const initialState = await page.evaluate(() => {
      const box = document.querySelector('[data-sidebar-scroll="true"]');
      const hdr = document.querySelector('[data-sticky-header]');
      const btn = document.querySelector('[data-testid="sidebar-view-all-btn"]');
      return {
        scrollTop: box?.scrollTop,
        scrollHeight: box?.scrollHeight,
        clientHeight: box?.clientHeight,
        stickyAttr: hdr?.getAttribute('data-sticky-header'),
        viewAllCount: document.querySelectorAll('[data-testid="sidebar-view-all-btn"]').length,
        hasBtn: Boolean(btn),
      };
    });
    assert(
      'Before scroll: header not sticky and View All button hidden',
      initialState.stickyAttr === 'false' && initialState.viewAllCount === 0 && initialState.scrollHeight > initialState.clientHeight,
      JSON.stringify(initialState)
    );

    // 2. Partial scroll before header reaches top (scrollTop = 90)
    await scrollBox.evaluate((el) => {
      el.scrollTop = 90;
    });
    await page.waitForTimeout(200);
    const partialState = await page.evaluate(() => {
      const hdr = document.querySelector('[data-sticky-header]');
      return {
        stickyAttr: hdr?.getAttribute('data-sticky-header'),
        viewAllCount: document.querySelectorAll('[data-testid="sidebar-view-all-btn"]').length,
      };
    });
    assert(
      'Before header hits top (scrollTop=90): still not sticky and View All hidden',
      partialState.stickyAttr === 'false' && partialState.viewAllCount === 0,
      JSON.stringify(partialState)
    );

    // 3. Scroll past threshold (scrollTop = 340) -> Header sticks at top, View All appears above Profile-Social-Chat
    await scrollBox.evaluate((el) => {
      el.scrollTop = 340;
    });
    await page.waitForTimeout(250);

    const stuckMetrics1 = await page.evaluate(() => {
      const box = document.querySelector('[data-sidebar-scroll="true"]');
      const hdr = document.querySelector('[data-sticky-header]');
      const btn = document.querySelector('[data-testid="sidebar-view-all-btn"]');
      const profileBtn = Array.from(document.querySelectorAll('aside button')).find((b) =>
        b.textContent?.trim() === 'Profile'
      );
      const boxRect = box.getBoundingClientRect();
      const hdrRect = hdr.getBoundingClientRect();
      const btnRect = btn?.getBoundingClientRect();
      const profileRect = profileBtn?.getBoundingClientRect();
      return {
        stickyAttr: hdr.getAttribute('data-sticky-header'),
        boxTop: Math.round(boxRect.top),
        hdrTop: Math.round(hdrRect.top),
        viewAllCount: document.querySelectorAll('[data-testid="sidebar-view-all-btn"]').length,
        viewAllText: btn?.textContent?.trim(),
        viewAllTab: btn?.getAttribute('data-active-tab'),
        btnBottom: btnRect ? Math.round(btnRect.bottom) : null,
        profileTop: profileRect ? Math.round(profileRect.top) : null,
        gapAboveFooter: btnRect && profileRect ? Math.round(profileRect.top - btnRect.bottom) : null,
      };
    });
    assert(
      'Header sticks at top of sidebar when scrolled (Collections active)',
      stuckMetrics1.stickyAttr === 'true' && Math.abs(stuckMetrics1.hdrTop - stuckMetrics1.boxTop) <= 2,
      JSON.stringify(stuckMetrics1)
    );
    assert(
      'Single shared View All button appears immediately above Profile-Social-Chat bar',
      stuckMetrics1.viewAllCount === 1 &&
        stuckMetrics1.viewAllText === 'View All' &&
        stuckMetrics1.btnBottom !== null &&
        stuckMetrics1.profileTop !== null &&
        stuckMetrics1.gapAboveFooter >= 0 &&
        stuckMetrics1.gapAboveFooter <= 32,
      JSON.stringify(stuckMetrics1)
    );

    // 4. Scroll deeper (scrollTop = 520) -> Header stays pinned at exact same top & View All stays visible
    await scrollBox.evaluate((el) => {
      el.scrollTop = 520;
    });
    await page.waitForTimeout(200);
    const stuckMetrics2 = await page.evaluate(() => {
      const box = document.querySelector('[data-sidebar-scroll="true"]');
      const hdr = document.querySelector('[data-sticky-header]');
      return {
        stickyAttr: hdr?.getAttribute('data-sticky-header'),
        boxTop: Math.round(box.getBoundingClientRect().top),
        hdrTop: Math.round(hdr.getBoundingClientRect().top),
        viewAllVisible: Boolean(document.querySelector('[data-testid="sidebar-view-all-btn"]')),
      };
    });
    assert(
      'Header remains fixed and View All remains visible while continuing to scroll Collections',
      stuckMetrics2.stickyAttr === 'true' && Math.abs(stuckMetrics2.hdrTop - stuckMetrics2.boxTop) <= 2 && stuckMetrics2.viewAllVisible,
      JSON.stringify(stuckMetrics2)
    );
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'SIDEBAR-STICKY-001-collections-sticky.png') });

    // 5. Context-aware click on Collections tab -> dedicated Collections placeholder page
    await viewAllBtn.first().click();
    await page.waitForTimeout(300);
    const collectionsPageVisible = await page.locator('[data-testid="collections-placeholder-page"]').isVisible();
    const tagsPageCountOnCols = await page.locator('[data-testid="tags-placeholder-page"]').count();
    assert(
      'Clicking View All while Collections tab active navigates to dedicated Collections page',
      collectionsPageVisible && tagsPageCountOnCols === 0
    );
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'SIDEBAR-STICKY-002-collections-page.png') });

    // 6. Switch to Tags tab while sticky -> verify Tags scroll, header stays pinned, shared View All stays visible
    const tagTab = page.locator('aside button[role="tab"]:has-text("Tags")').first();
    await tagTab.click();
    await page.waitForTimeout(250);

    // Ensure scrolled deep enough in Tags tab too
    await scrollBox.evaluate((el) => {
      el.scrollTop = 420;
    });
    await page.waitForTimeout(250);

    const tagsStuckMetrics = await page.evaluate(() => {
      const box = document.querySelector('[data-sidebar-scroll="true"]');
      const hdr = document.querySelector('[data-sticky-header]');
      const btn = document.querySelector('[data-testid="sidebar-view-all-btn"]');
      return {
        stickyAttr: hdr?.getAttribute('data-sticky-header'),
        boxTop: Math.round(box.getBoundingClientRect().top),
        hdrTop: Math.round(hdr.getBoundingClientRect().top),
        viewAllCount: document.querySelectorAll('[data-testid="sidebar-view-all-btn"]').length,
        viewAllText: btn?.textContent?.trim(),
        viewAllTab: btn?.getAttribute('data-active-tab'),
      };
    });
    assert(
      'While scrolled on Tags tab: single shared View All button stays visible with same label',
      tagsStuckMetrics.stickyAttr === 'true' &&
        Math.abs(tagsStuckMetrics.hdrTop - tagsStuckMetrics.boxTop) <= 2 &&
        tagsStuckMetrics.viewAllCount === 1 &&
        tagsStuckMetrics.viewAllText === 'View All' &&
        tagsStuckMetrics.viewAllTab === 'tags',
      JSON.stringify(tagsStuckMetrics)
    );

    // 7. Context-aware click on Tags tab -> dedicated Tags page (separate from Collections page)
    await viewAllBtn.first().click();
    await page.waitForTimeout(300);
    const tagsPageVisible = await page.locator('[data-testid="tags-page"]').isVisible();
    const colsPageCountOnTags = await page.locator('[data-testid="collections-placeholder-page"]').count();
    assert(
      'Clicking View All while Tags tab active navigates to separate dedicated Tags page',
      tagsPageVisible && colsPageCountOnTags === 0
    );
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'SIDEBAR-STICKY-003-tags-page.png') });

    // 8. Check Dark theme rendering too
    const themeToggle = page.locator('header button[title*="mode" i], header button[aria-label*="theme" i]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'SIDEBAR-STICKY-004-tags-sticky-dark.png') });
      await themeToggle.click();
      await page.waitForTimeout(200);
    }

    // 9. Scroll back to top -> View All disappears cleanly & header unsticks
    await scrollBox.evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.waitForTimeout(250);
    const resetMetrics = await page.evaluate(() => {
      const hdr = document.querySelector('[data-sticky-header]');
      return {
        stickyAttr: hdr?.getAttribute('data-sticky-header'),
        viewAllCount: document.querySelectorAll('[data-testid="sidebar-view-all-btn"]').length,
        docOverflow: document.documentElement.scrollHeight - window.innerHeight,
      };
    });
    assert(
      'Scrolling back to top unsticks header and hides View All button cleanly',
      resetMetrics.stickyAttr === 'false' && resetMetrics.viewAllCount === 0,
      JSON.stringify(resetMetrics)
    );
    assert(
      'Outer document maintains single-scrollbar constraint (no outer page overflow)',
      resetMetrics.docOverflow <= 1,
      JSON.stringify({ docOverflow: resetMetrics.docOverflow })
    );

    const failed = results.filter((r) => r.status === 'FAIL');
    console.log(`\nSummary: ${results.length - failed.length}/${results.length} assertions passed.`);
    if (failed.length > 0) {
      console.error('Failed assertions:', failed);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Unexpected error during sticky header & View All tests:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runStickyHeaderViewAllTests();
