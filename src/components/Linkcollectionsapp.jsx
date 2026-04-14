import React, { useState, useRef } from 'react';
import { LinkCard } from './LinkCard';
import { TabNavigation } from './TabNavigation';
import { ThemeToggle } from './ThemeToggle';

// Main App Component
export default function LinkCollectionsApp({ data, onLogout, theme: initialTheme, onThemeChange }) {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('linkapp-theme');
    return savedTheme || initialTheme || 'light';
  });
  const scrollContainerRef = useRef(null);

  // Themes object
  const themes = {
    light: {
      bg: '#ffffff',
      bgSecondary: '#f3f4f6',
      bgTertiary: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      textTertiary: '#9ca3af',
      border: '#e5e7eb',
      cardBg: '#ffffff',
      cardHover: '#f9fafb',
      tabActive: '#2563eb',
      tabInactive: '#f3f4f6',
      accentFrom: '#3b82f6',
      accentTo: '#a855f7',
    },
    dark: {
      bg: '#0f172a',
      bgSecondary: '#1e293b',
      bgTertiary: '#0f172a',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textTertiary: '#94a3b8',
      border: '#334155',
      cardBg: '#1e293b',
      cardHover: '#334155',
      tabActive: '#3b82f6',
      tabInactive: '#334155',
      accentFrom: '#3b82f6',
      accentTo: '#a855f7',
    }
  };

  const allLinks = data.collections.flatMap((collection) =>
    collection.links.map((link) => ({
      link,
      collectionName: collection.collectionName
    }))
  );

  const filteredLinks = allLinks.filter(({ link }) => {
    const url = link.toLowerCase();
    return url.includes(searchQuery.toLowerCase());
  });

  // Save theme to localStorage when it changes
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('linkapp-theme', newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      if (onLogout) {
        onLogout();
      }
    }
  };

  const activeCollection = data?.collections[activeTab];
  const hasLinks = activeCollection?.links && activeCollection.links.length > 0;
  const colors = themes[theme];

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'light'
        ? 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)'
        : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      flexDirection: 'column',
      color: colors.text,
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: colors.bg,
        borderBottom: `0.5px solid ${colors.border}`,
        padding: '1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '500',
              margin: '0 0 8px 0',
              color: colors.text,
            }}>
              {data.name}
            </h1>
            <p style={{
              fontSize: '13px',
              color: colors.textSecondary,
              margin: 0,
            }}>
              {data.collections.length} collections • {data.collections.reduce((sum, c) => sum + c.totalLinks, 0)} links
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", width: "250px" }}>
            <input
              type="text"
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "10px 36px 10px 14px",
                borderRadius: "8px",
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.bgSecondary,
                color: colors.text,
                width: "100%",
                outline: "none",
                fontSize: "14px",
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.accentFrom;
                e.target.style.backgroundColor = colors.bg;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.backgroundColor = colors.bgSecondary;
              }}
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: colors.textSecondary,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* User Info & Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              textAlign: 'right',
            }}>
              <p style={{
                fontSize: '12px',
                color: colors.textSecondary,
                margin: 0,
              }}>
                @{data.username}
              </p>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `0.5px solid ${colors.border}`,
                backgroundColor: colors.bgSecondary,
                color: colors.text,
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
                e.currentTarget.style.backgroundColor = colors.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.bgSecondary;
              }}
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: `0.5px solid ${colors.border}`,
                backgroundColor: colors.bgSecondary,
                color: colors.text,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.color = theme === 'dark' ? '#fca5a5' : '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.bgSecondary;
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.color = colors.text;
              }}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      {!searchQuery && (
        <TabNavigation
          collections={data.collections}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scrollContainerRef={scrollContainerRef}
          theme={theme}
        />
      )}

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '2rem 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
      }}>
        {searchQuery ? (
          <>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '500',
              margin: '0 0 1.5rem 0',
              color: colors.text,
            }}>
              Search Results ({filteredLinks.length})
            </h2>

            {filteredLinks.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}>
                {filteredLinks.map(({ link }, i) => (
                  <LinkCard key={i} link={link} theme={theme} />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: colors.textSecondary,
              }}>
                <p style={{ fontSize: '16px', margin: 0 }}>
                  No links found matching "{searchQuery}"
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Collection Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '500',
                margin: '0 0 12px 0',
                color: colors.text,
              }}>
                {activeCollection?.collectionName}
              </h2>

              <div style={{
                width: '48px',
                height: '4px',
                background: `linear-gradient(90deg, ${colors.accentFrom}, ${colors.accentTo})`,
                borderRadius: '2px',
              }} />
            </div>

            {/* Links Grid */}
            {hasLinks ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}>
                {activeCollection.links.map((link, idx) => (
                  <LinkCard key={idx} link={link} theme={theme} />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: colors.textSecondary,
              }}>
                <p style={{ fontSize: '16px', margin: 0 }}>
                  This collection is empty
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `0.5px solid ${colors.border}`,
        backgroundColor: colors.bgSecondary,
        marginTop: '2rem',
        padding: '2rem',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            margin: 0,
          }}>
            LinkCollect • Your personal link organizer
          </p>
        </div>
      </footer>
    </div>
  );
}