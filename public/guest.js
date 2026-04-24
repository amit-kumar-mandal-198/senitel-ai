const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('msg-input');
const roomEl = document.getElementById('guest-room');

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = text;
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
}

function handleEnter(e) {
    if(e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const text = inputEl.value.trim();
    if(!text) return;
    
    appendMessage(text, 'user');
    inputEl.value = '';
    
    // Show typing...
    const typingId = Date.now();
    const div = document.createElement('div');
    div.className = `message bot`;
    div.id = typingId;
    div.innerText = '...';
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                guestLocation: roomEl.value
            })
        });
        const data = await res.json();
        
        document.getElementById(typingId).remove();
        appendMessage(data.response || data.error, 'bot');

        // Optional: Text to speech
        if(window.speechSynthesis && data.response) {
            const utterance = new SpeechSynthesisUtterance(data.response);
            window.speechSynthesis.speak(utterance);
        }

    } catch(err) {
        document.getElementById(typingId).remove();
        appendMessage('Connection error.', 'bot');
    }
}
