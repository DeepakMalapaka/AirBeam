import React, { useContext } from "react";
import ThemeContext from "../context/themeContext";

const Border = () => {
  const { isDark } = useContext(ThemeContext);

  return (
    <div
      className={`
        w-full border-t border-dashed transition-colors duration-500
        ${isDark ? "border-slate-600" : "border-gray-400"}
      `}
    />
  );
};

export default Border;
