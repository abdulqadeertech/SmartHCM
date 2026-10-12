import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('novahcm_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Default to enterprise dark
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('novahcm_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('novahcm_theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border shadow-xs ${
        isDark
          ? 'text-amber-400 bg-[#0a2736] border-[#14425b] hover:border-amber-400/50 hover:bg-[#0c2f42]'
          : 'text-amber-600 bg-white border-slate-300 hover:border-amber-500 hover:bg-slate-50'
      } ${className}`}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      {isDark ? (
        <Sun size={16} className="text-amber-400 animate-fadeIn" />
      ) : (
        <Moon size={16} className="text-slate-700 animate-fadeIn" />
      )}
    </button>
  );
};
