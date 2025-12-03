import React from "react";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import socket from "./socket";
import ThemeContext from "./context/ThemeContext";
import Border from "./components/Border";
import Container from "./components/Container";
import RoleContext from "./context/RoleContext";
import Role from "./components/Role";
import Receiver from "./components/Receiver";
const App = () => {
  const [isDark, setIsDark] = useState(true);
  const [role, setRole] = useState(null);
  const [myId, setMyId] = useState(socket.id || null);

  useEffect(() => {
    const handleMessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'your-id') {
        setMyId(data.id);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, []);
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <ThemeContext.Provider value={{ isDark, setIsDark }}>
        <div
          className={`min-h-screen transition-colors duration-500 
        ${
          isDark ? "bg-slate-900 text-slate-100" : "bg-[#F7F9FC] text-[#1A1C1E]"
        }
      `}
        >
          <Border />
          <Header myId={myId} />
          <Border />
          {role === null && <Role />}
          {role === "sender" && (
            <div
              className={`flex items-center justify-center text-center pt-16`}
            >
              <Container />
            </div>
          )}
          {role==="receiver" && (
            <div
              className={`flex items-center justify-center text-center pt-16`}
            >
              <Receiver/>
            </div>
          )}
        </div>
      </ThemeContext.Provider>
    </RoleContext.Provider>
  );
};

export default App;
