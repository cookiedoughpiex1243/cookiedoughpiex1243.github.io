const CLOUD_URL = "https://josh-backend-om8q.onrender.com";
const socket = io(CLOUD_URL);

let clicked = false;
let lastSentDate;
let lastReplied = null;
let lastRepliedID = null;
let msgCount = null;
const isMobile = isTouchDevice;
const messageInput = document.getElementById('userMsg2');
const wrapper = document.querySelector('.cwrapper');
const sendbtn = document.getElementById('sendbtn');
const typeIndicator = document.getElementById("typing-indicator");
const replyIndicator = document.getElementById("replying-indicator");
let Rid = null;

const site = sessionStorage.getItem("site") || "unknown";
const user = sessionStorage.getItem("user") || "anonymous";


const chatType = (site === "echat" || site === "jchat") ? "private" : "public";

function sendSystemMessage(msg) {
    const msgData = {
        text: msg,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        sender: "System",
        room: chatType,
        id: Date.now(),
        Rid: Rid
    };
    socket.emit("send_message", msgData);
}

function cancelReply() {
    if(lastReplied != null) {
    const lastReplySenderColor = lastReplied.querySelector("h4").style.color;
	
		Rid = null;
		lastReplied.style.border = `2px solid ${lastReplySenderColor}`;
	}	
}

function selectReply() {
    messageInput.focus();
	cancelReply();
    const selected = event.target.closest(".messageBox");
    lastReplied = selected;
	if (!selected) return;
    Rid = selected.getAttribute("msg-id");
    selected.style.border = "2px solid red";
    replyIndicator.style.display = "flex";
}

setTimeout(() => {
    document.body.style.display = "flex";
    console.log("Touchscreen: "+isMobile);
}, 500);

//Join socket room(idk) on connecting
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
    if (message === '') {
		cancelReply()
        replyIndicator.style.display = "none";
        socket.emit('stop_typing', { room: chatType, user: user }); isTyping = false;
        return;}
    switch(message) {
        case '/logout':
            setTimeout(() => {isTyping = false;}, 100);
            sessionStorage.removeItem('loggedIn');
            sessionStorage.setItem('site', 'login');
            window.location.replace("login");
            messageInput.value = ''; 
            return;
            break;
        case '/help':
const msg = `Hello :D, here's some information:
/logout to logout (or just redirect to login page
/help for this message :D)`
            sendSystemMessage(msg)
            messageInput.value = '';
            break;
        case '/clearall':
        socket.emit("clear_chat", chatType);
        console.log("chat cleared");
        messageInput.value = '';
        return;
        default:
    
    

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
        if (Rid != null) replyIndicator.style.display = "flex" ? replyIndicator.style.display = "none" : null;
        cancelReply();
    } catch (err) {
        console.error("Error sending message:", err);
    }
    break;
    }
}


sendbtn.addEventListener('click', sendMessage);

function renderMessage(msg) {
    if (!wrapper || !msg) return;
    const msgRid = msg.Rid ? (document.querySelector(`[msg-id="${msg.Rid}"]`).querySelector('.messageText').textContent || null) : null;
    const sentDate = new Date(msg.id).toString().split(" ").slice(0, 4).join(" ");
    const sender = msg.sender || "anonymous";
    const senderLower = sender.toLowerCase();
    
    const isMe = (user.toLowerCase() === senderLower);
    const isJosh = (senderLower === "josh");
    const isSystem = (senderLower === "system");

    if (sentDate != lastSentDate) {
       const dIndicator = document.createElement('div');
       dIndicator.classList.add('dIndicator');
       dIndicator.innerHTML = `
       <p><b>${sentDate}</b></p>
       `;
       wrapper.appendChild(dIndicator);
    }
    const messageElement = document.createElement('div');
    messageElement.classList.add('messageBox');
    messageElement.setAttribute('msg-id', msg.id || Date.now());


    
    if (isMe) {
        messageElement.style.marginLeft = "auto";
    }


    let themeColor = isJosh ? "#00ffff" : "#ff00ff";
    const oppositeThemeColor = isJosh ? "#ea00ff":"#00ffff";
    
    let displayName = isJosh ? "Josh" : (senderLower === window.user2Name.toLowerCase() ? window.user2Name : "Anonymous");
    if(isSystem) {
        messageElement.style.marginLeft = "auto";
        messageElement.style.marginRight = "auto";
		messageElement.style.alignItems = "center";
        themeColor = "red"
        displayName = "System"
    }    
    messageElement.style.border = `2px solid ${themeColor}`;

    messageElement.innerHTML = `
        <h4 style="color: ${themeColor}">${displayName}</h4>
        ${msgRid !== null ? (`<h6 style="color: ${oppositeThemeColor}"><i>Reply: ${msgRid}</i></h6>`) : ""}
        <p class="messageText"></p>
        <h6 class="timestamp">${msg.timestamp || ""}</h6>
    `;
    messageElement.querySelector('.messageText').textContent = msg.text || "";
    wrapper.appendChild(messageElement);
    wrapper.scrollTop = wrapper.scrollHeight;
    lastSentDate = sentDate;
}

async function loadHistory() {
    const endpoint = chatType === "private" ? "loadechat" : "loadcdata1";
    try {
        const res = await fetch(`${CLOUD_URL}/${endpoint}`);
        const messages = await res.json();
        wrapper.innerHTML = ''; 
        messages.forEach(renderMessage);
        msgCount = messages.length;
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
if (isMobile == false) {
    wrapper.addEventListener('click', (event) => {
        clicked = clicked ? clicked : true;
        event.preventDefault();
        selectReply();
    });
}

let initialX = null;
let initialY = null;
let finalX = null;
let finalY = null;
wrapper.addEventListener("touchstart", function(e) {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
}, false)

wrapper.addEventListener("touchend", function(e) {
    finalX = e.changedTouches[0].clientX;
    finalY = e.changedTouches[0].clientY;
    if((finalX - initialX > 100 || initialX - finalX > 100) && (initialY - finalY < 50 && finalY - initialY < 100)) {
        selectReply();
    }
})
loadHistory();
document.addEventListener("DOMContentLoaded", () => {
setTimeout(() => {
    console.log("Total messages: " + msgCount);
    
}, 500);})
