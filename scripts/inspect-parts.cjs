const { chromium } = require('/Users/sisi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:'/Users/sisi/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 const page = await browser.newPage({viewport:{width:1672,height:941},deviceScaleFactor:3});
 await page.goto('http://127.0.0.1:8734', {waitUntil:'networkidle'});
 await page.screenshot({path:'output/preview/city-parts-combined.png',clip:{x:570,y:690,width:560,height:100}});
 await page.evaluate(() => { document.body.innerHTML = '<img src="assets/city-scene-original.png" style="display:block;width:1666px;height:944px">'; });
 await page.waitForTimeout(300);
 await page.screenshot({path:'output/preview/city-parts-original.png',clip:{x:570,y:690,width:560,height:100}});
 await page.screenshot({path:'output/preview/city-clouds-original.png',clip:{x:650,y:250,width:320,height:110}});
 await browser.close();
})();
