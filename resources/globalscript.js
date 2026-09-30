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

// Button hover tilt effect for non-chat pages
const site = sessionStorage.getItem("site");
const isChatSite = ["pchat", "jchat", "echat", "schat"].includes(site);

if (!isChatSite) {
    const buttons = document.querySelectorAll('.download-btn, .back-button');
    buttons.forEach(btn => {
        btn.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
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
}
