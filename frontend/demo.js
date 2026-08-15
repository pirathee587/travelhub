import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Launching TravelHub Live Demonstration Browser...');

  // Launch a visible browser window with slowMo for clear visual presentation
  const browser = await chromium.launch({
    headless: false,
    slowMo: 600, // 600ms delay between actions for visual clarity
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  console.log('🌐 1. Navigating to TravelHub Landing Page (http://localhost:5173/)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  console.log('📜 2. Demonstrating smooth scroll on landing page...');
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
  await page.waitForTimeout(1500);

  await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
  await page.waitForTimeout(1500);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1500);

  console.log('🔑 3. Navigating to Login Page (http://localhost:5173/login)...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('🏠 4. Returning to main page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  console.log('✅ Demonstration tour complete! Keeping browser open for 15 seconds...');
  await page.waitForTimeout(15000);

  await browser.close();
  console.log('👋 Demonstration finished.');
})();
