if (sessionStorage.getItem('loggedIn') === 'true') {
  document.body.style.display = "block";
}
else {
  window.location.replace("login");
}
                       
function logoutbtn () {
  lobtn = `
  <button class="back-button" id="logout" style="bottom:20px; left:20px; cursor: pointer;position:fixed;">Logout</button>
  `
  document.body.insertAdjacentHTML('beforeend', lobtn);
}

logoutbtn();
const lob = document.getElementById("logout");
document.addEventListener('click', function(e) {
  if (e.target == lob) {
    sessionStorage.removeItem('loggedIn');
    window.location.replace("login");
  }});
