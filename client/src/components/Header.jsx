export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-logo">✓</div>
        <div>
          <h1>Task Manager</h1>
          <p>Plan your day. Ship your work.</p>
        </div>
      </div>
      <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? (
          <>☀️ Light</>
        ) : (
          <>🌙 Dark</>
        )}
      </button>
    </header>
  );
}
