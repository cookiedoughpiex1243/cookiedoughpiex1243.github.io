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

// Hide logout button on all chat sites
const chatSites = ["jchat", "echat", "pchat", "schat"];
const currentSite = sessionStorage.getItem("site");

if (!chatSites.includes(currentSite)) {
    logoutbtn();
}

const lob = document.getElementById("logout");
document.addEventListener('click', function(e) {
  if (e.target == lob) {
    localStorage.removeItem('loggedIn');
    sessionStorage.removeItem('loggedIn');
    sessionStorage.setItem('site', 'login');
    sessionStorage.setItem("locked", "false");
    window.location.replace("login");
  }});
