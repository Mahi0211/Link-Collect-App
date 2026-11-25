import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5070';
const USER_EMAIL = 'lionelmahi9@gmail.com';
const USER_PASS = 'Mahin@99';
const SCREENSHOTS_DIR = 'd:/FBNation/LinkCollect/testing/bug-screenshots/after';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Minimal valid 640x360 SVG cover image returned cleanly by local test server
const COVER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#g)"/>
  <circle cx="320" cy="180" r="64" fill="rgba(255,255,255,0.2)"/>
  <polygon points="304,150 356,180 304,210" fill="#ffffff"/>
  <text x="320" y="295" font-family="sans-serif" font-size="26" font-weight="bold" fill="#ffffff" text-anchor="middle">Verified OG Cover Thumbnail</text>
</svg>`;

function startFixtureServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const addr = server.address();
      const origin = `http://127.0.0.1:${addr.port}`;
      if (req.url && req.url.startsWith('/cover.svg')) {
        res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
        res.end(COVER_SVG);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html>
<html>
<head>
  <title>Sample Imported Resource</title>
  <meta property="og:title" content="Sample Imported Resource" />
  <meta property="og:description" content="Clean OpenGraph thumbnail verification target." />
  <meta property="og:image" content="${origin}/cover.svg" />
  <meta name="keywords" content="QA, Thumbnail, OpenGraph" />
</head>
<body><h1>Full Page Content (Should NOT appear as card screenshot)</h1></body>
</html>`);
    });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, origin: `http://127.0.0.1:${addr.port}` });
    });
  });
}

async function runThumbnailVerification() {
  console.log('=== STARTING LINK THUMBNAIL PERSISTENCE & CARD VERIFICATION ===');
  const { server, origin } = await startFixtureServer();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();

  const results = [];
  const createdIds = [];
  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name}${details ? ' (' + details + ')' : ''}`);
      results.push({ name, status: 'PASS', details });
    } else {
      console.error(`[FAIL] ${name}${details ? ' (' + details + ')' : ''}`);
      results.push({ name, status: 'FAIL', details });
    }
  }

  let authToken = null;

  try {
    // 1. Authenticate so localStorage token exists
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

    authToken = await page.evaluate(() => localStorage.getItem('linkapp-token'));
    assert('Authenticated cleanly', Boolean(authToken));

    // 2. Test Bookmarklet / ?addUrl=... import flow
    const qaTag = `qa_ts_${Date.now()}`;
    const targetImportUrl = `${origin}/resource?${qaTag}`;
    const expectedThumbUrl = `${origin}/cover.svg`;

    const scrapePromise = page.waitForResponse(
      (res) => res.url().includes('/api/links/scrape') && res.url().includes(qaTag) && res.status() === 200,
      { timeout: 10000 }
    );

    await page.goto(`${BASE_URL}/?addUrl=${encodeURIComponent(targetImportUrl)}`);
    const scrapeResponse = await scrapePromise;
    const scrapedMeta = await scrapeResponse.json();

    assert(
      'Backend /api/links/scrape returned og:image',
      scrapedMeta?.image === expectedThumbUrl,
      scrapedMeta?.image || 'none'
    );

    // Wait for modal preview img to load cleanly
    const modalPreviewImg = page.locator(`form img[src="${expectedThumbUrl}"]`).first();
    await modalPreviewImg.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForFunction(
      (src) => {
        const el = document.querySelector(`form img[src="${src}"]`);
        return Boolean(el && el.complete && el.naturalWidth > 0);
      },
      expectedThumbUrl
    );
    assert('AddLinkModal preview displays decoded og:image', await modalPreviewImg.isVisible());

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'THUMB-001-import-modal-preview.png') });

    // Submit Save Link and verify POST /api/links payload + response
    let postRequestBody = null;
    const createPromise = page.waitForResponse(
      async (res) => {
        if (res.url().endsWith('/api/links') && res.request().method() === 'POST') {
          postRequestBody = res.request().postDataJSON();
          return true;
        }
        return false;
      },
      { timeout: 10000 }
    );

    await page.locator('button:has-text("Save Link")').click();
    const createRes = await createPromise;
    const createdDto = await createRes.json();
    if (createdDto?.id) createdIds.push(createdDto.id);

    assert(
      'POST /api/links sent scraped thumbnailUrl in payload',
      postRequestBody?.thumbnailUrl === expectedThumbUrl,
      postRequestBody?.thumbnailUrl || 'missing'
    );
    assert(
      'POST /api/links persisted and returned thumbnailUrl',
      createdDto?.thumbnailUrl === expectedThumbUrl,
      createdDto?.thumbnailUrl || 'missing'
    );

    // Verify grid card renders the saved og:image (opacity: 1) instead of mshots screenshot
    const cardImg = page.locator(`main img[src="${expectedThumbUrl}"]`).first();
    await cardImg.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForFunction(
      (src) => {
        const el = document.querySelector(`main img[src="${src}"]`);
        return Boolean(el && el.complete && el.naturalWidth > 0 && getComputedStyle(el).opacity === '1');
      },
      expectedThumbUrl
    );
    const renderedSrc = await cardImg.getAttribute('src');
    assert(
      'Saved LinkCard uses visible og:image thumbnail instead of mshots screenshot',
      renderedSrc === expectedThumbUrl && !renderedSrc.includes('s0.wp.com/mshots'),
      renderedSrc || 'none'
    );

    await cardImg.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'THUMB-002-card-renders-og-thumbnail.png') });

    // 3. Verify Detail Drawer banner shows the same saved og:image
    await cardImg.click();
    await page.waitForTimeout(350);
    const drawerImgs = page.locator(`img[src="${expectedThumbUrl}"]`);
    assert(
      'LinkDetailDrawer banner also uses saved og:image thumbnail',
      (await drawerImgs.count()) >= 2
    );

    // 4. Reload workspace and verify DB persistence survives refresh
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const persistedCardImg = page.locator(`main img[src="${expectedThumbUrl}"]`).first();
    await persistedCardImg.waitFor({ state: 'visible', timeout: 8000 });
    assert(
      'Saved og:image thumbnail persists after full page reload from DB',
      (await persistedCardImg.getAttribute('src')) === expectedThumbUrl
    );

    // 5. Verify direct API POST /api/links without thumbnailUrl auto-scrapes server-side
    const directRes = await page.evaluate(async ({ token, url }) => {
      const r = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url,
          title: 'QA Direct API Scrape Test',
          collectionName: 'Web Development'
        })
      });
      return { status: r.status, body: await r.json() };
    }, { token: authToken, url: `${origin}/direct?qa=${Date.now()}` });

    if (directRes?.body?.id) createdIds.push(directRes.body.id);
    assert(
      'Server-side auto-scrape populates ThumbnailUrl when omitted from POST /api/links',
      directRes.status === 201 && directRes.body?.thumbnailUrl === expectedThumbUrl,
      directRes.body?.thumbnailUrl || `status=${directRes.status}`
    );

    const failed = results.filter((r) => r.status === 'FAIL');
    console.log(`\nSummary: ${results.length - failed.length}/${results.length} assertions passed.`);
    if (failed.length > 0) {
      console.error('Failed assertions:', failed);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Unexpected error during thumbnail verification:', err);
    process.exitCode = 1;
  } finally {
    if (authToken && createdIds.length > 0) {
      for (const id of createdIds) {
        await page.evaluate(async ({ token, id }) => {
          await fetch(`/api/links/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }, { token: authToken, id }).catch(() => {});
      }
      console.log(`Cleaned up ${createdIds.length} temporary QA test link(s).`);
    }
    await browser.close();
    server.close();
  }
}

runThumbnailVerification();
