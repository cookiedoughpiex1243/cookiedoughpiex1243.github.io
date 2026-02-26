if (!sessionStorage.getItem("site")) {
    sessionStorage.setItem("site", "login");
};
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
  const correctHash = "16405e094d8fdfc89494dcaff572a3a5e119bd6696f8d7ed2082df87a0339ff8";
  const inputHash = await hashPassword(pass.value);
  if (user.value.toLowerCase() === "josh" && inputHash === correctHash) {
    message.style.color= "#39ff14";
    message.innerText = " Access Granted, redirecting..";
    sessionStorage.setItem('loggedIn', 'true');
    if (sessionStorage.getItem("site") === "login") {
    setTimeout (() => {
      window.location.href = "loggedin";
      message.innerText = ""}, 1000);
    }
    
    else {
    setTimeout (() => {
    window.location.href = sessionStorage.getItem("site");
    message.innerText = ""}, 1000);
    }
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

    
