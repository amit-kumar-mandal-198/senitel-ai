const rooms = ['301', '302', '303', '304', '305', '306', '307', '308', '309', '310'];
const mapEl = document.getElementById('map');
const statusText = document.getElementById('status-text');

// Initialize map
function renderMap() {
    mapEl.innerHTML = '';
    rooms.forEach(room => {
        const div = document.createElement('div');
        div.className = 'room safe';
        div.id = `room-${room}`;
        div.innerHTML = `Rm ${room}`;
        mapEl.appendChild(div);
    });
}

async function triggerCrisis(type, location) {
    await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, location })
    });
    pollStatus();
}

async function resetCrisis() {
    await fetch('/api/reset', { method: 'POST' });
    pollStatus();
}

async function pollStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        // Reset visually
        document.querySelectorAll('.room').forEach(el => el.className = 'room safe');
        
        if (data.crisis.isActive) {
            statusText.innerHTML = `Status: 🔴 EMERGENCY (${data.crisis.type.toUpperCase()})`;
            statusText.style.color = '#ef4444';
            
            const crisisRoom = document.getElementById(`room-${data.crisis.location}`);
            if (crisisRoom) crisisRoom.className = 'room danger';

            // Highlight guests requesting help
            data.guestsInDanger.forEach(guestLoc => {
                const gRoom = document.getElementById(`room-${guestLoc}`);
                if (gRoom) gRoom.className = 'room warning';
            });
        } else {
            statusText.innerHTML = `Status: 🟢 ALL CLEAR`;
            statusText.style.color = '#10b981';
        }
    } catch(err) {
        console.error(err);
    }
}

renderMap();
setInterval(pollStatus, 2000); // Poll every 2 seconds
pollStatus();
