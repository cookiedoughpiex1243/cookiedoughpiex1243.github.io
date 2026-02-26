const CLOUD_URL = "https://josh-backend-om8q.onrender.com";

// 1. We define the config outside so functions can use it, 
// but we fill it with data inside the listener.
let chatConfig = {};

async function loadChat() {
    // If the config hasn't been set yet, don't run
    if (!chatConfig.displayId) return;

    const displayArea = document.getElementById(chatConfig.displayId);
    try {
        const response = await fetch(`${CLOUD_URL}${chatConfig.loadRoute}`);
        const data = await response.json();
        
        // Anti-flicker: Only update if the content actually changed
        if (displayArea && displayArea.value !== data.message) {
            displayArea.value = data.message || "no data yet";
        }
    } catch (err) {
        console.error("Load error:", err);
    }
}

async function pushUpdate() {
    if (!chatConfig.inputId) return;

    const input = document.getElementById(chatConfig.inputId);
    try {
        await fetch(`${CLOUD_URL}${chatConfig.saveRoute}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: input.value })
        });
        console.log("Push successful!");
        loadChat(); 
    } catch (err) {
        console.error("Push error:", err);
    }
}

// 2. This is where we link the code to your specific HTML page
window.addEventListener('DOMContentLoaded', () => {
    const isPChat = sessionStorage.getItem("site") === "pchat";

    // Map the routes and IDs based on the page
    chatConfig = isPChat ? {
        inputId: 'userMsg2',
        displayId: 'displayArea1',
        saveRoute: '/savecdata2',
        loadRoute: '/loadcdata1'
    } : {
        inputId: 'userMsg1',
        displayId: 'displayArea2',
        saveRoute: '/savecdata1',
        loadRoute: '/loadcdata2'
    };

    // Initial load and sync start
    loadChat();
    setInterval(loadChat, 750);

    // Event listeners for the Enter key and Blur
    const input = document.getElementById(chatConfig.inputId);
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Stop extra newline
                pushUpdate();
            }
        });
        input.addEventListener('blur', pushUpdate);
    }
});