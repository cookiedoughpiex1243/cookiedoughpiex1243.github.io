const CLOUD_URL = "https://josh-backend-om8q.onrender.com";
const messageInput = document.getElementById('userMsg2');
const wrapper = document.querySelector('.cwrapper');
const sendbtn = document.getElementById('sendbtn');
const user = sessionStorage.getItem("user") || "anonymous"
let site = sessionStorage.getItem("site") || "unknown";

// Force site update based on URL to prevent stale session data
if (window.location.href.includes("jchat")) site = "jchat";
else if (window.location.href.includes("echat")) site = "echat";

messageInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();}
});

async function sendMessage() {
    const message = messageInput.value;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    if (message === '') return;

    try {
        await fetch(`${CLOUD_URL}/saveechat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: message,
                timestamp: time,
                sender: sessionStorage.getItem("user") || "anon"
            })
        });
        messageInput.value = '';
        loadMessages();
    } catch (err) {
        console.error("Error sending message:", err);
    }
}

sendbtn.addEventListener('click', sendMessage);



let lastMsgCount = 0;
async function loadMessages() {
    try {
        const res = await fetch(`${CLOUD_URL}/loadechat`);
        const messages = await res.json();
        if (messages.length > lastMsgCount) {
            if (!wrapper) return;

            for (let i = lastMsgCount; i < messages.length; i++) {
                const msg = messages[i];
                if (!msg) continue;
                const sender = msg.sender || "anonymous";
                const senderLower = sender.toLowerCase();

                // Determine if the message should be aligned to the right.
                const alignRight = (site === 'echat' && senderLower === 'emma') || (site === 'jchat' && senderLower === 'josh');

                const messageElement = document.createElement('div');
                messageElement.classList.add('messageBox');
                if (alignRight) {
                    messageElement.style.marginLeft = "auto";
                }
                
                const user = sender.charAt(0).toUpperCase() + sender.slice(1); //uhh 0th letter capitalised + every other letter after first one.
                messageElement.innerHTML = `
                    <h4 style="${senderLower === "emma" ? "color: #ea00ff" : "color: #00ffff"}">${user}</h4>
                    <p class="messageText"></p>
                    <h6 class="timestamp">${msg.timestamp || ""}</h6>
                `;
                messageElement.querySelector('.messageText').textContent = msg.text || "";
                wrapper.appendChild(messageElement);

            }
            wrapper.scrollTop = wrapper.scrollHeight;
            lastMsgCount = messages.length;
        }
    } catch (err) {
        console.error(err);
    }
}

async function clearChat() {
    if (!confirm("Delete all messages for everyone?")) return;

    try {
        await fetch(`${CLOUD_URL}/deleteechat`, { method: 'DELETE' });
        wrapper.innerHTML = ''; // Clear the screen immediately
    } catch (err) {
        console.error("Failed to clear chat:", err);
    }
}

loadMessages();
setInterval(loadMessages, 750);