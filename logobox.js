const boxoverlay = document.getElementById("myBox");
function openBox() {
  box.style.display = "block";
}
function closeBox() {
  box.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == boxoverlay) {
    closeBox()
  }
}
  
