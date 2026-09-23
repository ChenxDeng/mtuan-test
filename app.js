// Each paper object has an independent damped spring and stationary hit area.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const profiles = {
  pink: { lift: 15, lean: -4.2, pitch: 5, phase: .7 },
  blue: { lift: 17, lean: 3.6, pitch: -4, phase: 2.3 },
  letter: { lift: 12, lean: -1.6, pitch: 3, phase: 4.1 },
};
const nudges = {};
for (const button of document.querySelectorAll('.keepsake')) {
  const body = button.querySelector('.object-body');
  const shadow = button.querySelector('.object-shadow');
  const profile = profiles[button.dataset.piece];
  const position = [0, 0, 0, 0, 0], velocity = [0, 0, 0, 0, 0];
  let pointerX = 0, pointerY = 0, hovered = false, focused = false, active = false;
  let frame = 0, previousTime = 0, bounds, nudgeStart = 0;
  /* One-shot lift-and-settle: signals the object is interactive. */
  function nudge() {
    if (reducedMotion.matches || hovered || focused || nudgeStart) return;
    nudgeStart = performance.now();
    button.classList.add('is-awake');
    if (!frame) { previousTime = 0; frame = requestAnimationFrame(tick); }
  }
  nudges[button.dataset.piece] = nudge;
  function wake() {
    active = hovered || focused;
    button.classList.toggle('is-active', active);
    button.classList.add('is-awake');
    if (!frame) { previousTime = 0; frame = requestAnimationFrame(tick); }
  }
  function tick(time) {
    const dt = previousTime ? Math.min((time - previousTime) / 1000, 1 / 30) : 1 / 60;
    previousTime = time;
    const still = reducedMotion.matches, t = time / 1000 + profile.phase;
    let nudgeEnv = 0;
    if (nudgeStart) {
      const e = (time - nudgeStart) / 1000;
      if (e >= 1.7 || hovered || focused) nudgeStart = 0;
      else nudgeEnv = Math.pow(Math.sin((e / 1.7) * Math.PI), 1.15);
    }
    const target = active ? (still ? [0, -3, 0, 0, 0] : [
      pointerX * 2.5 + Math.sin(t * 1.13) * .6,
      -profile.lift + Math.sin(t * 1.47) * .85,
      profile.lean + pointerX * 2 + Math.sin(t * .93) * .65,
      profile.pitch - pointerY * 3, pointerX * 4,
    ]) : [0, -profile.lift * nudgeEnv, profile.lean * .3 * nudgeEnv, profile.pitch * .3 * nudgeEnv, 0];
    let energy = 0;
    for (let axis = 0; axis < position.length; axis++) {
      if (still) { position[axis] = target[axis]; velocity[axis] = 0; }
      else {
        velocity[axis] += ((target[axis] - position[axis]) * 88 - velocity[axis] * 13) * dt;
        position[axis] += velocity[axis] * dt;
      }
      energy += Math.abs(target[axis] - position[axis]) + Math.abs(velocity[axis]);
    }
    const [x, y, roll, pitch, yaw] = position;
    body.style.transform = `perspective(650px) translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, 0) rotateX(${pitch.toFixed(3)}deg) rotateY(${yaw.toFixed(3)}deg) rotateZ(${roll.toFixed(3)}deg)`;
    const height = Math.min(1.2, Math.max(0, -y / profile.lift));
    shadow.style.opacity = (.045 + height * .10).toFixed(3);
    shadow.style.filter = `brightness(0) blur(${(1 + height * 4).toFixed(2)}px)`;
    shadow.style.transform = `translate(${(1 + x * .3).toFixed(2)}px, ${(1 + height * 6).toFixed(2)}px) scale(${(1 - height * .035).toFixed(3)})`;
    if ((!still && active) || energy > .015 || nudgeStart) frame = requestAnimationFrame(tick);
    else {
      frame = 0;
      if (!active) {
        position.fill(0); velocity.fill(0);
        body.style.transform = ''; shadow.style.cssText = '';
        button.classList.remove('is-awake');
      }
    }
  }
  button.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovered = true; bounds = button.getBoundingClientRect(); wake();
  });
  button.addEventListener('pointermove', event => {
    if (!hovered || !bounds) return;
    pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
    pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
  });
  button.addEventListener('pointerleave', () => { hovered = false; pointerX = 0; pointerY = 0; wake(); });
  button.addEventListener('focus', () => { focused = true; wake(); });
  button.addEventListener('blur', () => { focused = false; wake(); });
  button.addEventListener('keydown', event => {
    if (event.key === 'Escape') { button.blur(); hovered = false; wake(); }
  });
  reducedMotion.addEventListener('change', wake);
  // Deliberately no click action in this preview.
}

/* ===== 进场提示与闲置提醒：抬一下、放回去，示意可交互 ===== */
/* 进场：三个物件依次抬起再放下 */
setTimeout(() => nudges.pink && nudges.pink(), 500);
setTimeout(() => nudges.blue && nudges.blue(), 800);
setTimeout(() => nudges.letter && nudges.letter(), 1100);
/* 闲置 10s：钢笔信纸自己抬一下，邀请用户来写 */
let lastActivity = performance.now();
const noteActivity = () => { lastActivity = performance.now(); };
addEventListener('pointermove', noteActivity, { passive: true });
addEventListener('pointerdown', noteActivity, { passive: true });
addEventListener('keydown', noteActivity);
function deskIdle() {
  const desk = document.querySelector('.desk');
  const zone = document.querySelector('.launch-zone');
  return desk.hidden && zone.hidden; // no panel open, no plane in play
}
setInterval(() => {
  if (document.hidden || performance.now() - lastActivity < 10000) return;
  if (!deskIdle()) return;
  nudges.letter && nudges.letter();
}, 10000);

/* ===== 信纸 → 对折一次 → 纸飞机 → 拖到窗外右下角呼吸区扔出（演示流程，不存储任何内容） ===== */
(() => {
  const scene = document.querySelector('.scene');
  const letterButton = document.querySelector('.keepsake--letter');
  const blueButton = document.querySelector('.keepsake--blue');
  const pinkButton = document.querySelector('.keepsake--pink');
  const desk = document.querySelector('.desk');
  const paper = desk.querySelector('.paper');
  const input = desk.querySelector('.paper-input');
  const paperRead = desk.querySelector('.paper-read');
  const paperShare = desk.querySelector('.paper-share');
  const shareInput = desk.querySelector('.share-input');
  const foldButton = desk.querySelector('.fold-button');
  const planeEl = document.querySelector('.flight-plane');
  const zone = document.querySelector('.launch-zone');
  const NOSE_OFFSET = 28; // sprite nose rests ~28deg below horizontal, pointing down-right
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const READY_HEADING = 207; // parked in the launch zone: nose points to the upper-left of the page
  /* 用户图示轨迹（scene 分数坐标）：从窗户右下角向左上方出手，随即俯冲掠过街道上空，
     在左侧兜一个回旋，再向右上飞向远处楼群，按透视渐远渐小。 */
  const WAYPOINTS = [
    [0.580, 0.575], // 出手先向左上抬起（与待发朝向一致）
    [0.500, 0.660], // 俯冲向左掠过街道
    [0.425, 0.615], // 左下低点
    [0.415, 0.550], // 开始回旋向上
    [0.445, 0.500], // 回旋顶部
    [0.505, 0.472], // 翻过顶部向右
    [0.570, 0.466], // 没入远处楼群
  ];

  let state = 'idle'; // idle | writing | reading | sharing | folding | follow | launched
  let plane = { x: 0, y: 0, vx: 0, vy: 0, angle: -30, scale: 1, opacity: 0 };
  let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  let followFrame = 0, followPrev = 0;
  let armed = false;

  /* ---- 面板开合：写信(write) / 我的回信(reply) / 别人的烦恼(share) ---- */
  const PANEL_MODES = { writing: 'write', reading: 'reply', sharing: 'share' };
  function openDesk(mode) {
    if (PANEL_MODES[state] === mode) return; // already open
    if (state !== 'idle' && !PANEL_MODES[state]) return; // mid flight/fold
    state = mode === 'write' ? 'writing' : mode === 'reply' ? 'reading' : 'sharing';
    input.hidden = mode !== 'write';
    paperRead.hidden = mode !== 'reply';
    paperShare.hidden = mode !== 'share';
    foldButton.hidden = mode !== 'write';
    foldButton.disabled = true;
    desk.hidden = false;
    desk.classList.remove('is-folding', 'is-entering');
    void desk.offsetWidth;
    desk.classList.add('is-entering');
    if (mode === 'write') input.focus();
    else if (mode === 'share') shareInput.focus();
  }
  function closeDesk() {
    state = 'idle';
    desk.hidden = true;
    input.value = '';
    shareInput.value = '';
    foldButton.disabled = true;
  }
  letterButton.addEventListener('click', () => openDesk('write'));
  blueButton.addEventListener('click', () => openDesk('reply'));
  pinkButton.addEventListener('click', () => openDesk('share'));
  input.addEventListener('input', () => {
    if (state === 'writing') foldButton.disabled = !input.value.trim();
  });
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && (state === 'writing' || state === 'reading' || state === 'sharing')) closeDesk();
  });
  /* 点击信纸以外的区域即退出；点别的飞机则切换面板 */
  addEventListener('click', event => {
    if (!PANEL_MODES[state]) return;
    if (desk.contains(event.target)) return;
    if (event.target.closest && event.target.closest('.keepsake')) return;
    closeDesk();
  });

  /* ---- 对折一次 → 变成纸飞机 ---- */
  function snapshotText() {
    for (const p of paper.querySelectorAll('.paper-text')) p.textContent = input.value;
  }
  foldButton.addEventListener('click', () => {
    if (state !== 'writing') return;
    state = 'folding';
    snapshotText();
    foldButton.disabled = true;
    desk.classList.add('is-folding');
    paper.classList.add('is-folding');
    const quick = reducedMotion.matches;
    setTimeout(() => paper.classList.add('is-fold-1'), quick ? 60 : 120);
    setTimeout(() => {
      paper.classList.add('is-vanish');
      const r = paper.getBoundingClientRect();
      spawnPlane(r.left + r.width / 2, r.top + r.height * 0.26);
    }, quick ? 380 : 1080);
  });

  function spawnPlane(x, y) {
    plane.x = x; plane.y = y; plane.vx = 0; plane.vy = 0;
    plane.scale = .55; plane.opacity = 0; plane.angle = -30;
    mouse = { x, y: y - 60 };
    state = 'follow';
    armed = false;
    zone.hidden = false;
    zone.classList.remove('is-armed', 'is-done');
    followPrev = 0;
    if (!followFrame) followFrame = requestAnimationFrame(followTick);
    setTimeout(() => { desk.hidden = true; desk.classList.remove('is-folding'); }, 450);
  }

  /* ---- 纸飞机跟随鼠标（阻尼弹簧 + 机头朝向速度方向，永不倒置） ---- */
  const still = () => reducedMotion.matches;
  function zoneCenter() {
    const r = zone.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, radius: r.width * .58 };
  }
  function followTick(time) {
    const dt = followPrev ? Math.min((time - followPrev) / 1000, 1 / 30) : 1 / 60;
    followPrev = time;
    if (state !== 'follow') { followFrame = 0; return; }
    if (still()) {
      plane.x = mouse.x; plane.y = mouse.y; plane.vx = 0; plane.vy = 0;
    } else {
      plane.vx += ((mouse.x - plane.x) * 46 - plane.vx * 11.5) * dt;
      plane.vy += ((mouse.y - plane.y) * 46 - plane.vy * 11.5) * dt;
      plane.x += plane.vx * dt; plane.y += plane.vy * dt;
    }
    plane.opacity = Math.min(1, plane.opacity + dt * 2.2);
    plane.scale = Math.min(1, plane.scale + dt * 1.2);
    /* Zone check first: parked inside → straighten toward the launch direction;
       outside → chase the cursor, freeze when close so wobble cannot spin the nose. */
    const zc = zoneCenter();
    const inZone = Math.hypot(plane.x - zc.x, plane.y - zc.y) < zc.radius;
    if (inZone) arm();
    else disarm();
    if (!still()) {
      if (inZone) {
        const diff = ((READY_HEADING - plane.angle + 540) % 360) - 180;
        plane.angle += diff * Math.min(1, dt * 6);
      } else if (Math.hypot(mouse.x - plane.x, mouse.y - plane.y) > 80) {
        const target = Math.atan2(mouse.y - plane.y, mouse.x - plane.x) * 180 / Math.PI;
        const diff = ((target - plane.angle + 540) % 360) - 180;
        plane.angle += diff * Math.min(1, dt * 5);
      }
    }
    renderPlane();
    followFrame = requestAnimationFrame(followTick);
  }
  /* Heading left would rotate the sprite past 90deg and flip it belly-up.
     Pick whichever of {rotate, mirror+rotate} keeps the tilt smaller, so the plane always stays upright. */
  function renderPlane() {
    const heading = ((plane.angle + 540) % 360) - 180;
    const rU = ((heading - NOSE_OFFSET + 540) % 360) - 180;          // plain rotation
    const rF = ((heading - (180 - NOSE_OFFSET) + 540) % 360) - 180;  // mirrored (scaleX(-1)) then rotated
    let r, mirror;
    if (Math.abs(rU) <= Math.abs(rF)) { r = rU; mirror = ''; }
    else { r = rF; mirror = ' scaleX(-1)'; }
    planeEl.style.opacity = plane.opacity.toFixed(3);
    planeEl.style.transform =
      'translate(' + (plane.x - 59).toFixed(1) + 'px, ' + (plane.y - 45).toFixed(1) + 'px)' +
      ' rotate(' + r.toFixed(2) + 'deg)' + mirror + ' scale(' + plane.scale.toFixed(3) + ')';
  }
  addEventListener('pointermove', event => {
    if (state === 'follow') { mouse.x = event.clientX; mouse.y = event.clientY; }
  });

  /* 停进投放区即摆正待发；点击（任意位置按下）才扔出 */
  function arm() {
    if (!armed) {
      armed = true;
      zone.classList.add('is-armed');
    }
  }
  function disarm() {
    if (armed) {
      armed = false;
      zone.classList.remove('is-armed');
    }
  }
  addEventListener('pointerdown', () => {
    if (state === 'follow' && armed) throwPlane();
  });

  /* ---- 沿图示轨迹飞出：Catmull-Rom 平滑路径 + 透视缩小 ---- */
  function smoothPath(pts) {
    let d = 'M' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += ' C' + (p1.x + (p2.x - p0.x) / 6).toFixed(1) + ' ' + (p1.y + (p2.y - p0.y) / 6).toFixed(1) +
        ' ' + (p2.x - (p3.x - p1.x) / 6).toFixed(1) + ' ' + (p2.y - (p3.y - p1.y) / 6).toFixed(1) +
        ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    return d;
  }
  function smoothstep(a, b, x) {
    const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  }
  function throwPlane() {
    if (state !== 'follow') return;
    state = 'launched';
    disarm();
    zone.classList.add('is-done');
    const r = scene.getBoundingClientRect();
    const pts = [{ x: plane.x, y: plane.y }].concat(
      WAYPOINTS.map(w => ({ x: r.left + r.width * w[0], y: r.top + r.height * w[1] })));
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', smoothPath(pts));
    const len = path.getTotalLength();
    const duration = still() ? 500 : 2400;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const tt = 1 - Math.pow(1 - t, 2.2); // 出手快、飞远缓
      const pt = path.getPointAtLength(tt * len);
      const ahead = path.getPointAtLength(Math.min(len, tt * len + 2));
      plane.x = pt.x; plane.y = pt.y;
      if (ahead.x !== pt.x || ahead.y !== pt.y)
        plane.angle = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI;
      plane.scale = Math.max(.16, 1 - .76 * smoothstep(.18, 1, tt)); // 进入街道上空后按透视缩小
      plane.opacity = tt < .85 ? 1 : Math.max(0, 1 - (tt - .85) / .15);
      renderPlane();
      if (t < 1) requestAnimationFrame(step);
      else finish();
    }
    requestAnimationFrame(step);
  }
  function finish() {
    state = 'idle';
    planeEl.style.opacity = 0;
    zone.hidden = true;
    zone.classList.remove('is-armed', 'is-done');
    paper.classList.remove('is-folding', 'is-fold-1', 'is-vanish');
    input.value = '';
    foldButton.disabled = true;
  }
})();
