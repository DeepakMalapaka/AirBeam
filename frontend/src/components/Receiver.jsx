import React, { useContext, useEffect, useState, useRef } from "react";
import ThemeContext from "../context/ThemeContext";
import socket from "../socket";

const Receiver = () => {
  const { isDark } = useContext(ThemeContext);

  const [receiveProgress, setReceiveProgress] = useState(0);
  const [fileReceived, setFileReceived] = useState(null);
  const [myId, setMyId] = useState(socket.id || null);
  const [fileMeta, setFileMeta] = useState(null);
  const fileBuffer = useRef([]);
  const candidateQueue = useRef([]);

  const peerConnection = useRef(null);

  useEffect(() => {
    const handleMessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("Receiver Got:", data);

      if (data.type === "your-id") {
        setMyId(data.id);
      }

      if (data.type === "file-meta") {
        setFileMeta(data.metadata);
        fileBuffer.current = []; // Reset buffer
        setReceiveProgress(0);
        setFileReceived(null);
      }

      // Incoming OFFER
      if (data.sdp && data.sdp.type === "offer") {
        await handleOffer(data);
      }

      // ICE candidate
      if (data.candidate) {
        if (peerConnection.current?.remoteDescription) {
          try {
            await peerConnection.current.addIceCandidate(data.candidate);
          } catch (err) {
            console.error("ICE error:", err);
          }
        } else {
          candidateQueue.current.push(data.candidate);
        }
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleOffer = async (data) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
      ],
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "signal",
            from: myId || socket.id,
            target: data.from,
            candidate: event.candidate,
          })
        );
      }
    };

    // DataChannel coming from sender
    peerConnection.current.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      console.log("DataChannel received ✔");

      receiveChannel.onmessage = (e) => handleChunk(e.data);
    };

    await peerConnection.current.setRemoteDescription(data.sdp);

    // Process queued candidates
    while (candidateQueue.current.length > 0) {
      const candidate = candidateQueue.current.shift();
      try {
        await peerConnection.current.addIceCandidate(candidate);
      } catch (err) {
        console.error("Queue ICE error:", err);
      }
    }

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.send(
      JSON.stringify({
        type: "signal",
        from: myId || socket.id,
        target: data.from,
        sdp: answer,
      })
    );
  };

  const handleChunk = (chunk) => {
    fileBuffer.current.push(chunk);

    const totalReceived = fileBuffer.current.length * 16000; // Approx
    // Better: track actual bytes if possible, but chunks are fixed size usually except last
    // Since we don't track exact bytes per chunk here easily without overhead, 
    // we can estimate or just use buffer length * chunk size.
    // Actually, ArrayBuffer byteLength is accurate.
    
    const currentSize = fileBuffer.current.reduce((acc, val) => acc + val.byteLength, 0);
    const totalSize = fileMeta ? fileMeta.size : 1; // Avoid divide by zero

    const percent = Math.min(100, (currentSize / totalSize) * 100);
    setReceiveProgress(percent);

    if (currentSize >= totalSize) {
      const blob = new Blob(fileBuffer.current);
      blob.name = fileMeta ? fileMeta.name : "received-file";
      setFileReceived(blob);
    }
  };

  return (
    <div
      className={`
        w-1/2 min-h-[30vh] border rounded-xl border-dashed p-5 mx-auto 
        ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}
      `}
    >
      <h1 className="font-serif text-2xl text-center mb-3">Waiting to Receive File</h1>

      {!fileReceived ? (
        <>
          <p className="text-center font-serif mb-4">Receiving… {receiveProgress}%</p>

          <div className="w-2/3 mx-auto h-3 rounded bg-gray-300 overflow-hidden">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${receiveProgress}%` }}
            ></div>
          </div>
        </>
      ) : (
        <div className="text-center mt-6">
          <p className="text-green-400 font-serif text-lg">File Received ✔</p>

          <a
            href={URL.createObjectURL(fileReceived)}
            download={fileMeta ? fileMeta.name : "received-file"}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-serif mt-4 inline-block"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
};

export default Receiver;
