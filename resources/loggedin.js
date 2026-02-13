if (sessionStorage.getItem('loggedIn') === 'true') {
  document.body.style.display = "block";
}
else {
  window.location.replace("login");
}
                       
function logoutbtn () {
  lobtn = `
  <button class="back-button" style="bottom:20px; left:20px; cursor: pointer;">Logout</button>
  `
  document.body.insertAdjacentHtml('beforeend', lobtn);
}
