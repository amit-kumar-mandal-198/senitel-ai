import { useEffect, useState } from 'react'

const THEMES = ['dark', 'light', 'autumn', 'spring', 'winter'];

const THEME_ICONS = {
  dark: '🌙',
  light: '☀️',
  autumn: '🍂',
  spring: '🌸',
  winter: '❄️'
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  // Apply theme to HTML tag and dispatch global event
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Legacy support for light-theme class
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    
    localStorage.setItem('theme', theme);

    // Dispatch event so SeasonalEffects or other parts can react
    window.dispatchEvent(new CustomEvent('themeChange', { detail: theme }));
  }, [theme])

  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
  }

  return (
    <button 
      onClick={cycleTheme}
      className="theme-toggle-btn"
      aria-label="Toggle Theme"
      title={`Current Theme: ${theme.toUpperCase()}`}
      style={{
        padding: '6px',
        width: '36px',
        height: '36px',
        fontSize: '1.2rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--bg-glass)', 
        border: '1px solid var(--border-primary)', 
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)', 
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        marginLeft: '12px'
      }}
    >
      {THEME_ICONS[theme] || '🌙'}
    </button>
  )
}
