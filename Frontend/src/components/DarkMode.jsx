import React, { useEffect, useState } from "react";

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) {
      const isDark = JSON.parse(savedMode);
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  // Update dark mode and save to localStorage
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="group relative flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-slate-800 dark:to-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 dark:hover:scale-110"
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {/* Sun Icon */}
      <div
        className={`absolute transition-all duration-500 ease-in-out ${
          darkMode
            ? "opacity-0 rotate-180 scale-0"
            : "opacity-100 rotate-0 scale-100"
        }`}
      >
        <svg
          className="w-6 h-6 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.828-2.829a1 1 0 00-1.414 0l-2.828 2.829a1 1 0 001.414 1.414L9 13.414l1.586 1.586a1 1 0 001.414-1.414zM16.414 1.586a1 1 0 00-1.414 0L12.586 4.05 11 2.464a1 1 0 10-1.414 1.414l2.829 2.828a1 1 0 001.414 0l2.828-2.829a1 1 0 000-1.414zM16 9a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM4 12a1 1 0 01-1-1V9a1 1 0 112 0v2a1 1 0 01-1 1zm9.586-4.414a1 1 0 00-1.414 0L12 7.586l-1.586-1.586a1 1 0 00-1.414 1.414l2.829 2.828a1 1 0 001.414 0l2.828-2.829a1 1 0 000-1.414zM3.172 5.172a1 1 0 011.414 0l2.829 2.829a1 1 0 001.414-1.414L6 4.757 3.586 2.343a1 1 0 00-1.414 1.414l2.586 2.585z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Moon Icon */}
      <div
        className={`absolute transition-all duration-500 ease-in-out ${
          darkMode
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-180 scale-0"
        }`}
      >
        <svg
          className="w-6 h-6 text-slate-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>

      {/* Tooltip */}
      <span className="absolute -bottom-10 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {darkMode ? "Light Mode" : "Dark Mode"}
      </span>

      {/* Background Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 dark:from-indigo-500 dark:to-purple-600 opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-300 blur-lg" />
    </button>
  );
};

export default DarkModeToggle;
