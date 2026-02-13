if (sessionStorage.getItem('loggedIn') === 'true') {
  document.body.style.display = "block";
}
else {
  window.location.replace("login");
}
                       
window.addEventListener('beforeunload', function () {
  sessionStorage.removeItem('loggedIn');
});

