document.addEventListener('DOMContentLoaded', () => {
    // Bring main wrapper to front so hover events hit the UI
    const wrapper = document.querySelector('.wrapper');
    if (wrapper) {
        wrapper.style.position = 'relative';
        wrapper.style.zIndex = '10'; 
    }

    // ============================================
    // Keep Original UI Hover/Tilt Effects
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
