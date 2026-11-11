import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;

async function check() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  const pageErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR CAUGHT:', err.message);
    pageErrors.push(err.message);
  });

  await page.goto('http://localhost:5070');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Sign In")');
  await page.fill('input[placeholder*="name@example.com"]', 'lionelmahi9@gmail.com');
  await page.fill('input[type="password"]', 'Mahin@99');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Click on user profile
  await page.click('header button[title*="Lionel"]');
  await page.waitForTimeout(400);
  await page.click('button:has-text("Edit Profile")');
  await page.waitForTimeout(1500);

  console.log('Total Page Errors Caught:', pageErrors.length);
  await browser.close();
}
check();
