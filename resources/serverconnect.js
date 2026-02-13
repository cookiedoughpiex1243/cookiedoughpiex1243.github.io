const CLOUD_URL = "https://josh-backend-om8q.onrender.com";

async function loadText() {
    const status = document.getElementById('status');
    const inputField = document.getElementById('userMsg');
    const displayDiv = document.getElementById('displayArea');

    try {
        const response = await fetch(`${CLOUD_URL}/load`);
        const data = await response.json();

        inputField.value = data.message || "";

        if(displayDiv) {
            displayDiv.innerText = data.message || "No message saved yet.";
        }

        status.innerText = "Loaded from cloud.";
    } catch (err) {
        status.innerText = "Server is waking up... wait 50s.";
        setTimeout(loadText, 5000);
    }
}

window.onload = loadText;

async function saveToServer() {
    const text = document.getElementById('userMsg').value;
    await fetch(`${CLOUD_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    });
    alert("Saved to server");
}

// 1. Save when the user clicks 'Enter' inside the input
document.getElementById('userMsg').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        saveToServer();
    }
});

// 2. OR Save when the user clicks away from the input (blur)
document.getElementById('userMsg').addEventListener('blur', saveToServer);
