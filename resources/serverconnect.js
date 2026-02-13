const CLOUD_URL = "https://josh-backend-om8q.onrender.com";

async function loadText() {
    const status = document.getElementById('status');
    const inputField = document.getElementById('userMsg');
    const displayDiv = document.getElementById('displayArea');

    try {
        const response = await fetch(`${CLOUD_URL}/load`);
        const data = await response.json();

        // Use .message to match your save function
        inputField.value = data.message || "";

        if(displayDiv) {
            displayDiv.value = data.message || "No message saved yet.";
        }

        status.innerText = "Loaded from cloud.";
        status.style.color = "#39ff14"; // Make it green when successful
    } catch (err) {
        status.innerText = "Server is waking up... wait 50s.";
        // Retry every 5 seconds until the server responds
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
