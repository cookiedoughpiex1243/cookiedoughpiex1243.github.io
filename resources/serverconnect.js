const CLOUD_URL = "https://josh-backend-om8q.onrender.com";

async function loadsd1() {
        const status1 = document.getElementById('status1');
        const userMsg1 = document.getElementById('userMsg1');
        const displayArea1 = document.getElementById('displayArea1');

    try {
        const response = await fetch(`${CLOUD_URL}/loadsdata1`);
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status1}`);
        }

        const data = await response.json();
        // Your backend saves { message: text }, so we access data.message
        userMsg1.value = data.message || "";

        if (displayArea1) {
                displayArea1.value = data.message || "No message saved yet";
        }        
        
        status1.innerText = "Loaded from cloud.";
        status1.style.color = "#39ff14";
    } catch (err) {
        console.error("Load error:", err);
        status1.innerText = "Syncing...";
        setTimeout(loadsd1, 5000);
    }
}

async function savesd1() {
const status1 = document.getElementById('status1');
const text = document.getElementById('userMsg1').value;

status1.innerText = "Saving...";

try {
await fetch(`${CLOUD_URL}/savesdata1`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ message: text })
});
status1.innerText = "Saved to server!";
        loadsd1();
} catch (err) {
status1.innerText = "Save failed. Check connection.";
}
}

// Ensure the page is fully loaded before attaching listeners
window.addEventListener('DOMContentLoaded', () => {
loadsd1();

const input = document.getElementById('userMsg1');

// Save on Enter key
input.addEventListener('keypress', (e) => {
if (e.key === 'Enter' && !e.shiftKey) savesd1();
});

// Save when clicking away
input.addEventListener('blur', savesd1);
});



async function loadsd2() {
        const status = document.getElementById('status2');
        const userMsg2 = document.getElementById('userMsg2');
        const displayArea = document.getElementById('displayArea2');

    try {
        const response = await fetch(`${CLOUD_URL}/loadsdata2`);
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        // Your backend saves { message: text }, so we access data.message
        userMsg2.value = data.message || "";

        if (displayArea) {
                displayArea.value = data.message || "No message saved yet";
        }        
        
        status.innerText = "Loaded from cloud.";
        status.style.color = "#39ff14";
    } catch (err) {
        console.error("Load error:", err);
        status.innerText = "Syncing...";
        setTimeout(loadsd2, 5000);
    }
}

async function savesd2() {
const status = document.getElementById('status2');
const text = document.getElementById('userMsg2').value;

status.innerText = "Saving...";

try {
await fetch(`${CLOUD_URL}/savesdata2`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ message: text })
});
status.innerText = "Saved to server!";
        loadsd2();
} catch (err) {
status.innerText = "Save failed. Check connection.";
}
}

// Ensure the page is fully loaded before attaching listeners
window.addEventListener('DOMContentLoaded', () => {
loadsd2();

const input = document.getElementById('userMsg2');

// Save on Enter key
input.addEventListener('keypress', (e) => {
if (e.key === 'Enter' && !e.shiftKey) savesd2();
});

// Save when clicking away
input.addEventListener('blur', savesd2);
});