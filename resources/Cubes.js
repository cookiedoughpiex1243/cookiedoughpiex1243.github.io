// GSAP is only used for the optional click ripple. It is loaded lazily so that
// a blocked/slow CDN can never prevent the core tilt effect from working.
let gsapPromise = null;
const loadGsap = () => (gsapPromise ??= import('https://esm.sh/gsap').then(m => m.default || m).catch(() => null));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initCubes(containerEl, options = {}) {
  if (containerEl._cubesAbort) containerEl._cubesAbort.abort();
  const abort = new AbortController();
  containerEl._cubesAbort = abort;
  const { signal } = abort;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4;

  // Fewer, larger cubes on weak hardware.
  let cubeSize = options.cubeSize || (isMobile ? (lowPower ? 88 : 68) : (lowPower ? 84 : 66));
  let cols = Math.ceil(window.innerWidth / cubeSize);
  let rows = Math.ceil(window.innerHeight / cubeSize);
  const half = cubeSize / 2;

  const maxAngle = options.maxAngle ?? 45;
  const borderStyle = options.borderStyle || '1px solid #00ffff';
  const faceColor = options.faceColor || '#0b1318';
  const rippleColor = options.rippleColor || '#00ffff';
  const rippleSpeed = options.rippleSpeed || 2;
  const autoAnimate = options.autoAnimate !== false && !reduceMotion;
  const rippleOnClick = options.rippleOnClick !== false;
  const radius = options.radius ?? (isMobile ? 2 : 2.5);

  const styleId = 'cubes-style';
  let st = document.getElementById(styleId);
  if (!st) {
    st = document.createElement('style');
    st.id = styleId;
    document.head.appendChild(st);
  }
  st.textContent = `
    .cubes-wrapper{position:fixed;inset:0;width:100vw;height:100vh;overflow:hidden;
      z-index:-10;pointer-events:none;background:${faceColor};}
    .cubes-scene{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      width:${cols * cubeSize}px;height:${rows * cubeSize}px;perspective:1200px;}
    .cubes-grid{display:grid;width:100%;height:100%;
      grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);}
    .cube{position:relative;transform-style:preserve-3d;will-change:transform;
      backface-visibility:hidden;background-color:${faceColor};
      border:${borderStyle};box-sizing:border-box;
      box-shadow:inset 0 0 10px rgba(0,255,255,.10);}
    .cube::before,.cube::after{content:'';position:absolute;inset:0;background-color:inherit;
      border:${borderStyle};box-sizing:border-box;backface-visibility:hidden;}
    .cube::before{transform:rotateX(90deg) translateZ(${half}px);}
    .cube::after{transform:rotateY(90deg) translateZ(${half}px);}
  `;

  containerEl.textContent = '';
  const wrap = document.createElement('div');
  wrap.className = 'cubes-wrapper';
  const scene = document.createElement('div');
  scene.className = 'cubes-scene';
  const grid = document.createElement('div');
  grid.className = 'cubes-grid';
  scene.appendChild(grid);
  wrap.appendChild(scene);
  containerEl.appendChild(wrap);

  const cubes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const el = document.createElement('div');
      el.className = 'cube';
      el.dataset.row = r;
      el.dataset.col = c;
      grid.appendChild(el);
      cubes.push(el);
    }
  }

  const n = cubes.length;
  const curX = new Float32Array(n), curY = new Float32Array(n);
  const tgtX = new Float32Array(n), tgtY = new Float32Array(n);

  // Cache the scene rect; only recomputed on resize/scroll, not per pointer event.
  let rect = scene.getBoundingClientRect();
  const remeasure = () => { rect = scene.getBoundingClientRect(); };

  let px = cols / 2, py = rows / 2;      // current (lerped) pointer, in cell units
  let gx = px, gy = py;                   // goal pointer
  let userActive = false, idleTimer = null, raf = null;
  let running = true;

  const setTargets = (cx, cy) => {
    tgtX.fill(0); tgtY.fill(0);
    const r0 = Math.max(0, Math.floor(cy - radius)), r1 = Math.min(rows - 1, Math.ceil(cy + radius));
    const c0 = Math.max(0, Math.floor(cx - radius)), c1 = Math.min(cols - 1, Math.ceil(cx + radius));
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const d = Math.hypot(r - cy, c - cx);
        if (d > radius) continue;
        const a = (1 - d / radius) * maxAngle;
        const i = r * cols + c;
        tgtX[i] = -a; tgtY[i] = a;
      }
    }
  };

  // Adaptive relief for low-end devices: if frames stay long, stop the
  // always-on idle drift (the single biggest ongoing cost) but keep the effect
  // fully working for real user input. Never destroys the cubes.
  let slowFrames = 0, driftEnabled = autoAnimate;
  let lastT = performance.now();

  const render = (now) => {
    raf = requestAnimationFrame(render);
    if (!running) return;

    const dt = now - lastT; lastT = now;
    if (dt > 34) { if (++slowFrames > 45) driftEnabled = false; }
    else if (slowFrames > 0) slowFrames--;

    px += (gx - px) * 0.18;
    py += (gy - py) * 0.18;

    if (driftEnabled && !userActive) {
      if (Math.hypot(gx - px, gy - py) < 0.15) {
        gx = Math.random() * cols; gy = Math.random() * rows;
      }
    }
    setTargets(px, py);

    // Only cubes that are actually moving get a style write (~30-60 per frame,
    // not all 576). Everything else is skipped entirely.
    for (let i = 0; i < n; i++) {
      const tx = tgtX[i], ty = tgtY[i];
      let cx = curX[i], cy = curY[i];
      if (cx === tx && cy === ty) continue;
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      if (Math.abs(tx - cx) < 0.05) cx = tx;
      if (Math.abs(ty - cy) < 0.05) cy = ty;
      curX[i] = cx; curY[i] = cy;
      cubes[i].style.transform = `rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg)`;
    }
  };
  raf = requestAnimationFrame(render);

  const onMove = (x, y) => {
    userActive = true;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { userActive = false; }, 2600);
    gx = (x - rect.left) / cubeSize;
    gy = (y - rect.top) / cubeSize;
  };

  const opts = { signal, passive: true };
  window.addEventListener('pointermove', e => onMove(e.clientX, e.clientY), opts);
  window.addEventListener('touchmove', e => {
    if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, opts);
  window.addEventListener('scroll', remeasure, opts);
  window.addEventListener('resize', () => {
    clearTimeout(idleTimer);
    remeasure();
  }, opts);

  if (rippleOnClick) {
    // Ripple rings are computed once per click and animated as batched writes,
    // so GSAP is optional here. Warm the cache in the background.
    loadGsap();
    window.addEventListener('click', async e => {
      const gsap = await loadGsap();
      if (!gsap) return; // no CDN: skip ripple, tilt keeps working
      const ch = Math.floor((e.clientX - rect.left) / cubeSize);
      const rh = Math.floor((e.clientY - rect.top) / cubeSize);
      if (ch < 0 || ch >= cols || rh < 0 || rh >= rows) return;
      const maxRing = Math.ceil(Math.hypot(cols, rows));
      for (let ring = 0; ring <= maxRing; ring++) {
        const delay = (ring * 0.12) / rippleSpeed;
        const dur = 0.22 / rippleSpeed;
        const hold = 0.45 / rippleSpeed;
        const batch = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (Math.round(Math.hypot(r - rh, c - ch)) === ring) batch.push(cubes[r * cols + c]);
          }
        }
        if (!batch.length) continue;
        gsap.to(batch, { backgroundColor: rippleColor, duration: dur, delay, ease: 'power2.out' });
        gsap.to(batch, { backgroundColor: faceColor, duration: dur, delay: delay + dur + hold, ease: 'power2.out' });
      }
    }, { signal });
  }

  // Stop burning frames when the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
  }, { signal });

  abort.signal.addEventListener('abort', () => {
    cancelAnimationFrame(raf);
    clearTimeout(idleTimer);
  });
}
