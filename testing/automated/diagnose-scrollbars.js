import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;

async function diagnoseScrollbars() {
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

  // Check all elements in the DOM with overflow or scrollHeight > clientHeight
  const scrollableElements = await page.evaluate(() => {
    const results = [];
    
    // Check window/html/body
    results.push({
      element: 'window',
      innerHeight: window.innerHeight,
      outerHeight: window.outerHeight,
      scrollY: window.scrollY
    });

    results.push({
      element: 'html',
      clientHeight: document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight,
      overflowY: window.getComputedStyle(document.documentElement).overflowY,
      hasScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight
    });

    results.push({
      element: 'body',
      clientHeight: document.body.clientHeight,
      scrollHeight: document.body.scrollHeight,
      overflowY: window.getComputedStyle(document.body).overflowY,
      hasScroll: document.body.scrollHeight > document.body.clientHeight
    });

    // Check all divs and containers
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const style = window.getComputedStyle(el);
      const isScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
      if (isScrollable) {
        results.push({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          clientHeight: el.clientHeight,
          scrollHeight: el.scrollHeight,
          overflowY: style.overflowY,
          outerHTMLSnippet: el.outerHTML.slice(0, 150)
        });
      }
    }

    return results;
  });

  console.log('Scrollable elements:', JSON.stringify(scrollableElements, null, 2));

  await browser.close();
}

diagnoseScrollbars();
