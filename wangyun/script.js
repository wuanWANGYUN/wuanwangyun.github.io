(() => {
  'use strict';
  const canvas = document.querySelector('#starfield');
  const toggle = document.querySelector('#motion-toggle');
  const context = canvas?.getContext('2d');
  if (!canvas || !context || !toggle) return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'wangyun-starfield-motion';
  let savedPreference = null;
  try { savedPreference = localStorage.getItem(storageKey); } catch { /* Storage may be unavailable. */ }
  let enabled = !preference.matches && savedPreference !== 'off';
  let frame = 0;
  let lastTime = 0;
  let phase = 0;
  let width = 0;
  let height = 0;
  let stars = [];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(180, Math.max(55, Math.floor(width * height / 6500)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * .9 + .3,
      opacity: Math.random() * .35 + .2,
      offset: Math.random() * Math.PI * 2,
      speed: Math.random() * 1.8 + .6,
    }));
    draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      const alpha = star.opacity + Math.sin(phase * .45 + star.offset) * .12;
      const x = (star.x + phase * star.speed * .38) % width;
      const y = (star.y - phase * star.speed * .15 % height + height) % height;
      context.beginPath();
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(196,218,244,${alpha})`;
      context.fill();
    }
  }

  function animate(time) {
    if (!enabled || document.hidden) { frame = 0; return; }
    if (lastTime) phase += Math.min((time - lastTime) / 1000, .05);
    lastTime = time;
    draw();
    frame = requestAnimationFrame(animate);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    document.body.classList.toggle('motion-on', enabled && !document.hidden);
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? '暂停星空动效' : '开启星空动效');
    toggle.querySelector('.motion-label').textContent = enabled ? '暂停星空动效' : '开启星空动效';
    if (enabled && !document.hidden) frame = requestAnimationFrame(animate);
    else draw();
  }

  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(storageKey, enabled ? 'on' : 'off'); } catch { /* Keep the control working without storage. */ }
    sync();
  });
  preference.addEventListener('change', () => {
    if (preference.matches) enabled = false;
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resize, { passive: true });
  resize();
  sync();
})();
