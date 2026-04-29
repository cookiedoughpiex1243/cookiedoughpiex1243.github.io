const CLOUD_URL = "https://josh-backend-om8q.onrender.com";
const socket = io(CLOUD_URL);

const messageInput = document.getElementById('userMsg2');
const wrapper = document.querySelector('.cwrapper');
const sendbtn = document.getElementById('sendbtn');

const site = sessionStorage.getItem("site") || "unknown";
const user = sessionStorage.getItem("user") || "anonymous";

// Determine which chat "room" or channel to use
const chatType = (site === "echat" || site === "jchat") ? "private" : "public";

// Show the body after a small delay
setTimeout(() => {
    document.body.style.display = "flex";
}, 500);

// Join the appropriate room on connection
socket.emit('join_room', chatType);

// Listen for new messages
socket.on('receive_message', (msg) => {
    renderMessage(msg);
});

'<div class="messageBox" style="border:2px solid red"><h4 style="color:red">System</h4>Press ENTER or the Send button to send Messages</div>';

// Listen for chat clearing
socket.on('chat_cleared', () => {
    wrapper.innerHTML = '<div class="messageBox" style="border:2px solid red"><h4 style="color:red">System</h4>Messages Deleted<h6>Recently</h6></div>';
});

messageInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
let message;
async function sendMessage() {
    message = messageInput.value.trim();
    if (message === '') return;

    if (message === "/logout") {
        localStorage.removeItem('loggedIn');
        sessionStorage.removeItem('loggedIn');
        sessionStorage.setItem('site', 'login');
        window.location.replace("login");
        message = '';
        return;
    }
     if (message === "/clearAll") {
        socket.emit("clear_chat")
        message = '';
     }
    //Emoji Replacement Logic :D
    message = message
    .replaceAll(":grin:", "😄")
    .replaceAll(":sad:", "😢")
    .replaceAll(":heart:", "❤️")
    .replaceAll((":+1:" || ":thumbsup:"), "👍")
    .replaceAll(":rofl:", "🤣")
    .replaceAll(":wink:", "😉")
    .replaceAll(":sob:", "😭")
    .replaceAll(":angry:", "😠")
    .replaceAll(":surprised:", "😮")
    .replaceAll(":cool:", "😎")
    .replaceAll(":sweat:", "😅")
    .replaceAll(":pensive", "😔");
    


    const msgData = {
        text: message,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        sender: user,
        room: chatType
    };

    try {
        socket.emit('send_message', msgData);
        messageInput.value = '';
    } catch (err) {
        console.error("Error sending message:", err);
    }
}

sendbtn.addEventListener('click', sendMessage);

function renderMessage(msg) {
    if (!wrapper || !msg) return;

    const sender = msg.sender || "anonymous";
    const senderLower = sender.toLowerCase();
    
    // Determine alignment: "Me" is always on the right
    const isMe = (user.toLowerCase() === senderLower);
    const isJosh = (senderLower === "josh");

    const messageElement = document.createElement('div');
    messageElement.classList.add('messageBox');
    
    if (isMe) {
        messageElement.style.marginLeft = "auto";
    }

    // Color Logic: Josh is Blue (#00ffff), Others are Pink (#ea00ff)
    const themeColor = isJosh ? "#00ffff" : "#ea00ff";
    messageElement.style.border = `2px solid ${themeColor}`;

    const displayName = isJosh ? "Josh" : (senderLower === "emma" ? "Emma" : "Anonymous");

    messageElement.innerHTML = `
        <h4 style="color: ${themeColor}">${displayName}</h4>
        <p class="messageText"></p>
        <h6 class="timestamp">${msg.timestamp || ""}</h6>
    `;
    messageElement.querySelector('.messageText').textContent = msg.text || "";
    wrapper.appendChild(messageElement);
    wrapper.scrollTop = wrapper.scrollHeight;
}

// Initial load of history via REST (one-time)
async function loadHistory() {
    const endpoint = chatType === "private" ? "loadechat" : "loadcdata1";
    try {
        const res = await fetch(`${CLOUD_URL}/${endpoint}`);
        const messages = await res.json();
        wrapper.innerHTML = ''; 
        messages.forEach(renderMessage);
    } catch (err) {
        console.error("Failed to load history:", err);
    }
}

loadHistory();
