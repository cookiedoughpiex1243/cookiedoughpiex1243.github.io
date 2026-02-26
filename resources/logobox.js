function injectOverlay() {
  OverlayHTML = ` 
    <div id="myBox" class="boxoverlay">
    
    <a href="login" 
    class="download-btn" 
    style="top: 20px; z-index: 2000; right: 20px; padding: 10px; position: fixed; color: #39ff14; background: #0b0c10; width: auto;">
    Login
    </a>
    
    <div class="box">
      <span class="closebtn" onclick="closeBox()">&times;</span>
      <h2 class="glow-cyan"> Extra Info</h2>
      <p> YIPPEE you clicked the cookie!</p>
      <p>Macbook ID = <span class="code-highlight">1 873 105 873</span></p>
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
  
