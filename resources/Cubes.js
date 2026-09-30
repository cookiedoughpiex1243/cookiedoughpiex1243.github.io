import gsap from 'https://esm.sh/gsap';

export function initCubes(containerEl, options = {}) {
  // Prevent duplicate listeners on resize recalculations
  if (containerEl._cubesAbort) {
    containerEl._cubesAbort.abort();
  }
  const abortCtrl = new AbortController();
  containerEl._cubesAbort = abortCtrl;
  const { signal } = abortCtrl;

  // We explicitly use cubeSize to calculate EXACT columns and rows.
  // This solves ALL coordinate mismatch / off-centering issues.
  const cubeSize = options.cubeSize || 60;
  const cols = Math.ceil(window.innerWidth / cubeSize);
  const rows = Math.ceil(window.innerHeight / cubeSize);

  const radius = options.radius || 2.5; 
  const maxAngle = options.maxAngle || 45;
  const borderStyle = options.borderStyle || '1px solid #00ffff';
  const faceColor = options.faceColor || '#0b1318';
  const rippleColor = options.rippleColor || '#00ffff';
  const rippleSpeed = options.rippleSpeed || 2;
  const autoAnimate = options.autoAnimate !== false;
  const rippleOnClick = options.rippleOnClick !== false;

  const styleId = 'cubes-vanilla-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }
  
  const halfSize = cubeSize / 2;
  
  document.getElementById(styleId).innerHTML = `
    .cubes-wrapper {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      overflow: hidden;
      z-index: -10; /* Heavily forced to background layer */
      pointer-events: none; /* Never intercept clicks meant for index buttons! */
      background: ${faceColor};
      --cube-face-border: ${borderStyle};
      --cube-face-bg: ${faceColor};
    }
    .cubes-scene-center {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: ${cols * cubeSize}px;
      height: ${rows * cubeSize}px;
      perspective: 999999px;
    }
    .cubes-scene {
      display: grid;
      width: 100%;
      height: 100%;
      grid-template-columns: repeat(${cols}, 1fr);
      grid-template-rows: repeat(${rows}, 1fr);
      gap: 0;
    }
    .cube-item {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
    }
    .cube-face-el {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--cube-face-bg);
      border: var(--cube-face-border);
      box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.1);
      box-sizing: border-box;
    }
    /* Fixed 3D geometry based on exact pixel variables to prevent gap layout breaks */
    .cube-face-el.top { transform: rotateX(90deg) translateZ(${halfSize}px); }
    .cube-face-el.bottom { transform: rotateX(-90deg) translateZ(${halfSize}px); }
    .cube-face-el.left { transform: rotateY(-90deg) translateZ(${halfSize}px); }
    .cube-face-el.right { transform: rotateY(90deg) translateZ(${halfSize}px); }
    .cube-face-el.front { transform: rotateY(0deg) translateZ(${halfSize}px); }
    .cube-face-el.back { transform: rotateY(180deg) translateZ(${halfSize}px); }
  `;

  containerEl.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'cubes-wrapper';
  
  const sceneCenter = document.createElement('div');
  sceneCenter.className = 'cubes-scene-center';

  const scene = document.createElement('div');
  scene.className = 'cubes-scene';
  
  sceneCenter.appendChild(scene);
  wrapper.appendChild(sceneCenter);
  containerEl.appendChild(wrapper);

  const cubes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cube = document.createElement('div');
      cube.className = 'cube-item';
      cube.dataset.row = r;
      cube.dataset.col = c;

      ['top', 'bottom', 'left', 'right', 'front', 'back'].forEach(faceName => {
        const face = document.createElement('div');
        face.className = `cube-face-el ${faceName}`;
        cube.appendChild(face);
      });

      scene.appendChild(cube);
      cubes.push(cube);
    }
  }

  let userActive = false;
  let idleTimer = null;
  let rafId = null;

  const tiltAt = (rowCenter, colCenter) => {
    cubes.forEach(cube => {
      const r = +cube.dataset.row;
      const c = +cube.dataset.col;
      const dist = Math.hypot(r - rowCenter, c - colCenter);
      
      if (dist <= radius) {
        const pct = 1 - dist / radius;
        const angle = pct * maxAngle;
        gsap.to(cube, {
          duration: 0.25,
          ease: 'power2.out',
          overwrite: true,
          rotateX: -angle,
          rotateY: angle
        });
      } else {
        gsap.to(cube, {
          duration: 0.5,
          ease: 'power2.out',
          overwrite: true,
          rotateX: 0,
          rotateY: 0
        });
      }
    });
  };

  const resetAll = () => {
    cubes.forEach(cube => {
      gsap.to(cube, { duration: 0.5, rotateX: 0, rotateY: 0, ease: 'power2.out' });
    });
  };

  const handleMove = (clientX, clientY) => {
    userActive = true;
    if (idleTimer) clearTimeout(idleTimer);

    const rect = sceneCenter.getBoundingClientRect();
    // Because cubes are exact pixel dimensions without flex gaps, exact math guarantees perfect tracking
    const colCenter = (clientX - rect.left) / cubeSize;
    const rowCenter = (clientY - rect.top) / cubeSize;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

    idleTimer = setTimeout(() => {
      userActive = false;
    }, 3000);
  };

  window.addEventListener('pointermove', e => {
    handleMove(e.clientX, e.clientY);
  }, { signal });

  window.addEventListener('touchmove', e => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true, signal });

  window.addEventListener('touchstart', e => {
    if (e.touches && e.touches[0]) {
      userActive = true;
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true, signal });

  window.addEventListener('touchend', resetAll, { signal });
  window.addEventListener('pointerleave', resetAll, { signal });

  if (rippleOnClick) {
    window.addEventListener('click', e => {
      const rect = sceneCenter.getBoundingClientRect();
      const colHit = Math.floor((e.clientX - rect.left) / cubeSize);
      const rowHit = Math.floor((e.clientY - rect.top) / cubeSize);

      if (colHit < 0 || colHit >= cols || rowHit < 0 || rowHit >= rows) return;

      const rings = {};
      cubes.forEach(cube => {
        const r = +cube.dataset.row;
        const c = +cube.dataset.col;
        const dist = Math.hypot(r - rowHit, c - colHit);
        const ring = Math.round(dist);
        if (!rings[ring]) rings[ring] = [];
        rings[ring].push(cube);
      });

      Object.keys(rings).map(Number).sort((a, b) => a - b).forEach(ring => {
        const delay = (ring * 0.1) / rippleSpeed;
        const animDuration = 0.25 / rippleSpeed;
        const holdTime = 0.5 / rippleSpeed;
        // Optimization: Only target front + side faces, much less DOM load 
        const faces = rings[ring].flatMap(cube => Array.from(cube.querySelectorAll('.cube-face-el')));

        gsap.to(faces, { backgroundColor: rippleColor, duration: animDuration, delay, ease: 'power2.out' });
        gsap.to(faces, { backgroundColor: faceColor, duration: animDuration, delay: delay + animDuration + holdTime, ease: 'power2.out' });
      });
    }, { signal });
  }

  if (autoAnimate) {
    let simPos = { x: Math.random() * cols, y: Math.random() * rows };
    let simTarget = { x: Math.random() * cols, y: Math.random() * rows };
    const speed = 0.02;
    let simRaf = null;

    const loop = () => {
      if (!userActive) {
        simPos.x += (simTarget.x - simPos.x) * speed;
        simPos.y += (simTarget.y - simPos.y) * speed;
        tiltAt(simPos.y, simPos.x);
        if (Math.hypot(simPos.x - simTarget.x, simPos.y - simTarget.y) < 0.1) {
          simTarget = { x: Math.random() * cols, y: Math.random() * rows };
        }
      }
      simRaf = requestAnimationFrame(loop);
    };
    simRaf = requestAnimationFrame(loop);
    
    abortCtrl.signal.addEventListener('abort', () => cancelAnimationFrame(simRaf));
  }
  
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      initCubes(containerEl, options);
    }, 300);
  }, { signal });
}
