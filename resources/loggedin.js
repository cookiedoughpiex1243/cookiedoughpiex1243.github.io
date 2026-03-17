const lock = sessionStorage.getItem("locked");
const loggedIn = sessionStorage.getItem("loggedIn") || localStorage.getItem("loggedIn");

if (loggedIn === lock ) {
  document.body.style = "display: flex";
}
else {
  window.location.replace("login");
}
                       
function logoutbtn () {
  const lobtn = `
  <button class="back-button" id="logout" style="bottom:20px; left:20px; cursor: pointer;position:fixed; background-color:black; color:orangered;">Logout</button>
  `
  document.body.insertAdjacentHTML('beforeend', lobtn);
}

sessionStorage.getItem("site") !== "jchat" && sessionStorage.getItem("site") !== "echat" ? logoutbtn() : null;
const lob = document.getElementById("logout");
document.addEventListener('click', function(e) {
  if (e.target == lob) {
    localStorage.removeItem('loggedIn');
    sessionStorage.removeItem('loggedIn');
    sessionStorage.setItem('site', 'login');
    window.location.replace("login");
  }});


