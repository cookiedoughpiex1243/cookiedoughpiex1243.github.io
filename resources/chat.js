const CLOUD_URL = "https://josh-backend-om8q.onrender.com";

// 1. Function to just GET the data from the other page
async function loadChat() {
    const userMsg2 = document.getElementById('userMsg2');
    const displayArea1 = document.getElementById('displayArea1');

    try {
        const response = await fetch(`${CLOUD_URL}/loadsdata1`);
        const data = await response.json();
        
        displayArea1.value = data.message || "no data yet";        
    } catch (err) {
        console.error("Load error:", err);
    }
}

// 2. Function to just PUSH new data to the other page
async function pushUpdate() {
    const textValue = document.getElementById("userMsg2").value; // Get the actual TEXT

    try {
        await fetch(`${CLOUD_URL}/savesdata2`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: textValue })
        });
        console.log("Push successful!");
        
        // Refresh the display area to show it worked
        loadChat(); 
    } catch (err) {
        console.error("Push error:", err);
    }
}

function startAutoSync() {
    setInterval(async () => { { 
            await loadChat();
        }
    }, 750);
}

window.addEventListener('DOMContentLoaded', () => {
    loadChat();
    startAutoSync();


    const input = document.getElementById('userMsg2');

    // Push update when you press Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) pushUpdate();
    });
    
    // Push update when you click away
    input.addEventListener('blur', pushUpdate);
});