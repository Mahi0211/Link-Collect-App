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

    // 2. Verify AI-Research deck has 5 uniform populated cards (no Open Deck, bigger front card, no front link title)
    const firstDeck = page.locator('[data-testid="tag-deck-AI-Research"]').first();
    const previewCardDetails = await firstDeck.evaluate((el) => {
      const slotCards = Array.from(el.querySelectorAll('[data-card-slot]'));
      const centerCard = el.querySelector('[data-card-slot="0"]');
      const leftCard = el.querySelector('[data-card-slot="1"]');
      const outerRightCard = el.querySelector('[data-card-slot="3"]');
      const deckText = el.textContent || '';
      const centerText = centerCard?.textContent || '';
      return {
        slotCount: slotCards.length,
        hasOpenDeckBtn: deckText.includes('Open Deck'),
        frontCardHasLinkTitle: centerText.includes('Attention Is All You Need Paper'),
        frontCardRect: centerCard?.getBoundingClientRect(),
        leftCardRect: leftCard?.getBoundingClientRect(),
        deckRect: el.getBoundingClientRect(),
        outerRightText: outerRightCard?.textContent || '',
        beforeStep: el.getAttribute('data-front-card-step'),
        beforeFrontLink: el.getAttribute('data-front-link-id'),
        beforeLeftTransform: getComputedStyle(leftCard).transform,
        beforeCenterTransform: getComputedStyle(centerCard).transform,
      };
    });
    assert(
      'Tag deck renders 5 populated link cards with bigger unobstructed front card and no Open Deck button',
      previewCardDetails.slotCount === 5 &&
        !previewCardDetails.hasOpenDeckBtn &&
        !previewCardDetails.frontCardHasLinkTitle &&
        previewCardDetails.frontCardRect.width >= 180 &&
        previewCardDetails.deckRect.height <= 260 &&
        previewCardDetails.outerRightText.includes('#5'),
      JSON.stringify({
        slotCount: previewCardDetails.slotCount,
        hasOpenDeckBtn: previewCardDetails.hasOpenDeckBtn,
        frontCardHasLinkTitle: previewCardDetails.frontCardHasLinkTitle,
        frontWidth: Math.round(previewCardDetails.frontCardRect.width),
        deckHeight: Math.round(previewCardDetails.deckRect.height),
      })
    );

    // Capture Light mode screenshot before hover
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'TAGS-PAGE-001-light-decks.png') });

    // 3. Verify 3-second automatic card rotation switches the front card smoothly
    await page.waitForTimeout(3300);
    const rotatedState = await firstDeck.evaluate((el) => ({
      afterStep: el.getAttribute('data-front-card-step'),
      afterFrontLink: el.getAttribute('data-front-link-id'),
    }));
    assert(
      'Deck cards automatically rotate to the next front card after 3 seconds',
      rotatedState.afterStep !== previewCardDetails.beforeStep &&
        rotatedState.afterFrontLink !== previewCardDetails.beforeFrontLink,
      JSON.stringify({ before: previewCardDetails.beforeFrontLink, after: rotatedState.afterFrontLink, step: rotatedState.afterStep })
    );

    // 4. Test hover animation spreads outer wings and lifts center card cleanly
    await firstDeck.hover();
    await page.waitForTimeout(550);
    const hoverTransforms = await firstDeck.evaluate((el) => ({
      afterLeftTransform: getComputedStyle(el.querySelector('[data-card-slot="1"]')).transform,
      afterCenterTransform: getComputedStyle(el.querySelector('[data-card-slot="0"]')).transform,
    }));
    assert(
      'Hovering tag deck animates center elevation and 5-card fan spread',
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
      await page.waitForTimeout(550);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'TAGS-PAGE-002-dark-hover-decks.png') });
    }

    // 5. Test Most Viewed vs Top Rated top-5 switcher inside TagsPage
    const tagsPage = page.locator('[data-testid="tags-page"]').first();
    await tagsPage.locator('button:has-text("Most Viewed")').first().click();
    await page.waitForTimeout(200);
    const mostViewedSlots = await firstDeck.locator('[data-card-slot]').count();
    await tagsPage.locator('button:has-text("Top Rated")').first().click();
    await page.waitForTimeout(200);
    const topRatedSlots = await firstDeck.locator('[data-card-slot]').count();
    assert(
      'Top-5 preview ranking controls render and preserve 5-card deck interactively',
      mostViewedSlots === 5 && topRatedSlots === 5
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
