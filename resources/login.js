document.getElementById('loginbtn').addEventListener('click', function () {
  const user = document.getElementById('username');
  const pass = document.getElementById('password');
  const message = document.getElementById('message');
  if (user.value == "josh" && pass.value == "347379") {
    message.style.color= "#39ff14";
    message.innerText = " Access Granted, redirecting..";
    setTimeout (() => {
      window.location.href = "https://joyfoodsunshine.com/the-most-amazing-chocolate-chip-cookies"}, 1000);
  }
  else {
    message.style.color = "red";
    message.innerText = " Nope, wrong login :("
  }
});

document.addEventListener('keypress', function (e) {
  if (e.key == 'Enter') {
    document.getElementById('loginbtn').click();
  };
    
