import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;

async function testScrollbarFix() {
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

  // Check BEFORE applying fix
  const beforeCount = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const scrollables = [];
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        scrollables.push({
          tag: el.tagName,
          clientHeight: el.clientHeight,
          scrollHeight: el.scrollHeight,
          outerHTML: el.outerHTML.slice(0, 100)
        });
      }
    }
    return scrollables;
  });
  console.log('BEFORE Fix: Number of scrollable elements:', beforeCount.length);
  console.log(JSON.stringify(beforeCount, null, 2));

  // Now apply the CSS/DOM fix in-page:
  // 1. mainFrameRef: overflow-y: hidden
  // 2. EditProfilePage: flex: 1, min-height: 0
  const afterCount = await page.evaluate(() => {
    // Parent mainFrame
    const mainFrame = document.querySelector('div[style*="max-height: 100vh"]');
    if (mainFrame) {
      mainFrame.style.overflowY = 'hidden';
    }

    // EditProfile root
    const editProfileRoot = document.querySelector('div[style*="min-height: 100%"]');
    if (editProfileRoot) {
      editProfileRoot.style.flex = '1';
      editProfileRoot.style.minHeight = '0';
    }

    const all = document.querySelectorAll('*');
    const scrollables = [];
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        scrollables.push({
          tag: el.tagName,
          clientHeight: el.clientHeight,
          scrollHeight: el.scrollHeight,
          outerHTML: el.outerHTML.slice(0, 100)
        });
      }
    }
    return scrollables;
  });

  console.log('\nAFTER Fix: Number of scrollable elements:', afterCount.length);
  console.log(JSON.stringify(afterCount, null, 2));

  // Take screenshot to visually inspect the single scrollbar
  await page.screenshot({ path: 'testing/bug-screenshots/single-scrollbar-verified.png' });
  console.log('Screenshot saved to testing/bug-screenshots/single-scrollbar-verified.png');

  await browser.close();
}

testScrollbarFix();

