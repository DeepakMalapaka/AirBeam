import React, { useContext, useEffect, useState, useRef } from "react";
import ThemeContext from "../context/ThemeContext";
import socket from "../socket";

const Receiver = () => {
  const { isDark } = useContext(ThemeContext);

  const [receiveProgress, setReceiveProgress] = useState(0);
  const [fileReceived, setFileReceived] = useState(null);
  const [myId, setMyId] = useState(null);
  const fileBuffer = useRef([]);

  const peerConnection = useRef(null);

  useEffect(() => {
    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("Receiver Got:", data);

      if (data.type === "your-id") {
        setMyId(data.id);
      }

      // Incoming OFFER
      if (data.sdp && data.sdp.type === "offer") {
        await handleOffer(data);
      }

      // ICE candidate
      if (data.candidate && peerConnection.current?.remoteDescription) {
        try {
          await peerConnection.current.addIceCandidate(data.candidate);
        } catch (err) {
          console.error("ICE error:", err);
        }
      }
    };
  }, []);

  const handleOffer = async (data) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "signal",
            from: myId,
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

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.send(
      JSON.stringify({
        type: "signal",
        from: myId,
        target: data.from,
        sdp: answer,
      })
    );
  };

  const handleChunk = (chunk) => {
    fileBuffer.current.push(chunk);

    const percent = Math.min(100, (fileBuffer.current.length / 50) * 100);
    setReceiveProgress(percent);

    if (percent >= 100) {
      const blob = new Blob(fileBuffer.current);
      blob.name = "received-file";
      setFileReceived(blob);
    }
  };

  return (
    <div
      className={`
        w-1/2 min-h-[75vh] border rounded-xl border-dashed p-5 mx-auto 
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
            download={fileReceived.name}
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
