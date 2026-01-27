import React, { useEffect, useState } from "react";

const DarkModeToggle = () => {

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-black dark:text-white transition ease-in-out cursor-pointer ">
        
      {darkMode ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
};

export default DarkModeToggle;
