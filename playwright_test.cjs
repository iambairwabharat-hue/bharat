const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  console.log('Opening page...');
  await page.goto('http://localhost:5173/preview-3d', { waitUntil: 'networkidle' });
  
  // Wait for 3D model to load
  await page.waitForTimeout(7000);
  
  // Get any console errors
  const errors = [];
  page.on('console', msg => { if(msg.type()==='error') errors.push(msg.text()); });
  
  await page.screenshot({ path: 'E:/bharat-main/ss_loaded.png' });
  console.log('Screenshot 1 taken (initial load)');
  
  // Move mouse to center of screen where car should be
  await page.mouse.move(640, 360);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'E:/bharat-main/ss_center.png' });
  console.log('Screenshot 2 taken (mouse center)');
  
  // Move mouse to right side
  await page.mouse.move(900, 350);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'E:/bharat-main/ss_right.png' });
  console.log('Screenshot 3 taken (mouse right)');
  
  // Move mouse to left
  await page.mouse.move(300, 400);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'E:/bharat-main/ss_left.png' });
  console.log('Screenshot 4 taken (mouse left)');
  
  console.log('Console errors:', errors);
  await browser.close();
  console.log('DONE');
})().catch(e => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
