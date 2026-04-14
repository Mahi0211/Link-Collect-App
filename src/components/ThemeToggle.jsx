// Theme Toggle Button
import { themes } from "../utils/themes";

export const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '8px 12px',
        borderRadius: '8px',
        border: `0.5px solid ${themes[theme].border}`,
        backgroundColor: themes[theme].bgSecondary,
        color: themes[theme].text,
        cursor: 'pointer',
        fontSize: '18px',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = themes[theme].cardHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = themes[theme].bgSecondary;
      }}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};