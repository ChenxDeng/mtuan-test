// Each paper object has an independent damped spring and stationary hit area.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const profiles = {
  pink: { lift: 15, lean: -4.2, pitch: 5, phase: .7 },
  blue: { lift: 17, lean: 3.6, pitch: -4, phase: 2.3 },
  letter: { lift: 12, lean: -1.6, pitch: 3, phase: 4.1 },
};
for (const button of document.querySelectorAll('.keepsake')) {
  const body = button.querySelector('.object-body');
  const shadow = button.querySelector('.object-shadow');
  const profile = profiles[button.dataset.piece];
  const position = [0, 0, 0, 0, 0], velocity = [0, 0, 0, 0, 0];
  let pointerX = 0, pointerY = 0, hovered = false, focused = false, active = false;
  let frame = 0, previousTime = 0, bounds;
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
    const target = active ? (still ? [0, -3, 0, 0, 0] : [
      pointerX * 2.5 + Math.sin(t * 1.13) * .6,
      -profile.lift + Math.sin(t * 1.47) * .85,
      profile.lean + pointerX * 2 + Math.sin(t * .93) * .65,
      profile.pitch - pointerY * 3, pointerX * 4,
    ]) : [0, 0, 0, 0, 0];
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
    if ((!still && active) || energy > .015) frame = requestAnimationFrame(tick);
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
