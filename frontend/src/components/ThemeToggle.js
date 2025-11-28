import React, { useState, useEffect } from 'react';
import '../styles/ThemeToggle.css';
import soleil from '../assets/theme-switch/soleil.png';
import lune from '../assets/theme-switch/lune.png';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.classList.add('dark-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Mode clair' : 'Mode sombre'}>
      <img 
        src={isDark ? soleil : lune} 
        alt={isDark ? 'Soleil' : 'Lune'}
        className="theme-icon"
      />
    </button>
  );
}
