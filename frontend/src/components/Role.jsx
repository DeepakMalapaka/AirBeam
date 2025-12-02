import React, { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';
import RoleContext from '../context/RoleContext';

const Role = () => {
  const { setRole } = useContext(RoleContext);
  const { isDark } = useContext(ThemeContext);

  return (
    <div
      className={`
        flex flex-col justify-center items-center 
        min-h-[75vh] 
        transition-colors duration-500
        ${isDark ? "bg-slate-900 text-slate-100" : "bg-[#F7F9FC] text-[#1A1C1E]"}
      `}
    >

      {/* Center Card */}
      <div
        className={`
          w-1/2 p-8 rounded-2xl border 
          transition-colors duration-500 shadow-md
          border-dashed
          ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-300 bg-white"}
        `}
      >

        {/* Title */}
        <p className="text-2xl font-serif mb-8 text-center">
          Select your role
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-6 mb-6">
          <button
            onClick={() => setRole("sender")}
            className={`
              px-6 py-2 rounded-xl font-serif transition-all
              ${isDark 
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-500 text-white hover:bg-blue-600"}
            `}
          >
            Sender
          </button>

          <button
            onClick={() => setRole("receiver")}
            className={`
              px-6 py-2 rounded-xl font-serif transition-all
              ${isDark 
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-500 text-white hover:bg-blue-600"}
            `}
          >
            Receiver
          </button>
        </div>

      </div>
    </div>
  );
};

export default Role;
