document.getElementById('loginbtn').addEventListener('click', function () {
  const user = document.getElementById('username');
  const pass = document.getElementById('password');
  const message = document.getElementById('message');
  if (user == "josh" && pass == "347379") {
    message.style.color=#39ff14;
    message.innerText = " Access Granted, redirecting..";
    setTimeout (() => {
      window.location.href = "https://joyfoodsunshine.com"}, 1000);
  }
  else {
    message.innerText = " Nope, wrong login :("
  }
});
    
