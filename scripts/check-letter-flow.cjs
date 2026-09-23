const { chromium } = require('/Users/sisi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Users/sisi/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' });
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto('http://127.0.0.1:8734', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const checks = { errors };
  const deskVisible = () => page.locator('.desk').isVisible();

  // 0. 进场：三个物件依次抬起再放下
  await page.waitForTimeout(1600);
  checks.introNudge = await page.evaluate(() => [...document.querySelectorAll('.keepsake')].some(el => el.classList.contains('is-awake')));
  await page.waitForTimeout(2600);
  checks.introSettled = await page.evaluate(() => [...document.querySelectorAll('.keepsake')].every(el => !el.classList.contains('is-awake') && !el.querySelector('.object-body').style.transform));

  // A. 我的回信：只读回信案例
  await page.locator('[data-piece="blue"]').click();
  await page.waitForTimeout(700);
  checks.replyVisible = await deskVisible()
    && await page.locator('.paper-read').isVisible()
    && await page.locator('.paper-input').isHidden()
    && await page.locator('.paper-share').isHidden()
    && await page.locator('.fold-button').isHidden();
  checks.replyContent = (await page.locator('.paper-read').innerText()).includes('匿名回复')
    && (await page.locator('.paper-read').innerText()).includes('秋招')
    && (await page.locator('.paper-read').innerText()).includes('加油');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  checks.replyCloses = await page.locator('.desk').isHidden();

  // B. 别人的烦恼：上半烦恼 + 下半回信输入
  await page.locator('[data-piece="pink"]').click();
  await page.waitForTimeout(700);
  checks.shareVisible = await deskVisible()
    && await page.locator('.paper-share').isVisible()
    && await page.locator('.paper-read').isHidden()
    && await page.locator('.paper-input').isHidden();
  checks.shareContent = (await page.locator('.paper-share .share-top').innerText()).includes('开学');
  checks.sharePlaceholder = (await page.locator('.share-input').getAttribute('placeholder')) === '鼓励一下TA吧～';
  checks.shareFocus = await page.locator('.share-input').evaluate(el => el === document.activeElement);
  await page.locator('.share-input').fill('开学也没那么可怕，加油！');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  checks.shareCloses = await page.locator('.desk').isHidden();

  // A2. 点击信纸以外区域即退出（三种模式）
  await page.locator('[data-piece="blue"]').click();
  await page.waitForTimeout(600);
  await page.mouse.click(200, 200); // scene background, outside the desk
  await page.waitForTimeout(300);
  checks.outsideClickCloses = await page.locator('.desk').isHidden();
  // A3. 面板间切换：别人的烦恼开着时点我的回信
  await page.locator('[data-piece="pink"]').click();
  await page.waitForTimeout(600);
  await page.locator('[data-piece="blue"]').click();
  await page.waitForTimeout(600);
  checks.panelSwitch = await page.locator('.desk').isVisible()
    && await page.locator('.paper-read').isVisible()
    && await page.locator('.paper-share').isHidden();
  await page.mouse.click(200, 200);
  await page.waitForTimeout(300);

  // C. 写信 → 对折 → 纸飞机 → 投放区点击扔出（回归）
  checks.fontXingkai = await page.evaluate(() => {
    for (const f of ['Xingkai SC', 'STXingkai', 'Kaiti SC']) if (document.fonts.check(`20px "${f}"`)) return f;
    return null;
  });
  await page.locator('[data-piece="letter"]').click();
  await page.waitForTimeout(700);
  checks.writeVisible = await deskVisible() && await page.locator('.paper-input').isVisible()
    && await page.locator('.fold-button').isVisible();
  checks.foldDisabledWhenEmpty = await page.locator('.fold-button').isDisabled();
  await page.locator('.paper-input').fill('今天开会被否定了方案，改了三版还是不对，心里很闷。');
  checks.foldEnabledAfterTyping = await page.locator('.fold-button').isEnabled();
  await page.locator('.fold-button').click();
  await page.waitForTimeout(1000);
  checks.fold1 = await page.locator('.paper').evaluate(el => el.classList.contains('is-fold-1'));
  await page.waitForTimeout(600);
  checks.zoneVisible = await page.locator('.launch-zone').isVisible();
  await page.mouse.move(900, 520, { steps: 12 });
  await page.waitForTimeout(800);
  checks.planeFollows = await page.locator('.flight-plane').evaluate(el => parseFloat(el.style.opacity)) === 1;

  const parseT = t => {
    const r = t.match(/rotate\((-?[\d.]+)deg\)/);
    return { rot: r ? parseFloat(r[1]) : null, mirror: /scaleX\(-1\)/.test(t) };
  };
  await page.mouse.move(1300, 500, { steps: 14 });
  await page.waitForTimeout(900);
  checks.planeUprightRight = parseT(await page.locator('.flight-plane').evaluate(el => el.style.transform)).rot !== null
    && Math.abs(parseT(await page.locator('.flight-plane').evaluate(el => el.style.transform)).rot) <= 90;
  await page.mouse.move(350, 480, { steps: 16 });
  await page.waitForTimeout(1100);
  const leftT = parseT(await page.locator('.flight-plane').evaluate(el => el.style.transform));
  checks.planeUprightLeft = leftT.rot !== null && Math.abs(leftT.rot) <= 90 && leftT.mirror;

  const zoneC = await page.locator('.launch-zone').evaluate(el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(zoneC.x, zoneC.y, { steps: 12 });
  await page.waitForTimeout(900);
  const parkedT = parseT(await page.locator('.flight-plane').evaluate(el => el.style.transform));
  checks.parkedUpLeft = parkedT.mirror && parkedT.rot >= 20 && parkedT.rot <= 75; // nose to upper-left, upright
  checks.zoneArmed = await page.locator('.launch-zone').evaluate(el => el.classList.contains('is-armed'));
  checks.noAutoThrow = await page.locator('.launch-zone').isVisible()
    && (await page.locator('.flight-plane').evaluate(el => parseFloat(el.style.opacity))) === 1;
  await page.mouse.click(zoneC.x, zoneC.y);
  await page.waitForTimeout(2800);
  checks.planeGone = (await page.locator('.flight-plane').evaluate(el => parseFloat(el.style.opacity))) === 0;
  checks.zoneHiddenAfter = await page.locator('.launch-zone').isHidden();
  checks.backToIdle = await page.locator('.desk').isHidden();
  await page.locator('[data-piece="letter"]').click();
  await page.waitForTimeout(600);
  checks.writableAgain = await deskVisible() && (await page.locator('.paper-input').inputValue()) === '';

  console.log(JSON.stringify(checks, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
