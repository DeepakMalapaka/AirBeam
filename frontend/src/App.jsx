import React from "react";
import { useState } from "react";
import Header from "./components/header";
import ThemeContext from "./context/themeContext";
import Border from "./components/Border";
import Container from "./components/Container";
const App = () => {
  const [isDark, setIsDark] = useState(true);

  return (
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
            <div className={`flex items-center justify-center text-center pt-16`}>
          <Container />
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
