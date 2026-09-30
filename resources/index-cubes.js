import { initCubes } from './Cubes.js';

document.addEventListener('DOMContentLoaded', () => {
    // Explicitly make body and html transparent so the z-index -10 background cubes 
    // sit cleanly at the bottom without being obscured by the default body color,
    // solving the issue of cubes going OVER the page content.
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.backgroundColor = "transparent";

    const container = document.createElement('div');
    container.id = 'cubes-vanilla-root';
    document.body.prepend(container);

    initCubes(container, {
        cubeSize: window.matchMedia('(max-width: 768px)').matches ? 40 : 60, // Exact pixel scale
        radius: window.matchMedia('(max-width: 768px)').matches ? 2 : 2.5,   
        maxAngle: 45,
        borderStyle: '1px solid #00ffff',
        faceColor: '#0b1318',
        rippleColor: '#00ffff',
        rippleSpeed: 2.5, 
        autoAnimate: true,
        rippleOnClick: true
    });
});
