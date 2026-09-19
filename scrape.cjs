const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Need to set a desktop viewport to ensure the carousel renders properly
  await page.setViewport({ width: 1920, height: 1080 });
  
  await page.goto('https://www.meech213.com/photo?category=magazines', { waitUntil: 'networkidle2' });

  // Function to extract transforms of all items
  const getTransforms = await page.evaluate(() => {
    // Find elements that look like the carousel cards
    // They are usually in a list or div wrappers. Let's find images and get their parents' transforms.
    const imgs = Array.from(document.querySelectorAll('img')).filter(img => img.src && img.src.includes('format='));
    
    return imgs.map((img, i) => {
      let el = img.parentElement;
      let transform = 'none';
      let zIndex = 'auto';
      // Go up a few levels to find the transform
      for(let j=0; j<6; j++) {
        if(!el) break;
        const style = window.getComputedStyle(el);
        if(style.transform && style.transform !== 'none') {
          transform = style.transform;
          zIndex = style.zIndex;
          // Don't break immediately, in case an outer parent has the main transform?
          // Actually, first transform we find is usually the card wrapper.
          break;
        }
        el = el.parentElement;
      }
      return { index: i, transform, zIndex };
    }).filter(t => t.transform !== 'none');
  });

  console.log("INITIAL TRANSFORMS:");
  console.log(JSON.stringify(getTransforms.slice(0, 5), null, 2));

  // Scroll down
  await page.evaluate(() => {
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 500 }));
  });
  
  // Wait a bit for JS animation (gsap/locomotive etc)
  await new Promise(r => setTimeout(r, 1000));

  const getTransformsAfter = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).filter(img => img.src && img.src.includes('format='));
    return imgs.map((img, i) => {
      let el = img.parentElement;
      let transform = 'none';
      for(let j=0; j<6; j++) {
        if(!el) break;
        const style = window.getComputedStyle(el);
        if(style.transform && style.transform !== 'none') {
          transform = style.transform;
          break;
        }
        el = el.parentElement;
      }
      return { index: i, transform };
    }).filter(t => t.transform !== 'none');
  });

  console.log("\nAFTER SCROLL TRANSFORMS:");
  console.log(JSON.stringify(getTransformsAfter.slice(0, 5), null, 2));

  await browser.close();
})();
