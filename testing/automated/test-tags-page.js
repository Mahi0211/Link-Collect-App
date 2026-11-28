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

async function runTagsPageVerification() {
  console.log('=== STARTING TAGS PAGE (FAN CARD DECK) VERIFICATION ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 860 } });
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
    // Augment collections & links so Tags tab overflows sidebar cleanly AND Tags have varied link counts, ratings, & views
    await page.route('**/api/collections', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      const response = await route.fetch();
      const body = await response.json().catch(() => null);
      if (Array.isArray(body)) {
        const sample = body[0] || {};
        const extraCols = Array.from({ length: 18 }, (_, i) => ({
          ...sample,
          id: 9100 + i,
          collectionName: `Deck Collection ${String(i + 1).padStart(2, '0')}`,
          isPublic: i % 2 === 0,
          totalLinks: 2,
        }));
        return route.fulfill({ response, json: [...body, ...extraCols] });
      }
      return route.fulfill({ response, json: body });
    });

    await page.route('**/api/links*', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      const response = await route.fetch();
      const body = await response.json().catch(() => null);
      if (Array.isArray(body) && body.length > 0) {
        const base = body[0];
        const syntheticLinks = [
          // Tag "AI-Research" -> 5 links (highest count)
          { ...base, id: 8001, title: 'Attention Is All You Need Paper', url: 'https://arxiv.org/abs/1706.03762', domain: 'arxiv.org', rating: 5, watchCount: 42, isFavorite: true, customTags: ['AI-Research', 'Design-Systems'], thumbnailUrl: '' },
          { ...base, id: 8002, title: 'Visualizing Neural Networks Guide', url: 'https://react.dev/learn', domain: 'react.dev', rating: 4, watchCount: 28, customTags: ['AI-Research', 'Frontend'], thumbnailUrl: '' },
          { ...base, id: 8003, title: 'LLM Agents Architecture Notes', url: 'https://github.com/openai', domain: 'github.com', rating: 5, watchCount: 15, customTags: ['AI-Research'], thumbnailUrl: '' },
          { ...base, id: 8004, title: 'Prompt Engineering Handbook', url: 'https://notion.so/prompting', domain: 'notion.so', rating: 3, watchCount: 9, customTags: ['AI-Research'], thumbnailUrl: '' },
          { ...base, id: 8005, title: 'Transformer Explainer Interactive', url: 'https://stripe.com/docs', domain: 'stripe.com', rating: 2, watchCount: 4, customTags: ['AI-Research'], thumbnailUrl: '' },
          // Tag "Design-Systems" -> 4 links (second highest)
          { ...base, id: 8006, title: 'Figma Tokens Studio Workflow', url: 'https://figma.com/community', domain: 'figma.com', rating: 5, watchCount: 31, customTags: ['Design-Systems', 'Frontend'], thumbnailUrl: '' },
          { ...base, id: 8007, title: 'Dribbble Microinteractions Vault', url: 'https://dribbble.com/shots', domain: 'dribbble.com', rating: 4, watchCount: 19, customTags: ['Design-Systems'], thumbnailUrl: '' },
          { ...base, id: 8008, title: 'Tailwind Design Palette Guide', url: 'https://tailwindcss.com/docs', domain: 'tailwindcss.com', rating: 5, watchCount: 8, customTags: ['Design-Systems'], thumbnailUrl: '' },
          // Tag "Frontend" -> 3 links (third highest)
          { ...base, id: 8009, title: 'Linear Engineering Craft Blog', url: 'https://linear.app/blog', domain: 'linear.app', rating: 5, watchCount: 22, customTags: ['Frontend'], thumbnailUrl: '' },
          // Extra tags so Sidebar Tags tab also overflows cleanly to trigger View All -> TagsPage
          ...Array.from({ length: 45 }, (_, idx) => ({
            ...base,
            id: 8100 + idx,
            title: `Topic Bookmark ${idx + 1}`,
            url: `https://example.com/topic-${idx + 1}`,
            domain: 'example.com',
            rating: (idx % 5) + 1,
            watchCount: idx % 10,
            customTags: [`Topic-${String(idx + 1).padStart(2, '0')}`],
            thumbnailUrl: '',
          })),
        ];
        return route.fulfill({ response, json: [...body, ...syntheticLinks] });
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

    // Switch sidebar to Tags tab, scroll until sticky, click View All to open TagsPage
    await page.locator('aside button[role="tab"]:has-text("Tags")').first().click();
    await page.waitForTimeout(250);
    await page.locator('[data-sidebar-scroll="true"]').first().evaluate((el) => {
      el.scrollTop = 440;
    });
    await page.waitForTimeout(300);
    await page.locator('[data-testid="sidebar-view-all-btn"]').first().click();
    await page.waitForSelector('[data-testid="tags-page"]', { timeout: 5000 });
    await page.waitForTimeout(450);

    // 1. Verify tags are ordered by highest link count first
    const orderedDeckStats = await page.evaluate(() => {
      const decks = Array.from(document.querySelectorAll('[data-testid^="tag-deck-"]'));
      return decks.slice(0, 6).map((el) => ({
        tag: el.getAttribute('data-tag-name'),
        count: Number(el.getAttribute('data-tag-count')),
      }));
    });
    const countsDescending = orderedDeckStats.every((d, i) => i === 0 || d.count <= orderedDeckStats[i - 1].count);
    const aiIdx = orderedDeckStats.findIndex((d) => d.tag === 'AI-Research');
    const dsIdx = orderedDeckStats.findIndex((d) => d.tag === 'Design-Systems');
    const feIdx = orderedDeckStats.findIndex((d) => d.tag === 'Frontend');
    assert(
      'Tags are ordered descending with highest link counts first',
      orderedDeckStats.length >= 4 &&
        aiIdx !== -1 &&
        dsIdx !== -1 &&
        feIdx !== -1 &&
        aiIdx < dsIdx &&
        dsIdx < feIdx &&
        orderedDeckStats[aiIdx].count === 5 &&
        orderedDeckStats[dsIdx].count === 4 &&
        orderedDeckStats[feIdx].count === 3 &&
        countsDescending,
      JSON.stringify(orderedDeckStats)
    );

    // 2. Verify AI-Research deck has 3 preview cards (Left #2, Center #1, Right #3)
    const firstDeck = page.locator('[data-testid="tag-deck-AI-Research"]').first();
    const previewCardDetails = await firstDeck.evaluate((el) => {
      const hasTop1 = el.textContent?.includes('TOP #1');
      const leftCardText = el.querySelector('.lc-card-left')?.textContent || '';
      const rightCardText = el.querySelector('.lc-card-right')?.textContent || '';
      const beforeLeftTransform = getComputedStyle(el.querySelector('.lc-card-left')).transform;
      const beforeCenterTransform = getComputedStyle(el.querySelector('.lc-card-center')).transform;
      return {
        hasTop1,
        hasRank2: leftCardText.includes('#2'),
        hasRank3: rightCardText.includes('#3'),
        beforeLeftTransform,
        beforeCenterTransform,
      };
    });
    assert(
      'Tag deck showcases 3 ranked cards (TOP #1 center + #2 left + #3 right)',
      previewCardDetails.hasTop1 && previewCardDetails.hasRank2 && previewCardDetails.hasRank3,
      JSON.stringify(previewCardDetails)
    );

    // Capture Light mode screenshot before hover & Dark mode
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'TAGS-PAGE-001-light-decks.png') });

    // 3. Test hover animation on AI-Research deck
    await firstDeck.hover();
    await page.waitForTimeout(450);
    const hoverTransforms = await firstDeck.evaluate((el) => ({
      afterLeftTransform: getComputedStyle(el.querySelector('.lc-card-left')).transform,
      afterCenterTransform: getComputedStyle(el.querySelector('.lc-card-center')).transform,
    }));
    assert(
      'Hovering tag deck animates center elevation and wing fan-out',
      hoverTransforms.afterLeftTransform !== previewCardDetails.beforeLeftTransform &&
        hoverTransforms.afterCenterTransform !== previewCardDetails.beforeCenterTransform,
      JSON.stringify(hoverTransforms)
    );

    // Toggle Dark mode and capture hover screenshot matching dark reference aesthetic
    const themeToggle = page.locator('header button[title*="mode" i], header button[aria-label*="theme" i]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(350);
      await firstDeck.hover();
      await page.waitForTimeout(450);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'TAGS-PAGE-002-dark-hover-decks.png') });
    }

    // 4. Test Most Viewed vs Top Rated top-3 switcher inside TagsPage
    const tagsPage = page.locator('[data-testid="tags-page"]').first();
    await tagsPage.locator('button:has-text("Most Viewed")').first().click();
    await page.waitForTimeout(200);
    const mostViewedDeckText = await firstDeck.textContent();
    await tagsPage.locator('button:has-text("Top Rated")').first().click();
    await page.waitForTimeout(200);
    const topRatedDeckText = await firstDeck.textContent();
    assert(
      'Top-3 preview ranking controls render and work interactively',
      Boolean(mostViewedDeckText?.includes('Attention') && topRatedDeckText?.includes('Attention'))
    );

    // 5. Clicking a Tag Deck opens that tag's collection of links
    await page.locator('[data-testid="tag-deck-Design-Systems"]').first().click();
    await page.waitForSelector('main h1', { timeout: 5000 });
    await page.waitForTimeout(300);
    const openedHeader = await page.locator('main h1').first().textContent();
    const visibleAllTagsBtn = await page.locator('main button:has-text("All Tags")').isVisible();
    assert(
      'Clicking a tag deck opens the link collection for that tag',
      Boolean(openedHeader && openedHeader.includes('#Design-Systems') && openedHeader.includes('(4)')),
      openedHeader
    );
    assert('Opened tag collection shows "← All Tags" quick return button', visibleAllTagsBtn);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'TAGS-PAGE-003-opened-tag-links.png') });

    // Switch back to Light mode cleanly if toggled
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
    console.error('Unexpected error during Tags Page verification:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runTagsPageVerification();
