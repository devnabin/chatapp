import { useEffect, useState } from "react";

import "./Darkmode.css";


function SunIcon() {
  return (
    <svg
      className="darkmode-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.42 1.42" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.42" />
    </svg>
  );
}


function MoonIcon() {
  return (
    <svg
      className="darkmode-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}


function Darkmode() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("binchat-theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
  });


  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode,
    );

    localStorage.setItem(
      "binchat-theme",
      darkMode ? "dark" : "light",
    );
  }, [darkMode]);


  function toggleDarkMode() {
    setDarkMode((currentMode) => !currentMode);
  }


  return (
    <button
      type="button"
      className="darkmode-toggle"
      aria-label={
        darkMode
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        darkMode
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      aria-pressed={darkMode}
      onClick={toggleDarkMode}
    >
      {darkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}


export default Darkmode;