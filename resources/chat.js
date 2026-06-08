const CLOUD_URL = "https://josh-backend-om8q.onrender.com";
const socket = io(CLOUD_URL);

let jlast;
let elast;
let clicked = false;
let lastSentDate;
let lastSentHour;
let lastSentMinute;
let lastReplied = null;
let lastRepliedID = null;
let msgCount = null;
let historyLoaded = false;
let lastMessageReceived = false;
let initialScrollDone = false;
const isMobile = isTouchDevice;
const messageInput = document.getElementById('userMsg2');
const wrapper = document.querySelector('.cwrapper');
const sendbtn = document.getElementById('sendbtn');
const typeIndicator = document.getElementById("typing-indicator");
const replyIndicator = document.getElementById("replying-indicator");
let Rid = null;
let hasFocus = true;

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
    if (lastReplied != null) {
        const lastReplySenderColor = lastReplied.querySelector("h4")?.style.color || "#00ffff";
        lastReplied.style.border = `2px solid ${lastReplySenderColor}`;
        lastReplied.style.scale = "1";
    }
    Rid = null;
    lastReplied = null;
    if (replyIndicator) {
        replyIndicator.style.display = "none";
    }
}

function selectReply(element) {
    if (!element) return;
    messageInput.focus();
    cancelReply();
    lastReplied = element;
    Rid = element.getAttribute("msg-id");
    if (Rid === null) {
        cancelReply();
        return;
    }
    element.style.border = "2px solid red";
    if (replyIndicator) {
        replyIndicator.style.display = "flex";
    }
}

function getLastMessageID() {
    const messageBoxes = wrapper.querySelectorAll('.messageBox');
    if (messageBoxes.length > 0) {
        return messageBoxes[messageBoxes.length - 1].getAttribute('msg-id');
    }
    return null;
}

function scrollToUnread() {
    if (initialScrollDone) return;
    const lastReadID = user === "josh" ? jlast : elast;
    let scrollTarget = null;
    if (lastReadID) {
        const lastReadEl = wrapper.querySelector(`[msg-id="${lastReadID}"]`);
        if (lastReadEl) {
            scrollTarget = lastReadEl.nextElementSibling;
        }
    }
    if (scrollTarget) {
        const divider = document.createElement('div');
        divider.classList.add('dIndicator');
        divider.innerHTML = `<p style="color: #ff4444; font-weight: bold; margin: 15px 0;">── New Messages ──</p>`;
        wrapper.insertBefore(divider, scrollTarget);

        divider.scrollIntoView({ block: "start" });
        initialScrollDone = true;

        const initialScrollTop = wrapper.scrollTop;
        let hasEnteredViewport = false;

        const removeDivider = () => {
            if (wrapper.contains(divider)) {
                divider.remove();
            }
            wrapper.removeEventListener('scroll', onScroll);
            observer.disconnect();
        };

        const onScroll = () => {
            if (wrapper.scrollTop > initialScrollTop + 50) {
                removeDivider();
            }
        };
        wrapper.addEventListener('scroll', onScroll);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    hasEnteredViewport = true;
                } else if (hasEnteredViewport) {
                    removeDivider();
                }
            });
        }, {
            root: wrapper,
            threshold: 0.1
        });
        observer.observe(divider);
    } else {
        wrapper.scrollTop = wrapper.scrollHeight;
        initialScrollDone = true;
    }
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
//Da thing to make sure sound not autoblocked(USELESS :(  )
document.addEventListener('click', () => {
    notif.play().then(() => {
        notif.pause();
        notif.currentTime = 0;
    }).catch(e => console.log("Audio not ready yet"));
}, { once: true });
socket.on("lastMessage", (data) => {
	jlast = data.jlast;
	elast = data.elast;
	lastMessageReceived = true;
	if (historyLoaded && !initialScrollDone) {
		scrollToUnread();
	}
});
socket.on('receive_message', (msg) => {
    renderMessage(msg);
    if(!hasFocus) {
        notif.play().catch(e => console.warn("Audio play blocked:", e));
        document.title = `(${++newMsgs}) ${defaultTitle}`;
    } else {
		const lastID = getLastMessageID();
		socket.emit("focused", {room: chatType, user: user, lastID: lastID});
	}
});

socket.on("message_deleted", (id) => {
    const msgElement = wrapper.querySelector(`.messageBox[msg-id='${id}']`);
    if (msgElement) {
        wrapper.removeChild(msgElement);
		console.log("A message was deleted");
    }
});

socket.on("message_edited", (data) => {
    const { id, newText } = data;
    const msgElement = wrapper.querySelector(`.messageBox[msg-id='${id}']`);
    if (msgElement) {
        const textEl = msgElement.querySelector('.messageText');
        if (textEl) {
            textEl.textContent = newText;
        }
        const timestampEl = msgElement.querySelector('.timestamp');
        if (timestampEl && !timestampEl.querySelector('.edited-tag')) {
            const editedTag = document.createElement('i');
            editedTag.className = 'edited-tag';
            editedTag.style.cssText = 'font-style: italic; font-size: 0.8em; margin-left: 5px;';
            editedTag.textContent = '(edited)';
            timestampEl.appendChild(editedTag);
        }
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
        if (Rid != null) replyIndicator.style.display = "none";
        cancelReply();
    } catch (err) {
        console.error("Error sending message:", err);
    }
    break;
    }
}


sendbtn.addEventListener('click', sendMessage);

let isHistoryLoading = false;

function renderMessage(msg) {
    if (!wrapper || !msg) return;
    const msgRid = msg.Rid ? (document.querySelector(`[msg-id="${msg.Rid}"]`)?.querySelector('.messageText')?.textContent || null) : null;
	const sentDate = new Date(msg.id).toString().split(" ").slice(0, 4).join(" ");
    const sender = msg.sender || "anonymous";
    const senderLower = sender.toLowerCase();
    const distanceToBottom = wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight;
    const shouldAutoscroll = distanceToBottom < 400;
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
    const replyColor = msg.Rid ? (document.querySelector(`[msg-id="${msg.Rid}"]`)?.querySelector('h4')?.style.color || null) : null;

    let displayName = isJosh ? "Josh" : ((window.user2Name && senderLower === window.user2Name.toLowerCase()) ? window.user2Name : "Anonymous");
    if(isSystem) {
        messageElement.style.marginLeft = "auto";
        messageElement.style.marginRight = "auto";
		messageElement.style.alignItems = "center";
        themeColor = "red";
        displayName = "System";
    }    
    messageElement.style.border = `2px solid ${themeColor}`;
	const timeParts = msg.timestamp ? msg.timestamp.split(":") : [];
	const sentHour = timeParts[0] ? parseInt(timeParts[0]) : 0;
	const sentMinute = timeParts[1] ? parseInt(timeParts[1]) : 0;
    const isImage = typeof msg.text === 'string' && msg.text.startsWith('data:image/');
	if (sentHour !== lastSentHour || sentMinute - lastSentMinute > 5) {
		messageElement.style.marginTop = "5em";
		}

    messageElement.innerHTML = `
        <h4 style="color: ${themeColor}">${displayName}</h4>
        ${msgRid !== null ? (`<h6 style="color: ${replyColor}"><i>Reply: ${msgRid}</i></h6>`) : ""}
        ${isImage
            ? `<img class="messageText" src="${msg.text}" style="width: 100% !important; height: auto !important; max-width: 260px !important; max-height: 340px !important; border-radius: 8px !important; margin-top: 4px !important; display: block !important; object-fit: contain !important; cursor: zoom-in !important; transition: transform 0.2s ease !important; box-shadow: none !important;">`
            : `<p class="messageText"></p>`
        }
        <h6 class="timestamp">${msg.timestamp || ""}${msg.edited ? ` <i class="edited-tag" style="font-style: italic; font-size: 0.8em; margin-left: 5px;">(edited)</i>` : ""}</h6>
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
        img.addEventListener('load', () => {
            const currentDistance = wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight;
            if (currentDistance < 400) {
                wrapper.scrollTop = wrapper.scrollHeight;
            }
        });
    }
    wrapper.appendChild(messageElement);
    if (!isHistoryLoading && shouldAutoscroll) {
        wrapper.scrollTop = wrapper.scrollHeight;
	}
	lastSentDate = sentDate;
	lastSentHour = sentHour;
	lastSentMinute = sentMinute;
}

async function loadHistory() {
    const endpoint = chatType === "private" ? "loadechat" : "loadcdata1";
    isHistoryLoading = true;
    try {
        const res = await fetch(`${CLOUD_URL}/${endpoint}`);
        const messages = await res.json();
        wrapper.innerHTML = '';
        messages.forEach(renderMessage);
        msgCount = messages.length;
        historyLoaded = true;

        if (chatType === 'private') {
            if (lastMessageReceived) {
                scrollToUnread();
            }
        } else {
            wrapper.scrollTop = wrapper.scrollHeight;
            initialScrollDone = true;
        }
    } catch (err) {
        console.error("Failed to load history:", err);
    } finally {
        isHistoryLoading = false;
    }
}



document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        hasFocus = false;
        console.log("unfocused");
        socket.emit("unfocused", {room: chatType, user: user});
    } else {
        console.log("focused");
        const lastID = getLastMessageID();
        socket.emit("focused", {room: chatType, user: user, lastID: lastID});
        document.title = defaultTitle;
        newMsgs = 0;
        hasFocus = true;
    }
});

wrapper.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const selected = event.target.closest(".messageBox");
    if (!selected) return;
    const senderHeader = selected.querySelector("h4");
    if (!senderHeader) return;
    if (senderHeader.textContent.toLowerCase() === user.toLowerCase()) {
        const textEl = selected.querySelector(".messageText");
        const isImage = textEl && textEl.tagName === 'IMG';
        const currentText = isImage ? "" : (textEl?.textContent || "");
        const ID = selected.getAttribute("msg-id");

        if (isImage) {
            const confirmed = window.confirm("Are you sure you want to delete this image?");
            if (confirmed) {
                socket.emit("delete_message", { room: chatType, id: ID });
            }
        } else {
            const editOrDelete = window.confirm("Do you want to EDIT this message? (Click Cancel to DELETE)");
            if (editOrDelete) {
                const newText = window.prompt("Edit message:", currentText);
                if (newText !== null) {
                    const trimmed = newText.trim();
                    if (trimmed !== "" && trimmed !== currentText) {
                        socket.emit("edit_message", { room: chatType, id: ID, newText: trimmed });
                    }
                }
            } else {
                const confirmed = window.confirm(`Are you sure you want to delete message: "${currentText}"?`);
                if (confirmed) {
                    socket.emit("delete_message", { room: chatType, id: ID });
                }
            }
        }
    }
});
if (isMobile == false) {
    wrapper.addEventListener('click', (event) => {
        clicked = clicked ? clicked : true;
        const selected = event.target.closest(".messageBox");
        if (selected) {
            event.preventDefault();
            selectReply(selected);
        } else {
            cancelReply();
        }
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
	if (swipedBox) {
		swipedBox.style.scale = "1.05";
	}
}, false)

wrapper.addEventListener("touchend", function(e) {
    finalX = e.changedTouches[0].clientX;
    finalY = e.changedTouches[0].clientY;
    if (swipedBox && (finalX - initialX > 100 || initialX - finalX > 100) && (initialY - finalY < 50 && finalY - initialY < 100)) {
        selectReply(swipedBox);
    }
	if (swipedBox) {
		swipedBox.style.scale = "1";
	}
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
    max-width: 95% !important;
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
// Send focused with last message ID after history has had time to load
setTimeout(() => {
    console.log("Total messages: " + msgCount);
    const lastID = getLastMessageID();
    socket.emit("focused", {room: chatType, user: user, lastID: lastID});
}, 2000);
