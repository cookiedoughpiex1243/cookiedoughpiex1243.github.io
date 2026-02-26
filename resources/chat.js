const CLOUD_URL = "https://josh-backend-om8q.onrender.com";
if (sessionStorage.getItem("site") == "pchat") {
async function loadChat() {
    const userMsg2 = document.getElementById('userMsg2');
    const displayArea1 = document.getElementById('displayArea1');

    try {
        const response = await fetch(`${CLOUD_URL}/loadcdata1`);
        const data = await response.json();
        
        displayArea1.value = data.message || "no data yet";        
    } catch (err) {
        console.error("Load error:", err);
    }
}

async function pushUpdate() {
    const textValue = document.getElementById("userMsg2").value; 

    try {
        await fetch(`${CLOUD_URL}/savecdata2`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: textValue })
        });
        console.log("Push successful!");
        
 
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


    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) pushUpdate();
    });

    input.addEventListener('blur', pushUpdate);
});
}
else {
    async function loadChat() {
    const userMsg1 = document.getElementById('userMsg1');
    const displayArea2 = document.getElementById('displayArea2');

    try {
        const response = await fetch(`${CLOUD_URL}/loadcdata2`);
        const data = await response.json();
        
        displayArea2.value = data.message || "no data yet";        
    } catch (err) {
        console.error("Load error:", err);
    }
}

async function pushUpdate() {
    const textValue = document.getElementById("userMsg1").value; 

    try {
        await fetch(`${CLOUD_URL}/savecdata1`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: textValue })
        });
        console.log("Push successful!");
        
 
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


    const input = document.getElementById('userMsg1');


    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) pushUpdate();
    });

    input.addEventListener('blur', pushUpdate);
});
}