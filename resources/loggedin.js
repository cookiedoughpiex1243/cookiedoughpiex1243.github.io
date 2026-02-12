if (sessionStorage.getItem('loggedIn') === 'true') {
  document.body.style.display = "block";
}
else {
  window.location.replace("login");
}
                       
window.onload = function () { //CHANGE TO A BEFORUNLOAD EVENT LISTENER IF ADDING MORE LOCKED PAGES
  sessionStorage.removeItem('loggedIn');
}

