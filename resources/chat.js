const CLOUD_URL = "https://josh-backend-om8q.onrender.com";

// 1. We define the config outside so functions can use it, 
// but we fill it with data inside the listener.
let chatConfig = {};

async function loadChat() {
    if (!chatConfig || !chatConfig.displayId) return;

    const displayArea = document.getElementById(chatConfig.displayId);
    if (!displayArea)
        return;
    console.warn("waiting for display area...");

    try {
        const response = await fetch(`${CLOUD_URL}${chatConfig.loadRoute}`);
        const data = await response.json();
        
        // Anti-flicker: Only update if the content actually changed
        //if (displayArea && displayArea.value !== data.message) {
           displayArea.value = data.message || "Connected, waiting for messages...\nType in the box below to send.";
           if (document.getElementById("status").innerText === "Connecting...") {
           document.getElementById("status").innerText = document.getElementById("status").innerText === "Connecting..." ? "Connected!" :
           document.getElementById("status").innerText;
           setTimeout(() => {
            document.getElementById("status").innerText = "";
            }, 750);
        }
       // }
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

window.addEventListener('DOMContentLoaded', () => {
    const isPChat = sessionStorage.getItem("site") === "pchat";

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
    
    
    loadChat();
    setInterval(loadChat, 750);

    const input = document.getElementById(chatConfig.inputId);
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                pushUpdate();
                document.getElementById("status").style.color = "#39ff14";
                document.getElementById("status").innerText = "Sent!";
                setTimeout(() => {
                    document.getElementById("status").innerText = "";
                }, 2000);
            }
        });
        input.addEventListener('blur', pushUpdate);
    }
});