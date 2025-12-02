import React from "react";
import { useState } from "react";
import Header from "./components/header";
import ThemeContext from "./context/ThemeContext";
import Border from "./components/Border";
import Container from "./components/Container";
import RoleContext from "./context/RoleContext";
import Role from "./components/Role";
import Receiver from "./components/Receiver";
const App = () => {
  const [isDark, setIsDark] = useState(true);
  const [role, setRole] = useState(null);
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
          <Header />
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
