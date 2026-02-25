const CLOUD_URL = "https://josh-backend-om8q.onrender.com";

async function loadText() {
        const status = document.getElementById('status');
        const userMsg = document.getElementById('userMsg');
        const displayArea = document.getElementById('displayArea');

    try {
        const response = await fetch(`${CLOUD_URL}/load`);
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        // Your backend saves { message: text }, so we access data.message
        userMsg.value = data.message || "";
        
        if (displayArea) {
                displayArea.value = data.message || "No message saved yet";
        }        
        
        status.innerText = "Loaded from cloud.";
        status.style.color = "#39ff14";
    } catch (err) {
        console.error("Load error:", err);
        status.innerText = "Syncing...";
        setTimeout(loadText, 5000);
    }
}

async function saveToServer() {
const status = document.getElementById('status');
const text = document.getElementById('userMsg').value;

status.innerText = "Saving...";

try {
await fetch(`${CLOUD_URL}/save`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ message: text })
});
status.innerText = "Saved to server!";
        loadText();
} catch (err) {
status.innerText = "Save failed. Check connection.";
}
}

// Ensure the page is fully loaded before attaching listeners
window.addEventListener('DOMContentLoaded', () => {
loadText();

const input = document.getElementById('userMsg');

// Save on Enter key
input.addEventListener('keypress', (e) => {
if (e.key === 'Enter' && !e.shiftKey) saveToServer();
});

// Save when clicking away
input.addEventListener('blur', saveToServer);
});