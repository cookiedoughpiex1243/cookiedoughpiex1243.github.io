document.addEventListener('DOMContentLoaded', () => {
    // Bring main wrapper to front so hover events hit the UI
    const wrapper = document.querySelector('.wrapper');
    if (wrapper) {
        wrapper.style.position = 'relative';
        wrapper.style.zIndex = '10'; 
    }

    // ============================================
    // 1. BUTTERY SMOOTH CURSOR AURA (LERP + rAF)
    // ============================================
    const cursorGlow = document.createElement('div');
    cursorGlow.style.position = 'fixed';
    cursorGlow.style.width = '350px';
    cursorGlow.style.height = '350px';
    cursorGlow.style.borderRadius = '50%';
    cursorGlow.style.background = 'radial-gradient(circle, rgba(0, 255, 255, 0.15) 0%, rgba(0, 255, 255, 0) 70%)';
    cursorGlow.style.pointerEvents = 'none';
    cursorGlow.style.top = '0';
    cursorGlow.style.left = '0';
    cursorGlow.style.transform = 'translate(-50%, -50%)'; 
    cursorGlow.style.zIndex = '0'; 
    
    // Note: REMOVED CSS transitions to fix the "sluggish" delay! 
    // Now we animate the coordinates via linear interpolation in the requestAnimationFrame render loop directly using GPU-accelerated translate3d.
    document.body.appendChild(cursorGlow);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // ============================================
    // 2. 3D CSS CUBES BACKGROUND CLUSTER 
    // (Inspired directly by ReactBits Cubes Animation)
    // ============================================
    
    const style = document.createElement('style');
    style.innerHTML = `
        .cube-scene {
            position: fixed; 
            top: 0; left: 0; 
            width: 100vw; height: 100vh;
            perspective: 1000px; 
            z-index: 0; 
            pointer-events: none; 
            overflow: hidden;
        }
        .cube-cluster {
            position: absolute; 
            top: 50%; left: 50%; 
            transform-style: preserve-3d;
        }
        .cube-shell {
            position: absolute; 
            transform-style: preserve-3d;
            margin-left: calc(var(--size) / -2);
            margin-top: calc(var(--size) / -2);
        }
        .cube-face {
            position: absolute; 
            width: 100%; height: 100%;
            background: rgba(0, 255, 255, 0.03);
            border: 1px solid rgba(0, 255, 255, 0.3);
            box-shadow: inset 0 0 15px rgba(0, 255, 255, 0.1);
        }
        .cube-face.front  { transform: rotateY(0deg) translateZ(calc(var(--size) / 2)); }
        .cube-face.right  { transform: rotateY(90deg) translateZ(calc(var(--size) / 2)); }
        .cube-face.back   { transform: rotateY(180deg) translateZ(calc(var(--size) / 2)); }
        .cube-face.left   { transform: rotateY(-90deg) translateZ(calc(var(--size) / 2)); }
        .cube-face.top    { transform: rotateX(90deg) translateZ(calc(var(--size) / 2)); }
        .cube-face.bottom { transform: rotateX(-90deg) translateZ(calc(var(--size) / 2)); }
    `;
    document.head.appendChild(style);

    const scene = document.createElement('div');
    scene.className = 'cube-scene';
    const cluster = document.createElement('div');
    cluster.className = 'cube-cluster';
    scene.appendChild(cluster);
    document.body.prepend(scene); 

    const numCubes = 25; 
    for(let i = 0; i < numCubes; i++) {
        const shell = document.createElement('div');
        shell.className = 'cube-shell';
        
        // Random sizes constraint
        const size = Math.floor(15 + Math.random() * 60); 
        shell.style.setProperty('--size', size + 'px');
        shell.style.width = size + 'px';
        shell.style.height = size + 'px';
        
        const radius = 350;
        const x = (Math.random() - 0.5) * radius * 2;
        const y = (Math.random() - 0.5) * radius * 2;
        const z = (Math.random() - 0.5) * radius * 2;
        
        shell.dataset.x = x; 
        shell.dataset.y = y; 
        shell.dataset.z = z;
        shell.dataset.rx = Math.random() * 360; 
        shell.dataset.ry = Math.random() * 360; 
        
        // Rotation speeds
        shell.dataset.rsx = (Math.random() - 0.5) * 1.2; 
        shell.dataset.rsy = (Math.random() - 0.5) * 1.2; 
        
        ['front','right','back','left','top','bottom'].forEach(f => {
            const face = document.createElement('div');
            face.className = `cube-face ${f}`;
            shell.appendChild(face);
        });
        cluster.appendChild(shell);
    }

    let tgtRX = 0, tgtRY = 0;
    let cluRX = 0, cluRY = 0;

    // ============================================
    // MAIN RENDER LOOP 
    // ============================================
    function render() {
        // 1. Lerp Aura Glow (Smooth tracking using momentum logic rather than CSS)
        glowX += (mouseX - glowX) * 0.2;
        glowY += (mouseY - glowY) * 0.2;
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;

        // 2. Parallax cluster rotation based on mouse orientation
        const xPct = (mouseX / window.innerWidth) - 0.5;
        const yPct = (mouseY / window.innerHeight) - 0.5;
        
        tgtRY = xPct * 30; // Max horizontal tilt
        tgtRX = -yPct * 30; // Max vertical tilt
        
        cluRX += (tgtRX - cluRX) * 0.05; // Lerp rotation
        cluRY += (tgtRY - cluRY) * 0.05;
        
        cluster.style.transform = `rotateX(${cluRX}deg) rotateY(${cluRY}deg)`;

        // 3. Local continuous spinning for each mini cube
        const cubes = cluster.children;
        for (let i = 0; i < cubes.length; i++) {
            const shell = cubes[i];
            
            let rx = parseFloat(shell.dataset.rx) + parseFloat(shell.dataset.rsx);
            let ry = parseFloat(shell.dataset.ry) + parseFloat(shell.dataset.rsy);
            
            shell.dataset.rx = rx; 
            shell.dataset.ry = ry;
            
            const x = shell.dataset.x;
            const y = shell.dataset.y;
            const z = shell.dataset.z;
            
            shell.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        }

        requestAnimationFrame(render);
    }
    
    requestAnimationFrame(render);

    // ============================================
    // 3. Keep Original UI Hover/Tilt Effects
    // ============================================
    const buttons = document.querySelectorAll('.download-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = (y / (rect.height / 2)) * -12; 
            const rotateY = (x / (rect.width / 2)) * 12;
            
            btn.style.transform = `perspective(800px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            btn.style.boxShadow = `${-rotateY * 0.5}px ${rotateX * 0.5}px 15px rgba(0,255,255,0.4)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'perspective(800px) scale(1) rotateX(0) rotateY(0)';
            btn.style.boxShadow = '';
        });
    });

    const header = document.querySelector('h1');
    if(header) {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            header.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            header.style.transform = 'scale(1.2) rotate(360deg)';
            setTimeout(() => {
                header.style.transition = 'transform 0.4s ease-out';
                header.style.transform = 'scale(1) rotate(0deg)';
            }, 600);
        });
    }

    const bigpfp = document.querySelector('.bigpfp');
    if(bigpfp) {
        bigpfp.addEventListener('mouseover', () => {
            bigpfp.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            bigpfp.style.borderRadius = '15%';
            bigpfp.style.transform = 'rotate(-10deg) scale(1.15)';
            bigpfp.style.boxShadow = '0 0 35px rgba(0, 255, 255, 1)';
        });
        bigpfp.addEventListener('mouseout', () => {
             bigpfp.style.borderRadius = '50%';
             bigpfp.style.transform = 'rotate(0deg) scale(1)';
             bigpfp.style.boxShadow = '0 0 25px rgba(0,0,0,0.7)';
        });
    }
});