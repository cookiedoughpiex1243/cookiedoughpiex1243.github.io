import { animate, createTimeline, stagger, createDraggable, spring } from 'https://esm.sh/animejs';
const logo = document.querySelector('#logo') || null;
let rotations = 0;
if(logo){
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
});}
const randomArray = [
  "Joshx1243",
  "cookiedoughpie",
  "Josh's site",
  "Josh's site | Homepage",
  "Josh's site | About page",
  "Josh's site | Autoconnect page", "Kroket ", "Vlinder ", "Been ", "Taart ", "oog ", "banaan ", "kussen ", "vogel ", "laars ", "snor ", "genius", "Phone", "Laptop", "Computer", "Macbook", "iMac", "iPhone", "iPad", "iPod", "Apple Watch", "Emma", "Apple TV", "AirPods", "AirPods Pro", "AirPods Max", "HomePod", "HomePod mini", "iCloud", "Apple Music", "Apple Arcade", "Apple News+", "Apple Fitness+", "Apple One", "Apple Card", "Apple Pay", "Apple Cash", "Apple Store", "App Store", "Mac App Store"
];

window.user2Name = randomArray[26];
window.user2LowerName = window.user2Name.toLowerCase();