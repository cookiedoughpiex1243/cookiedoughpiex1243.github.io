const CLOUD_URL = "https://josh-backend-om8q.onrender.com";
const socket = io(CLOUD_URL);

const messageInput = document.getElementById('userMsg2');
const wrapper = document.querySelector('.cwrapper');
const sendbtn = document.getElementById('sendbtn');
const typeIndicator = document.getElementById("typing-indicator");
let Rid = null;

const site = sessionStorage.getItem("site") || "unknown";
const user = sessionStorage.getItem("user") || "anonymous";


const chatType = (site === "echat" || site === "jchat") ? "private" : "public";


setTimeout(() => {
    document.body.style.display = "flex";
}, 500);

// Join the appropriate room on connection
socket.emit('join_room', chatType);
const notif = new Audio('resources/notification.mp3');
const defaultTitle = document.title;
let newMsgs = 0;
//Da thing to make sure sound not autoblocked
document.addEventListener('click', () => {
    notif.play().then(() => {
        notif.pause();
        notif.currentTime = 0;
    }).catch(e => console.log("Audio not ready yet"));
}, { once: true });
socket.on('receive_message', (msg) => {
    renderMessage(msg);
    if(!hasFocus) {
        notif.play().catch(e => console.warn("Audio play blocked:", e));
        document.title = `(${++newMsgs}) ${defaultTitle}`;
    }
});

socket.on("message_deleted", (id) => {
    const msgElement = wrapper.querySelector(`.messageBox[msg-id='${id}']`);
    if (msgElement) {
        wrapper.removeChild(msgElement);
    }
});

socket.on('chat_cleared', () => {
    wrapper.innerHTML = '<div class="messageBox" style="border:2px solid red"><h4 style="color:red">System</h4>Messages Deleted<h6>Recently</h6></div>';
});

let typingTimeout;
messageInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        
        event.preventDefault();
        sendMessage();
    }
});
let isTyping = false;
messageInput.addEventListener("input", () => {
    clearTimeout(typingTimeout);
    const typingData = {
        room : chatType,
        user : user,
    }
    if(!isTyping) {
        isTyping = true;
        socket.emit("typing", typingData);}
    typingTimeout = setTimeout(() => {
        socket.emit('stop_typing', { room: chatType, user: user }); isTyping = false;
    }, 2000);
});
socket.on("display_typing", () => {
    console.log("displaying typing")
    typeIndicator.style.display = "flex";
});
socket.on("hide_typing", () => {
    console.log("stopping typing");
    typeIndicator.style.display = "none";   
});

async function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;
    socket.emit('stop_typing', { room: chatType, user: user }); isTyping = false;
    if (message === "/logout") {
    setTimeout(() => {isTyping = false;}, 100);
        sessionStorage.removeItem('loggedIn');
        sessionStorage.setItem('site', 'login');
        window.location.replace("login");
        messageInput.value = ''; // Corrected
        return;
    }
    
    
    if (message === "/clearAll") {
        socket.emit("clear_chat", chatType);
        console.log("chat cleared");
        messageInput.value = ''; // Corrected
        return;
     }

    const emojiMap = {
        ":+1:": "👍", ":thumbsup:": "👍", ":grin:": "😄",
        ":sad:": "😢", ":heart:": "❤️", ":rofl:": "🤣",
        ":wink:": "😉", ":sob:": "😭", ":angry:": "😠",
        ":surprised:": "😮", ":cool:": "😎", ":sweat:": "😅",
        ":pensive:": "😔"
    };

    let processedMessage = message.replace(/:[a-z0-9+]+:/gi, (match) => emojiMap[match] || match);

    const msgData = {
        text: processedMessage,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        sender: user,
        room: chatType,
        id: Date.now(),
        Rid: Rid
    };

    try {
        socket.emit('send_message', msgData);
        messageInput.value = '';
        Rid = null;
    } catch (err) {
        console.error("Error sending message:", err);
    }
}

sendbtn.addEventListener('click', sendMessage);

function renderMessage(msg) {
    if (!wrapper || !msg) return;
    const msgRid = msg.Rid ? (document.querySelector(`[msg-id="${msg.Rid}"]`).querySelector('.messageText').textContent || null) : null;

    const sender = msg.sender || "anonymous";
    const senderLower = sender.toLowerCase();
    
    const isMe = (user.toLowerCase() === senderLower);
    const isJosh = (senderLower === "josh");

    const messageElement = document.createElement('div');
    messageElement.classList.add('messageBox');
    messageElement.setAttribute('msg-id', msg.id || Date.now());
    
    if (isMe) {
        messageElement.style.marginLeft = "auto";
    }


    const themeColor = isJosh ? "#00ffff" : "#ff00ff";
    const oppositeThemeColor = isJosh ? "#ea00ff":"#00ffff";
    messageElement.style.border = `2px solid ${themeColor}`;

    const displayName = isJosh ? "Josh" : (senderLower === window.user2Name.toLowerCase() ? window.user2Name : "Anonymous");

    messageElement.innerHTML = `
        <h4 style="color: ${themeColor}">${displayName}</h4>
        ${msgRid !== null ? (`<h6 style="color: ${oppositeThemeColor}"><i>Reply: ${msgRid}</i></h6>`) : ""}
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


let hasFocus = document.hasFocus();
document.addEventListener('visibilitychange', () => {
    if(document.hidden){
    hasFocus = false
    console.log("unfocused");}
    else{
    console.log("focused")
    document.title = defaultTitle;
    newMsgs = 0;
    hasFocus = true;}
});

wrapper.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const selected = event.target.closest(".messageBox");
    if (!selected) return;
    const ID = selected.getAttribute("msg-id");
    socket.emit("delete_message", {room: chatType, id: ID});
    //messageInput.value = `Deleted message with ID ${ID}`;
    //sendMessage();
    
});
wrapper.addEventListener('click', (event) => {
    event.preventDefault();
    messageInput.focus();
    messageInput.style.placeholder = `Replying to another message :D`;
    const selected = event.target.closest(".messageBox");
    if (!selected) return;
    Rid = selected.getAttribute("msg-id");
});

loadHistory();