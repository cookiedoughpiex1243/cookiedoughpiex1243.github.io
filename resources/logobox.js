function injectOverlay() {
  OverlayHTML = ` 
    <div id="myBox" class="boxoverlay">
    <a href="login" class="download-btn" style="top: 20px; left: 20px; position: fixed;">Login</a>
    <div class="box">
      <span class="closebtn" onclick="closeBox()">&times;</span>
      <h2 class="glow-cyan"> Extra Info</h2>
      <p> YIPPEE you clicked the cookie!</p>
      <button class="download-btn" onclick="closeBox()"> Cool, im done</button>
    </div>
  </div> `;
  
document.body.insertAdjacentHTML('beforeend', OverlayHTML)
}

  injectOverlay();

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
  
