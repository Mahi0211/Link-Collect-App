import pkg from '../../my-react-app/node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import path from 'path';

const BASE_URL = 'http://localhost:5070';
const BEFORE_DIR = path.resolve('testing/bug-screenshots/before');

async function captureAddLink() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Sign In")');
  await page.fill('input[placeholder*="name@example.com"]', 'lionelmahi9@gmail.com');
  await page.fill('input[type="password"]', 'Mahin@99');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Click New Link in Header
  await page.click('button:has-text("New Link")');
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(BEFORE_DIR, 'BUG-003-add-link-modal-prefill.png') });
  console.log('Captured BUG-003-add-link-modal-prefill.png');

  await browser.close();
}
captureAddLink();

