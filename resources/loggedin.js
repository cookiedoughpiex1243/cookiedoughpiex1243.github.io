if (sessionStorage.getItem('loggedIn') === 'true') {
}
else {
  window.location.href = "login";
}
                       
window.onload = function () {
  sessionStorage.removeItem('loggedIn');
}

