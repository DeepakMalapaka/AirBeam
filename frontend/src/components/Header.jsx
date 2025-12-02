import React, { useContext } from "react";
import ThemeContext from "../context/ThemeContext";
import sun from "../assets/sun.svg";
import moon from "../assets/moon.svg";
import Telegram from "../assets/Telegram.svg";

const Header = () => {
  const { isDark, setIsDark } = useContext(ThemeContext);

  return (
    <div
      className={`
        w-full flex justify-between items-center p-5 px-6 
        transition-colors duration-500 border-b
        ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}
      `}
    >
      <div
        className={`font-serif text-3xl flex items-center gap-2 
        ${isDark ? "text-slate-100" : "text-[#1A1C1E]"}
      `}
      >
        <h1>AirBeam</h1>
        <img src={Telegram} alt="Telegram" className="w-7 h-7 opacity-90" />
      </div>

      <button
        onClick={() => setIsDark(!isDark)}
        className={`
          p-2 rounded-full border transition-colors duration-500 
          ${
            isDark
              ? "bg-slate-800 border-slate-600 hover:bg-slate-700"
              : "bg-white border-gray-300 hover:bg-blue-50"
          }
        `}
      >
        <img src={isDark ? moon : sun} alt="Toggle theme" className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Header;
