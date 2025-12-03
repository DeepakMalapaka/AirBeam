const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.hostname}:3001`;

const socket = new WebSocket(wsUrl);

socket.addEventListener('open', () => {
    console.log('Connected to the signaling server');
});

socket.addEventListener('message', (e) => {
    const data = JSON.parse(e.data);
    console.log('Global Socket Message:', data);
    if (data.type === 'your-id') {
        socket.id = data.id;
    }
});

socket.addEventListener('error', (err) => {
    console.error('WebSocket error:', err);
});

export default socket;