const socket = new WebSocket("ws://192.168.0.178:3001");

socket.onopen=()=>{
    console.log('Connected to the signaling');
};
socket.onmessage=(e)=>{
    const data=JSON.parse(e.data);
    console.log('Message from server',data);
    
}
socket.onerror=(err)=>{
    console.log('Web socket error',err);
};

export default socket;