import React, { useState, useContext } from "react";
import ThemeContext from "../context/themeContext";
import Border from "./Border";
const Container = () => {
  const { isDark } = useContext(ThemeContext);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [role, setRole] = useState(null);
  const [file, setFile] = useState(null);
  //   Handling connect
  const handleConnect = async () => {
    setIsConnecting(true);
    setRole("sender");
    setTimeout(() => {
      setIsConnecting(false);
      //   setIsConnected(true);
    }, 1500);
  };
  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };
  return (
    <div
      className={`
        w-1/2 
        h-[75vh]
        border 
        transition-colors duration-500
        rounded-xl
        border-dashed
        p-5
        ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}
      `}
    >
      <div className="h-[25vh]">
        <h1 className="font-serif text-2xl my-4">Local Wi-Fi File Sharing</h1>

        {!isConnected && (
          <div className="flex justify-center mb-2">
            <button
              className={`bg-blue-600 border rounded-xl border-blue-600 p-2 mb-3 font-serif text-white`}
              onClick={handleConnect}
            >
              Connect to Peer
            </button>
          </div>
        )}
        {!isConnected && isConnecting && (
          <p className="font-serif text-lg my-3 text-gray-500">
            Waiting For Connection...
          </p>
        )}
      </div>
      <Border />
      {/* File section */}
      <div className="h-[15vh]">
        <div className={`m-4 flex justify-between px-20`}>
          <label>
            <input type="file" className="hidden" onChange={handleFileSelect} />
            <button
              className={`border rounded-xl p-2 mb-4 font-serif transition-colors duration-500 ease-in-out ${
                isDark
                  ? `bg-gray-600 border-gray-600`
                  : `bg-gray-400 border-gray-400`
              }`}
            >
              Choose File
            </button>
          </label>
          <button
            className={`bg-blue-600 border rounded-xl border-blue-600 p-2 mb-4 font-serif text-white px-6`}
          >
            Send
          </button>
        </div>
        {/* File info is here */}
        <div className="flex justify-center">
          {file && (
            <div className="text-center font-serif text-sm text-gray-300 mt-3">
              <p>
                <span className="font-semibold text-gray-200">File:</span>{" "}
                {file.name}
              </p>
              <p>
                <span className="font-semibold text-gray-200">Size:</span>{" "}
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p>
                <span className="font-semibold text-gray-200">Type:</span>{" "}
                {file.type}
              </p>
            </div>
          )}
        </div>
      </div>
      <Border />
      {/* Progress session */}
      <div className="h-[25vh]">
        <div className="progress flex flex-col justify-center items-center space-y-1 my-4">
          <p className="font-serif">Progress</p>
          <p className="font-serif">Send: 0%</p>
          <p className="font-serif">Receive: 0%</p>
        </div>
      </div>
    </div>
  );
};

export default Container;
