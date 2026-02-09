const boxoverlay = document.getElementById("myBox");
function openBox() {
  boxoverlay.style.display = "block";
}
function closeBox() {
  boxoverlay.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == boxoverlay) {
    closeBox()
  }
}
  
