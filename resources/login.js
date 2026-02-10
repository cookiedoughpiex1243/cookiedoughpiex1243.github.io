async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.getElementById('loginbtn').addEventListener('click', async function () {
  const user = document.getElementById('username');
  const pass = document.getElementById('password');
  const message = document.getElementById('message');
  const correctHash = "7f7f0709a367503f56e0f3177651c518861d9a9f244199c0d12e86d26219842d";
  const inputHash = await.hashPassword(pass.value);
  if (user.value.toLowerCase() === "josh" && inputHash === correctHash) {
    message.style.color= "#39ff14";
    message.innerText = " Access Granted, redirecting..";
    setTimeout (() => {
      window.location.href = "https://joyfoodsunshine.com/the-most-amazing-chocolate-chip-cookies"}, 1000);
  }
  else {
    message.style.color = "red";
    message.innerText = " Nope, wrong login :("
    pass.value = "";
  }
});

document.addEventListener('keypress', function (e) {
  if (e.key == 'Enter') {
    document.getElementById('loginbtn').click();
  }
  });
    
