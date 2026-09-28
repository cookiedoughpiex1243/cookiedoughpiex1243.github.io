import { animate, createTimeline, stagger, createDraggable, spring } from 'https://esm.sh/animejs';
const logo = document.querySelector('#logo') || null;
let rotations = 0;

animate(logo, {
  scale: [
    { to: 1.25, ease: 'inOut(3)', duration: 200 },
    { to: 1, ease: spring({ bounce: .7 }) }
  ],
  loop: true,
  loopDelay: 250,
});

// Make the logo draggable around its center
createDraggable(logo, {
  container: [0, 0, 0, 0],
  releaseEase: spring({ bounce: .9, stiffness: 0.0})
});
window.user2Name = "Emma";