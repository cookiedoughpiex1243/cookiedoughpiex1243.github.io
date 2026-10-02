const lock = sessionStorage.getItem("locked");
<<<<<<< HEAD
const loggedIn = sessionStorage.getItem("loggedIn") || localStorage.getItem("loggedIn");

if (loggedIn === lock || (window.location.pathname == "/echat" && lock != "josh" && lock != "false")) {
  document.body.style = "display: flex";
=======
const loggedIn = sessionStorage.getItem("loggedIn") ? sessionStorage.getItem('loggedIn') : "unauthorized" || localStorage.getItem("loggedIn");
const currentSite = sessionStorage.getItem("site");
if ((loggedIn === lock || (currentSite === "echat" && lock != "josh" && lock != "false")) && loggedIn != "unauthorized" && loggedIn != "undefined") {
  document.body.style = "display: flex"; (console.log("Logged in! (" + loggedIn + ")"));
>>>>>>> dev-frontend-branch
}
else {
  console.log("User not logged in or session expired. Redirecting to login page.");
  console.log(lock);
  console.log(loggedIn);
  document.body.style.visibilty = 'hidden';
  document.body.replaceChildren();
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
