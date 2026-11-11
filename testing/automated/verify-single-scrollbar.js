import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import path from 'path';

async function verify() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  await page.goto('http://localhost:5070');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Sign In")');
  await page.fill('input[placeholder*="name@example.com"]', 'lionelmahi9@gmail.com');
  await page.fill('input[type="password"]', 'Mahin@99');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Navigate to Edit Profile
  const profileBtn = page.locator('header button[title*="Lionel"]').or(page.locator('header button:has-text("L")')).last();
  await profileBtn.click();
  await page.waitForTimeout(300);
  await page.click('button:has-text("Edit Profile")');
  await page.waitForTimeout(1500);

  // Inspect all scrollable elements in live DOM
  const scrollables = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const res = [];
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        res.push({
          tag: el.tagName,
          clientHeight: el.clientHeight,
          scrollHeight: el.scrollHeight,
          overflowY: style.overflowY,
          class: el.className
        });
      }
    }
    return res;
  });

  console.log('Total Scrollable Elements on Edit Profile Page:', scrollables.length);
  console.log(JSON.stringify(scrollables, null, 2));

  // Take screenshot of the fixed page showing single scrollbar
  const screenshotPath = path.resolve('testing/bug-screenshots/after/BUG-007-single-scrollbar-fixed.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved verification screenshot to:', screenshotPath);

  // Also verify scrolling works smoothly down the page
  await page.evaluate(() => {
    const scrollContainer = document.querySelector('div[style*="overflow-y: auto"]');
    if (scrollContainer) {
      scrollContainer.scrollTop = 400;
    }
  });
  await page.waitForTimeout(400);

  const scrolledScreenshotPath = path.resolve('testing/bug-screenshots/after/BUG-007-single-scrollbar-scrolled.png');
  await page.screenshot({ path: scrolledScreenshotPath });
  console.log('Saved scrolled verification screenshot to:', scrolledScreenshotPath);

  await browser.close();
}

verify();

