import { animate, createTimeline, stagger, createDraggable, spring } from 'https://esm.sh/animejs';
const logo = document.querySelector('#logo');
const rButton = document.querySelector('#rotateButton');
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
createDraggable(rButton, {
  container: [0, 0, 0, 0],
  releaseEase: spring({ bounce: .9, stiffness: 0.0})
});

const rotateLogo = () => {
  rotations++;
  rButton.innerText = `Spinnies done: ${rotations}`;
  animate(logo, {
    rotate: rotations * 360,
    ease: 'out(4)',
    duration: 1500,
  })};

  const rotateTheButton = () => {
  rotations++;
  rButton.innerText = `Spinnies done: ${rotations}`;
  animate(rButton, {
    rotate: rotations * 360,
    ease: 'out(4)',
    duration: 1500,
  })};


  rButton.addEventListener('click', rotateLogo);
  rButton.addEventListener('click', rotateTheButton);
  

  

