import React, { useState, useContext, useEffect, useRef } from "react";
import ThemeContext from "../context/ThemeContext";
import socket from "../socket";
import RoleContext from "../context/RoleContext";
import Border from "./Border";

const Container = () => {
  const { isDark } = useContext(ThemeContext);
  const { role } = useContext(RoleContext);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [file, setFile] = useState(null);
  const [clientList, setClientList] = useState([]);
  const [myId, setMyId] = useState(null);
  const [targetID, setTargetID] = useState(null);

  const peerConnection = useRef(null);
  const dataChannel = useRef(null);

  // Connect UI only
  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 1500);
  };

  // Choose file
  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  // Start WebRTC offer
  const startWebRTC = async () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    dataChannel.current = peerConnection.current.createDataChannel("fileChannel");

    dataChannel.current.onopen = () => console.log("DataChannel opened ✔");
    dataChannel.current.onerror = (e) => console.log("DC Error:", e);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "signal",
            from: myId,
            target: targetID,
            candidate: event.candidate,
          })
        );
      }
    };

    // Create offer
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.send(
      JSON.stringify({
        type: "signal",
        from: myId,
        target: targetID,
        sdp: offer,
      })
    );
  };

  // Send file
  const sendFile = () => {
    if (!dataChannel.current || dataChannel.current.readyState !== "open") {
      alert("DataChannel is not ready!");
      return;
    }

    const chunkSize = 16000;
    const reader = new FileReader();

    reader.onload = (e) => {
      const buffer = new Uint8Array(e.target.result);

      for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.slice(i, i + chunkSize);
        dataChannel.current.send(chunk);
      }

      console.log("File sent successfully ✔");
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle socket messages
  useEffect(() => {
    socket.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      console.log("Sender Received:", data);

      if (data.type === "your-id") {
        setMyId(data.id);
      }

      if (data.type === "client-list") {
        setClientList(data.clients);
      }

      // Receiver sent answer
      if (data.sdp && data.sdp.type === "answer") {
        await peerConnection.current.setRemoteDescription(data.sdp);
      }

      // ICE candidate
      if (data.candidate) {
        if (peerConnection.current?.remoteDescription) {
          await peerConnection.current.addIceCandidate(data.candidate);
        }
      }
    };
  }, []);

  return (
    <div
      className={`w-1/2 min-h-[75vh] border rounded-xl border-dashed p-5
      ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
    >
      <h1 className="font-serif text-2xl my-4 text-center">Local Wi-Fi File Sharing</h1>

      {!isConnected && (
        <div className="flex justify-center">
          <button
            onClick={handleConnect}
            className="bg-blue-600 text-white p-2 rounded-xl font-serif"
          >
            Connect to Peer
          </button>
        </div>
      )}

      {isConnected && (
        <>
          <p className="text-green-400 text-center font-serif">Connected ✔</p>

          <div className="text-center mt-4">
            Select Receiver:
            <br />
            {clientList
              .filter((id) => id !== myId)
              .map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setTargetID(id);
                    startWebRTC();
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded mx-2"
                >
                  Connect to {id}
                </button>
              ))}

            {targetID && (
              <p className="text-green-400 mt-2 font-serif">
                Connected to Receiver: {targetID}
              </p>
            )}
          </div>
        </>
      )}

      <Border />

      <div className="flex justify-between px-20 mt-4">
        <label
          className={`border rounded-xl p-2 font-serif ${
            !isConnected || role !== "sender"
              ? "opacity-30 cursor-not-allowed"
              : "cursor-pointer"
          }`}
        >
          Choose File
          <input type="file" className="hidden" onChange={handleFileSelect} />
        </label>

        <button
          disabled={!file || !targetID}
          onClick={sendFile}
          className="bg-blue-600 text-white p-2 px-6 rounded-xl font-serif disabled:opacity-30"
        >
          Send
        </button>
      </div>

      {file && (
        <div className="text-center mt-3 font-serif">
          <p><strong>File:</strong> {file.name}</p>
          <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      <Border />
    </div>
  );
};

export default Container;
