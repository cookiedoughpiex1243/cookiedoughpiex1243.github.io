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
    if (message === '') return;
    const messageElement = `
    <div class="messageBox">
                <h4>Josh</h4>
                ${message}
                <h6>Sent at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h6>
            </div>
    `
    wrapper.insertAdjacentHTML('beforeend', messageElement);
    messageInput.value = '';
}

sendbtn.addEventListener('click', sendMessage);