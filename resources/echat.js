const messageInput = document.getElementById('userMsg2');
const wrapper = document.querySelector('.cwrapper');
const sendbtn = document.getElementById('sendbtn');
messageInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();}
});

function sendMessage() {
    const message = messageInput.value;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    if (message === '') return;
    const messageElement = document.createElement('div');
    messageElement.classList.add('messageBox');
    messageElement.innerHTML = `
        <h4>You</h4>
        <p class="messageText"></p>
        <h6 class="timestamp">${time}</h6>
    `;
    messageElement.querySelector('.messageText').textContent = message;
    wrapper.appendChild(messageElement);
    messageInput.value = '';
    wrapper.scrollTop = wrapper.scrollHeight;
}

sendbtn.addEventListener('click', sendMessage);