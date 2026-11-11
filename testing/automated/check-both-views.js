import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;

async function checkBothViews() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  await page.goto('http://localhost:5070');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Sign In")');
  await page.fill('input[placeholder*="name@example.com"]', 'lionelmahi9@gmail.com');
  await page.fill('input[type="password"]', 'Mahin@99');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Check Main view scrollables
  const mainScrollables = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const res = [];
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        res.push({ tag: el.tagName, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight });
      }
    }
    return res;
  });
  console.log('Main Workspace Scrollable count:', mainScrollables.length);

  await browser.close();
}

checkBothViews();

