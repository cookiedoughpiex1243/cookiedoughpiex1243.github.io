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
  const remember = document.getElementById('rememberMe');
  const user = document.getElementById('username');
  const uservalue = user.value.toLowerCase();
  const pass = document.getElementById('password');
  const message = document.getElementById('message');
  const correctHash = uservalue === "josh" ? "16405e094d8fdfc89494dcaff572a3a5e119bd6696f8d7ed2082df87a0339ff8" : "61f40cae069b5dd76e75f78c68941defc0645af7039228c434f2fb10add6bb32";
  const inputHash = await hashPassword(pass.value);
  if ((uservalue === "josh" || uservalue === "emma") && inputHash === correctHash) {
    message.style.color= "#39ff14";
    message.innerText = " Access Granted, redirecting..";
    sessionStorage.setItem('user', uservalue);
    remember.checked ? localStorage.setItem('loggedIn', uservalue ==='josh' ? "josh" : "emma"):sessionStorage.setItem('loggedIn', uservalue ==='josh' ? "josh" : "emma");
    if (uservalue === "josh") {
    if (sessionStorage.getItem("site") === "login" || sessionStorage.getItem("locked") !== "true") {
    setTimeout (() => {
      window.location.href = "loggedin";
      message.innerText = ""}, 750);
    }
    
    else {
    setTimeout (() => {
    window.location.href = sessionStorage.getItem("site");
    message.innerText = ""}, 750);
    }
  }
  else {
    window.location.href = "echat";
  }
}
  else {
    localStorage.setItem("loggedIn", "false");
    sessionStorage.setItem("loggedIn", "false");
    message.style.color = "red";
    message.innerText = " Nope, wrong login :("
    pass.value = "";
}
  });
    document.addEventListener('keypress', function (e) {
  if (e.key == 'Enter') {
    const pass = document.getElementById('password');
    if (pass.value !== "") {
    document.getElementById('loginbtn').click();
    }
    else if (pass.value === "" && document.activeElement === pass) message.innerText = " Please enter a password", message.style.color = "red";
    else {
      pass.focus();
    }
    }
    });

    
