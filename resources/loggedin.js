if (sessionStorage.getItem('loggedIn') !== 'true') {
  window.location.href("login");
}

window.onload = function () {
  sessionStorage.removeItem('loggedIn');
}

