const CLOUD_URL = "https://josh-backend-om8q.onrender.com";
const messageInput = document.getElementById('userMsg2');
const wrapper = document.querySelector('.cwrapper');
const sendbtn = document.getElementById('sendbtn');
const user = sessionStorage.getItem("user") || "anonymous"
const site = sessionStorage.getItem("site") || "unknown"
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
            for (let i = lastMsgCount; i < messages.length; i++) {
                const msg = messages[i];
                const messageElement = document.createElement('div');
                messageElement.classList.add('messageBox');
                const user = msg.sender === sessionStorage.getItem("user");
                messageElement.innerHTML = `
                    <h4>${user === "emma" && site === "echat"  ? "Echat." : "jchat"}</h4>
                    <p class="messageText"></p>
                    <h6 class="timestamp">${msg.timestamp}</h6>
                `;
                messageElement.querySelector("h4").innerText = msg.sender;
                messageElement.querySelector('.messageText').textContent = msg.text;
                wrapper.appendChild(messageElement);
            }
            wrapper.scrollTop = wrapper.scrollHeight;
            lastMsgCount = messages.length;
        }
    } catch (err) {
        console.error(err);
    }
}

loadMessages();
setInterval(loadMessages, 750);