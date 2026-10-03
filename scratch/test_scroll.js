import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  console.log('Page loaded');

  // Skip hero by clicking wheel or waiting
  await page.evaluate(() => {
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
  });
  await new Promise(r => setTimeout(r, 1500));

  // Get total scroll height
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight || document.documentElement.scrollHeight);
  console.log('Scroll height:', scrollHeight);

  // Scroll to footer area
  const footerScrollY = scrollHeight - 1200;
  console.log('Scrolling to footer at scrollY:', footerScrollY);

  for (let i = 0; i <= 5; i++) {
    const y = footerScrollY + (i * 200);
    await page.evaluate((scrollPos) => {
      window.scrollTo(0, scrollPos);
    }, y);
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: `C:/Users/Admin/.gemini/antigravity/brain/222dbfc2-5d69-4d87-a6ee-a25a0efe2749/scratch/footer_frame_${i}.png` });
    console.log(`Captured frame ${i} at scrollY ${y}`);
  }

  await browser.close();
})();
