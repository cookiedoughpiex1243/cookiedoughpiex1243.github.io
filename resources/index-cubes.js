import { initCubes } from './Cubes.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.id = 'cubes-vanilla-root';
    document.body.prepend(container);

    initCubes(container, {
        maxAngle: 45,
        borderStyle: '1px solid #00ffff',
        faceColor: '#0b1318',
        rippleColor: '#00ffff',
        rippleSpeed: 2.5,
        autoAnimate: true,
        rippleOnClick: true
    });
});
