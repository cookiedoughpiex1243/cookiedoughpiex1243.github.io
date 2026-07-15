const CLOUD_URL = "https://josh-backend-om8q.onrender.com";
const socket = io(CLOUD_URL);

let clicked = false;
let lastSentDate;
let lastSentHour;
let lastSentMinute;
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
let hasFocus = document.hasFocus();

const site = sessionStorage.getItem("site") || "unknown";
const user = sessionStorage.getItem("user") || "anonymous";


const chatType = (site === "echat" || site === "jchat") ? "private" : "public";

// --- Last-read tracking for scroll-to-unread ---
let myLastReadID = null;
let lastReadResolve;
const lastReadPromise = (chatType === 'private')
    ? new Promise(resolve => { 
        lastReadResolve = resolve;
        setTimeout(() => {
            if (lastReadResolve) {
                console.warn("lastReadPromise timed out.");
                lastReadResolve();
                lastReadResolve = null;
            }
        }, 3000);
      })
    : Promise.resolve(); // public chat doesn't use unread scroll

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
		lastReplied.style.scale = "1";
		replyIndicator.style.display = "none";
	}	
}

function selectReply() {
    messageInput.focus();
	cancelReply();
    const selected = event.target.closest(".messageBox");
    lastReplied = selected;
	if (!selected) return;
    Rid = selected.getAttribute("msg-id");
	if (Rid === null) cancelReply;
    selected.style.border = "2px solid red";
    replyIndicator.style.display = "flex";
}

document.body.style.display = "flex";
console.log("Touchscreen: "+isMobile);

//Join socket room on connecting, then immediately announce our own focus state
socket.emit('join_room', { room: chatType, user: user });
if (chatType === 'private') {
    socket.emit("focused", {room: chatType, user: user, lastID: null});
}

// Receive our own last-read cursor from the server
socket.on("myLastRead", (id) => {
    myLastReadID = id;
    if (lastReadResolve) { lastReadResolve(); lastReadResolve = null; }
});
const notif = new Audio('resources/notification.mp3');
const defaultTitle = document.title;
let newMsgs = 0;

socket.on('receive_message', (msg) => {
    renderMessage(msg);
    if(!hasFocus) {
	    if(site != "echat")
        notif.play().catch(e => console.warn("Audio play blocked:", e));
        document.title = `(${++newMsgs}) ${defaultTitle}`;
    }
});

socket.on("eFocused", () => {
    if(site == "jchat")messageInput.placeholder = "ykw is Online.";});
socket.on("jFocused", () => {
if(site=="echat")messageInput.placeholder = "Josh is Online"});
socket.on("eGone", () => {
	if(site=="jchat")messageInput.placeholder = "Type to send a message...";});
socket.on("jGone", () => {
	if(site=="echat")messageInput.placeholder = "Type to send a message...";});



socket.on("message_deleted", (id) => {
    const msgElement = wrapper.querySelector(`.messageBox[msg-id='${id}']`);
    if (msgElement) {
        wrapper.removeChild(msgElement);
		console.log("A message was deleted");
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
        socket.emit('stop_typing', { room: chatType, user: user }); isTyping = false;
            
            sessionStorage.removeItem('loggedIn');
            sessionStorage.setItem('site', 'login');
            window.location.replace("login");
            messageInput.value = ''; 
            return;
            break;
            case '/back':
                socket.emit('stop_typing', { room: chatType, user: user }); isTyping = false;
                user == 'josh' ? window.location.href='loggedin': history.back();
                return;
                break;
        case '/help':
const msg = `Hello :D, here's some information:\n
/logout to logout (or just redirect to login page)\n
/help for this message :D`
            sendSystemMessage(msg)
            messageInput.value = '';
            break;
        case '/clearall':
		if(user === "josh"){
        socket.emit("clear_chat", chatType);
        console.log("chat cleared");
        }
		else {
			sendSystemMessage("Lol no. Only josh gets to do that :)");
			console.log(`${user} tried clearing chat...tsk tsk`);
			}
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

let isHistoryLoading = false;

function buildMessageDOM(msg, prevDate, prevHour, prevMinute) {
    const msgRid = msg.Rid ? (document.querySelector(`[msg-id="${msg.Rid}"]`)?.querySelector('.messageText')?.textContent || null) : null;
    const sentDate = new Date(msg.id).toString().split(" ").slice(0, 4).join(" ");
    const sender = msg.sender || "anonymous";
    const senderLower = sender.toLowerCase();
    const isMe = (user.toLowerCase() === senderLower);
    const isJosh = (senderLower === "josh");
    const isSystem = (senderLower === "system");

    let dIndicator = null;
    if (sentDate != prevDate) {
       dIndicator = document.createElement('div');
       dIndicator.classList.add('dIndicator');
       dIndicator.innerHTML = `<p><b>${sentDate}</b></p>`;
    }
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('messageBox');
    messageElement.setAttribute('msg-id', msg.id || Date.now());

    if (isMe) {
        messageElement.style.marginLeft = "auto";
    }

    let themeColor = isJosh ? "#00ffff" : "#ff00ff";
    const replyColor = msg.Rid ? (document.querySelector(`[msg-id="${msg.Rid}"]`)?.querySelector('h4')?.style.color || null) : null;

    let displayName = isJosh ? "Josh" : (senderLower === window.user2Name.toLowerCase() ? window.user2Name : "Anonymous");
    if(isSystem) {
        messageElement.style.marginLeft = "auto";
        messageElement.style.marginRight = "auto";
        messageElement.style.alignItems = "center";
        themeColor = "red";
        displayName = "System";
    }    
    messageElement.style.border = `2px solid ${themeColor}`;
    const sentHour = parseInt(msg.timestamp.split(":")[0]);
    const sentMinute = parseInt(msg.timestamp.split(":")[1]);
    const isImage = typeof msg.text === 'string' && msg.text.startsWith('data:image/');
    if (sentHour !== prevHour || sentMinute - prevMinute > 5) {
        messageElement.style.marginTop = "5em";
    }

    messageElement.innerHTML = `
        <h4 style="color: ${themeColor}">${displayName}</h4>
        ${msgRid !== null ? (`<h6 style="color: ${replyColor}"><i>Reply: ${msgRid}</i></h6>`) : ""}
        ${isImage
            ? `<img class="messageText" loading="lazy" src="${msg.text}" style="width: 100% !important; height: auto !important; max-width: 260px !important; max-height: 340px !important; border-radius: 8px !important; margin-top: 4px !important; display: block !important; object-fit: contain !important; cursor: zoom-in !important; transition: transform 0.2s ease !important; box-shadow: none !important;">`
            : `<p class="messageText"></p>`
        }
        <h6 class="timestamp">${msg.timestamp || ""}</h6>
    `;
    if (!isImage) {
        messageElement.querySelector('.messageText').textContent = msg.text || "";
    } else {
        const img = messageElement.querySelector('.messageText');
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            openLightbox(msg.text);
        });
    }
    
    return { dIndicator, messageElement, sentDate, sentHour, sentMinute };
}

function renderMessage(msg) {
    if (!wrapper || !msg) return;
    const distanceToBottom = wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight;
    const shouldAutoscroll = distanceToBottom < 400;

    const { dIndicator, messageElement, sentDate, sentHour, sentMinute } = buildMessageDOM(msg, lastSentDate, lastSentHour, lastSentMinute);
    
    if (dIndicator) wrapper.appendChild(dIndicator);
    wrapper.appendChild(messageElement);

    if (!isHistoryLoading && shouldAutoscroll) {
        wrapper.scrollTop = wrapper.scrollHeight;
    }
    lastSentDate = sentDate;
    lastSentHour = sentHour;
    lastSentMinute = sentMinute;
}

let oldestMessageID = null;
let hasMoreMessages = true;
let isFetchingMore = false;
let scrollSentinel = null;

async function fetchMoreMessages() {
    if (!oldestMessageID || !hasMoreMessages || isFetchingMore) return;
    isFetchingMore = true;
    
    const endpoint = chatType === "private" ? "loadechat" : "loadcdata1";
    try {
        const res = await fetch(`${CLOUD_URL}/${endpoint}?before=${oldestMessageID}`);
        const messages = await res.json();
        
        if (messages.length === 0) {
            hasMoreMessages = false;
            return;
        }
        
        oldestMessageID = messages[0].id;
        const prevScrollHeight = wrapper.scrollHeight;
        
        if (scrollSentinel && scrollSentinel.parentNode) {
            scrollSentinel.parentNode.removeChild(scrollSentinel);
        }
        
        const fragment = document.createDocumentFragment();
        let localLastDate = null;
        let localLastHour = null;
        let localLastMinute = null;
        
        messages.forEach(msg => {
            const elData = buildMessageDOM(msg, localLastDate, localLastHour, localLastMinute);
            if (elData.dIndicator) fragment.appendChild(elData.dIndicator);
            fragment.appendChild(elData.messageElement);
            localLastDate = elData.sentDate;
            localLastHour = elData.sentHour;
            localLastMinute = elData.sentMinute;
        });
        
        wrapper.prepend(fragment);
        if (hasMoreMessages) wrapper.prepend(scrollSentinel);
        
        wrapper.scrollTop = wrapper.scrollTop + (wrapper.scrollHeight - prevScrollHeight);
    } catch (e) {
        console.error("fetch more error", e);
    } finally {
        isFetchingMore = false;
    }
}

function initIntersectionObserver() {
    if (scrollSentinel) return;
    scrollSentinel = document.createElement('div');
    scrollSentinel.style.height = '1px';
    scrollSentinel.id = 'scroll-sentinel';
    
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isHistoryLoading) {
            fetchMoreMessages();
        }
    }, { root: wrapper, rootMargin: "200px" });
    
    observer.observe(scrollSentinel);
}

async function loadHistory() {
    const endpoint = chatType === "private" ? "loadechat" : "loadcdata1";
    isHistoryLoading = true;
    try {
        const [res] = await Promise.all([
            fetch(`${CLOUD_URL}/${endpoint}`),
            lastReadPromise,
        ]);
        const messages = await res.json();
        wrapper.innerHTML = ''; 
        
        if (messages.length > 0) {
            oldestMessageID = messages[0].id;
        }
        if (messages.length < 50) {
            hasMoreMessages = false;
        }
        
        messages.forEach(renderMessage);
        
        if (hasMoreMessages) {
            initIntersectionObserver();
            wrapper.prepend(scrollSentinel);
        }
        
        // --- Scroll to first unread, or bottom if all read ---
        let scrollTarget = null;
        if (myLastReadID && chatType === "private") {
            const allBoxes = wrapper.querySelectorAll('.messageBox');
            let foundLastRead = false;
            for (const box of allBoxes) {
                const msgId = Number(box.getAttribute('msg-id'));
                if (msgId === Number(myLastReadID)) {
                    foundLastRead = true;
                    continue;
                }
                if (foundLastRead) {
                    scrollTarget = box;
                    break;
                }
            }
        }

        if (scrollTarget) {
            scrollTarget.scrollIntoView({ behavior: 'instant', block: 'start' });
        } else {
            wrapper.scrollTop = wrapper.scrollHeight;
        }

        requestAnimationFrame(() => {
            if (scrollTarget) {
                scrollTarget.scrollIntoView({ behavior: 'instant', block: 'start' });
            } else {
                wrapper.scrollTop = wrapper.scrollHeight;
            }
        });
    } catch (err) {
        console.error("Failed to load history:", err);
    } finally {
        isHistoryLoading = false;
    }
}



document.addEventListener('visibilitychange', () => {
    if(document.hidden){
    hasFocus = false
    console.log("unfocused");
    socket.emit("unfocused", {room:chatType, user: user})}
    else{
    console.log("focused")
    // Get the last rendered message ID to update the server's read cursor
    const allBoxes = wrapper.querySelectorAll('.messageBox');
    const lastBox = allBoxes[allBoxes.length - 1];
    const lastID = lastBox ? Number(lastBox.getAttribute('msg-id')) : null;
    socket.emit("focused", {room:chatType, user: user, lastID: lastID})
    document.title = defaultTitle;
    newMsgs = 0;
    hasFocus = true;}
});

wrapper.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const selected = event.target.closest(".messageBox");
    if (!selected) return;
	if (selected.querySelector("h4").textContent.toLowerCase() === user) {
	const confirmed = window.confirm(`Are you sure you want to delete message: "${selected.querySelector(".messageText").textContent}"`);
	if (confirmed === true) {
    const ID = selected.getAttribute("msg-id");
    	socket.emit("delete_message", {room: chatType, id: ID});
	}
    }
});
if (isMobile == false) {
    wrapper.addEventListener('click', (event) => {
        clicked = clicked ? clicked : true;
        event.preventDefault();
        selectReply();
    });
}
//swipey logic
let swipedBox;
let initialX = null;
let initialY = null;
let finalX = null;
let finalY = null;
wrapper.addEventListener("touchstart", function(e) {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
	swipedBox = e.target.closest(".messageBox");
	swipedBox.style.scale = "1.05";
}, false)

wrapper.addEventListener("touchend", function(e) {
    finalX = e.changedTouches[0].clientX;
    finalY = e.changedTouches[0].clientY;
    if((finalX - initialX > 100 || initialX - finalX > 100) && (initialY - finalY < 50 && finalY - initialY < 100)) {
        selectReply();
    }
	swipedBox.style.scale = "1";
})

// --- Image paste support ---
messageInput.addEventListener('paste', (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) return;
            if (file.size > 1024 * 1024) {
                alert('Image too large — keep it under 1 MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                socket.emit('send_message', {
                    room: chatType,
                    text: reader.result,   // base64 data URL
                    sender: user,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    id: Date.now(),
                    Rid: Rid ?? null,
                });
                cancelReply();
                replyIndicator.style.display = 'none';
            };
            reader.readAsDataURL(file);
            break;
        }
    }
});

// --- Image Lightbox Support ---
const lightbox = document.createElement('div');
lightbox.id = 'imgLightbox';
lightbox.style.cssText = `
    display: none;
    position: fixed;
    z-index: 10000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(11, 12, 16, 0.95);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.25s ease;
    cursor: zoom-out;
`;

const lightboxImg = document.createElement('img');
lightboxImg.style.cssText = `
    width: auto !important;
    height: auto !important;
    /max-width: 95% !important;
    max-height: 95% !important;
    object-fit: contain !important;
    border-radius: 8px !important;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.3) !important;
    transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    transform: scale(0.9);
`;

lightbox.appendChild(lightboxImg);
document.body.appendChild(lightbox);

lightbox.addEventListener('click', () => {
    lightbox.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.9)';
    setTimeout(() => {
        lightbox.style.display = 'none';
    }, 250);
});

function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.style.display = 'flex';
    // Force reflow
    lightbox.offsetHeight;
    lightbox.style.opacity = '1';
    lightboxImg.style.transform = 'scale(1)';
}

loadHistory();
