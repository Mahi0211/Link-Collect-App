import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  LayoutGrid,
  List,
  Columns3,
  Sun,
  Moon,
  LogOut,
  SlidersHorizontal,
  X,
  Command,
  User as UserIcon,
  Check,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { themes } from '../utils/themes';

export const Header = ({
  searchQuery,
  onSearchChange,
  onOpenCommandPalette,
  viewMode,
  onChangeViewMode,
  sortOption,
  onChangeSortOption,
  theme,
  onToggleTheme,
  onOpenAddModal,
  onToggleSidebar,
  isSidebarOpen,
  user,
  onLogout
}) => {
  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Responsive mobile detector
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <header
        style={{
          backgroundColor: isDark ? colors.glassBg : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${colors.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 35,
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        {/* Main Bar */}
        <div
          style={{
            height: isMobile ? '56px' : '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 12px' : '0 24px',
            gap: isMobile ? '8px' : '16px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Left: Sidebar Toggle + Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={onToggleSidebar}
              style={{
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
                padding: '7px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            >
              <Menu size={18} />
            </button>

            {isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '7px',
                    background: `linear-gradient(135deg, ${colors.accentFrom}, ${colors.accentTo})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <Layers size={14} />
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    fontFamily: 'var(--font-heading)',
                    color: colors.text,
                  }}
                >
                  LinkCollect
                </span>
              </div>
            )}
          </div>

          {/* Desktop Center: Omnibar */}
          {!isMobile && (
            <div
              style={{
                flex: 1,
                maxWidth: '520px',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    color: colors.textTertiary,
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search links, tags, domains, notes..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 74px 9px 38px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? '#141418' : '#f1f5f9',
                    border: `1px solid ${searchQuery ? colors.accent : colors.border}`,
                    color: colors.text,
                    fontSize: '13.5px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    right: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {searchQuery ? (
                    <button
                      onClick={() => onSearchChange('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: colors.textTertiary,
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Clear search"
                    >
                      <X size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={onOpenCommandPalette}
                      style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '2px 6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: colors.textTertiary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                      title="Open Command Palette (Ctrl + K)"
                    >
                      <Command size={10} />
                      <span>K</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right Action Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px', flexShrink: 0 }}>
            {/* Desktop View Mode Switcher */}
            {!isMobile && (
              <div
                style={{
                  display: 'flex',
                  backgroundColor: isDark ? '#141418' : '#f1f5f9',
                  padding: '3px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <button
                  onClick={() => onChangeViewMode('grid')}
                  style={{
                    background: viewMode === 'grid' ? (isDark ? '#272730' : '#ffffff') : 'transparent',
                    border: 'none',
                    color: viewMode === 'grid' ? colors.text : colors.textTertiary,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => onChangeViewMode('list')}
                  style={{
                    background: viewMode === 'list' ? (isDark ? '#272730' : '#ffffff') : 'transparent',
                    border: 'none',
                    color: viewMode === 'list' ? colors.text : colors.textTertiary,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="List View"
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => onChangeViewMode('kanban')}
                  style={{
                    background: viewMode === 'kanban' ? (isDark ? '#272730' : '#ffffff') : 'transparent',
                    border: 'none',
                    color: viewMode === 'kanban' ? colors.text : colors.textTertiary,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Kanban Board View"
                >
                  <Columns3 size={15} />
                </button>
              </div>
            )}

            {/* Desktop Sort Selector */}
            {!isMobile && (
              <select
                value={sortOption}
                onChange={(e) => onChangeSortOption(e.target.value)}
                style={{
                  backgroundColor: isDark ? '#141418' : '#f1f5f9',
                  color: colors.textSecondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '500',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="newest">Newest First</option>
                <option value="topRated">Top Rated ★</option>
                <option value="mostViewed">Most Viewed 👁</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Title (A-Z)</option>
                <option value="domain">By Domain</option>
              </select>
            )}

            {/* + Add Link Button */}
            <button
              onClick={onOpenAddModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: colors.accent,
                color: '#ffffff',
                border: 'none',
                padding: isMobile ? '7px 10px' : '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: `0 2px 8px ${colors.accentLight}`,
              }}
              title="Add Link (N)"
            >
              <Plus size={16} />
              {!isMobile && <span>New Link</span>}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              style={{
                background: isDark ? '#141418' : '#f1f5f9',
                border: `1px solid ${colors.border}`,
                color: colors.text,
                padding: '7px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Profile Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: colors.accentLight,
                  border: `1px solid ${colors.border}`,
                  color: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                }}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </button>

              {/* Profile Dropdown */}
              {showUserDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '40px',
                    width: '200px',
                    backgroundColor: isDark ? '#18181f' : '#ffffff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    boxShadow: colors.shadowLg,
                    padding: '8px',
                    zIndex: 60,
                    animation: 'scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  }}
                >
                  <div style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.borderLight}`, marginBottom: '4px' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: colors.text }}>
                      {user?.name || 'LinkCollect User'}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: colors.textTertiary }}>
                      @{user?.username || 'member'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowLogoutConfirm(true);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'none',
                      color: colors.danger,
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      fontWeight: '500',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Expandable Sub-bar: Search & Filters (Zero Horizontal Overflow) */}
        {isMobile && (
          <div
            style={{
              padding: '8px 12px 10px 12px',
              borderTop: `1px solid ${colors.borderLight}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Search Input on Mobile */}
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', color: colors.textTertiary }} />
              <input
                type="text"
                placeholder="Search links, tags, domains..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 34px 8px 34px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? '#141418' : '#f1f5f9',
                  border: `1px solid ${searchQuery ? colors.accent : colors.border}`,
                  color: colors.text,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: colors.textTertiary,
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Mobile View Switcher & Sort Strip */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              {/* View Mode Toggle Buttons */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: isDark ? '#141418' : '#f1f5f9',
                  padding: '2px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <button
                  onClick={() => onChangeViewMode('grid')}
                  style={{
                    background: viewMode === 'grid' ? (isDark ? '#272730' : '#ffffff') : 'transparent',
                    border: 'none',
                    color: viewMode === 'grid' ? colors.text : colors.textTertiary,
                    padding: '5px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Grid View"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => onChangeViewMode('list')}
                  style={{
                    background: viewMode === 'list' ? (isDark ? '#272730' : '#ffffff') : 'transparent',
                    border: 'none',
                    color: viewMode === 'list' ? colors.text : colors.textTertiary,
                    padding: '5px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="List View"
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => onChangeViewMode('kanban')}
                  style={{
                    background: viewMode === 'kanban' ? (isDark ? '#272730' : '#ffffff') : 'transparent',
                    border: 'none',
                    color: viewMode === 'kanban' ? colors.text : colors.textTertiary,
                    padding: '5px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Kanban Board View"
                >
                  <Columns3 size={14} />
                </button>
              </div>

              {/* Mobile Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <select
                  value={sortOption}
                  onChange={(e) => onChangeSortOption(e.target.value)}
                  style={{
                    backgroundColor: isDark ? '#141418' : '#f1f5f9',
                    color: colors.textSecondary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    padding: '5px 8px',
                    fontSize: '11.5px',
                    fontWeight: '500',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="newest">Newest</option>
                  <option value="topRated">Top Rated ★</option>
                  <option value="mostViewed">Most Viewed 👁</option>
                  <option value="oldest">Oldest</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="domain">Domain</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Styled Logout Modal */}
      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? '#18181f' : '#ffffff',
              border: `1px solid ${colors.border}`,
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '360px',
              width: '100%',
              boxShadow: colors.shadowLg,
              animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: colors.text }}>
              Log out of LinkCollect?
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: colors.textSecondary, lineHeight: '1.5' }}>
              Your session will end. You can log back in at any time with your credentials.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: 'transparent',
                  color: colors.textSecondary,
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: colors.danger,
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
