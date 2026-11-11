import React, { useState, useEffect } from 'react';
import {
  Layers,
  Heart,
  Clock,
  Archive,
  Folder,
  Tag,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Star,
  Flame,
  CheckCircle,
  X,
  Share2,
  Users,
  Globe,
  Lock,
  MessageSquare
} from 'lucide-react';
import { themes } from '../utils/themes';

export const Sidebar = ({
  collections,
  activeView,
  onSelectView,
  activeCollectionId,
  onSelectCollection,
  favoriteCount = 0,
  readLaterCount = 0,
  archiveCount = 0,
  topRatedCount = 0,
  rewatchCount = 0,
  watchedCount = 0,
  totalLinkCount = 0,
  selectedTag,
  onSelectTag,
  allTags,
  theme = 'dark',
  isOpen,
  onToggleSidebar,
  onOpenAddCollection,
  collectionCounts = {},
  user,
  onShareCollection,
  isLoading = false,
  onOpenFriendsModal,
  pendingRequestsCount = 0,
  onOpenEditProfile,
  onOpenChat
}) => {
  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatarUrl]);

  const isProfileActive = activeView === 'editProfile';
  const isChatActive = activeView === 'chat';

  // Responsive mobile detector
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleItemSelect = (action) => {
    action();
    if (isMobile && onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const systemViews = [
    { id: 'all', label: 'All Bookmarks', icon: BookOpen, count: totalLinkCount, color: colors.accent },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favoriteCount, color: colors.favorite },
    { id: 'topRated', label: 'Top Rated', icon: Star, count: topRatedCount, color: colors.rating },
    { id: 'rewatchWorthy', label: 'Rewatch Worthy', icon: Flame, count: rewatchCount, color: colors.rewatch },
    { id: 'watched', label: 'Already Watched', icon: CheckCircle, count: watchedCount, color: colors.watched },
    { id: 'readLater', label: 'Read Later', icon: Clock, count: readLaterCount, color: colors.readLater },
    { id: 'archive', label: 'Archive', icon: Archive, count: archiveCount, color: colors.textSecondary }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && isOpen && (
        <div
          onClick={onToggleSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 90,
            animation: 'fadeIn 0.2s ease forwards',
          }}
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        style={{
          position: isMobile ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          bottom: 0,
          width: isMobile ? '280px' : (isOpen ? '260px' : '0px'),
          maxWidth: '85vw',
          backgroundColor: isDark ? colors.sidebarBg : '#ffffff',
          borderRight: (!isMobile && !isOpen) ? 'none' : `1px solid ${colors.border}`,
          height: '100vh',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: isMobile ? 100 : 20,
          transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: isMobile
            ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isMobile && isOpen
            ? (isDark ? '0 0 40px rgba(0,0,0,0.85)' : '0 0 30px rgba(0,0,0,0.15)')
            : 'none',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {/* Workspace Brand Header */}
        <div
          style={{
            padding: '18px 16px 14px 16px',
            borderBottom: `1px solid ${colors.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            onClick={onOpenEditProfile}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: onOpenEditProfile ? 'pointer' : 'default' }}
            title={onOpenEditProfile ? 'Edit Profile & Settings' : undefined}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: `linear-gradient(135deg, ${colors.accentFrom}, ${colors.accentTo})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: `0 4px 12px ${colors.accentLight}`,
                flexShrink: 0,
              }}
            >
              <Layers size={17} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '14.5px',
                    fontWeight: '700',
                    color: colors.text,
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  LinkCollect
                </span>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: '700',
                    padding: '2px 5px',
                    borderRadius: '4px',
                    backgroundColor: colors.accentLight,
                    color: colors.accent,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  PRO
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: colors.textTertiary }}>
                @{user?.username || 'workspace'}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleSidebar}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: colors.textTertiary,
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close Sidebar"
          >
            {isMobile ? <X size={18} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Quick Views */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0 8px 6px 8px',
              }}
            >
              Quick Views
            </span>

            {systemViews.map((item) => {
              const Icon = item.icon;
              const isSelected = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemSelect(() => onSelectView(item.id))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isSelected
                      ? (isDark ? 'rgba(99, 102, 241, 0.14)' : 'rgba(79, 70, 229, 0.08)')
                      : 'transparent',
                    color: isSelected ? colors.accent : colors.textSecondary,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isSelected ? '600' : '500',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = isDark ? '#1a1a22' : '#f1f5f9';
                      e.currentTarget.style.color = colors.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = colors.textSecondary;
                    }
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <Icon
                      size={16}
                      style={{
                        color: isSelected ? colors.accent : (item.color || colors.textTertiary)
                      }}
                    />
                    <span>{item.label}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      backgroundColor: isSelected
                        ? (isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(79, 70, 229, 0.15)')
                        : (isDark ? '#1f1f26' : '#f1f5f9'),
                      color: isSelected ? colors.accent : colors.textTertiary,
                      fontWeight: '600',
                    }}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* User Collections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px 6px 8px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: colors.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Collections
              </span>
              <button
                onClick={() => handleItemSelect(onOpenAddCollection)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  color: colors.textTertiary,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                }}
                title="Add New Collection"
              >
                <Plus size={14} />
              </button>
            </div>

            {isLoading && collections.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '4px 8px' }}>
                <div
                  className="animate-pulse"
                  style={{
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0',
                  }}
                />
                <div
                  className="animate-pulse"
                  style={{
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0',
                  }}
                />
              </div>
            ) : collections.map((collection, idx) => {
              const isSelected = activeView === 'collection' && activeCollectionId === idx;
              const nameKey = (collection.collectionName || '').trim().toLowerCase();
              const count = (collection.id ? collectionCounts[`id_${collection.id}`] : undefined)
                ?? collectionCounts[nameKey]
                ?? collection.totalLinks
                ?? (collection.links?.length || 0);
              return (
                <button
                  key={idx}
                  onClick={() => handleItemSelect(() => onSelectCollection(idx))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isSelected
                      ? (isDark ? 'rgba(99, 102, 241, 0.14)' : 'rgba(79, 70, 229, 0.08)')
                      : 'transparent',
                    color: isSelected ? colors.accent : colors.textSecondary,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isSelected ? '600' : '500',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = isDark ? '#1a1a22' : '#f1f5f9';
                      e.currentTarget.style.color = colors.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = colors.textSecondary;
                    }
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <Folder
                      size={15}
                      style={{
                        color: isSelected ? colors.accent : colors.textTertiary,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden' }}>
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {collection.collectionName}
                      </span>
                      {collection.isPublic && (
                        <Globe size={11} color="#10b981" title="Public (visible to friends)" style={{ flexShrink: 0 }} />
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {onShareCollection && collection.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareCollection(collection);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.textTertiary,
                          cursor: 'pointer',
                          padding: '3px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = colors.accent)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = colors.textTertiary)}
                        title={`Share "${collection.collectionName}" publicly`}
                      >
                        <Share2 size={12} />
                      </button>
                    )}
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(79, 70, 229, 0.15)')
                          : (isDark ? '#1f1f26' : '#f1f5f9'),
                        color: isSelected ? colors.accent : colors.textTertiary,
                        fontWeight: '600',
                        flexShrink: 0,
                      }}
                    >
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tags Matrix */}
          {allTags && allTags.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: colors.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0 8px',
                }}
              >
                Tags
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '0 4px' }}>
                {allTags.map((tag) => {
                  const isTagSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => handleItemSelect(() => onSelectTag(isTagSelected ? null : tag))}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${isTagSelected ? colors.accent : colors.border}`,
                        backgroundColor: isTagSelected ? colors.accentLight : 'transparent',
                        color: isTagSelected ? colors.accent : colors.textSecondary,
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: isTagSelected ? '600' : '400',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Tag size={10} />
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom 3-Button Quick-Access Layout (Profile, Social, Chat) */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: `1px solid ${colors.borderLight}`,
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
            }}
          >
            {/* 1. Profile Button */}
            <button
              type="button"
              onClick={() => handleItemSelect(onOpenEditProfile)}
              title="Profile & Settings"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 4px 7px 4px',
                borderRadius: '12px',
                border: isProfileActive
                  ? `1.5px solid ${colors.accent}`
                  : `1px solid ${isDark ? '#262633' : '#e2e8f0'}`,
                backgroundColor: isProfileActive
                  ? (isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(79, 70, 229, 0.12)')
                  : (isDark ? '#16161f' : '#ffffff'),
                color: isProfileActive ? (isDark ? '#a5b4fc' : colors.accent) : colors.textSecondary,
                cursor: 'pointer',
                position: 'relative',
                outline: 'none',
                boxShadow: isProfileActive
                  ? (isDark ? '0 0 12px rgba(99, 102, 241, 0.25)' : '0 2px 8px rgba(79, 70, 229, 0.15)')
                  : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                if (!isProfileActive) {
                  e.currentTarget.style.backgroundColor = isDark ? '#1f1f2b' : '#f8fafc';
                  e.currentTarget.style.borderColor = isDark ? '#3d3d52' : '#cbd5e1';
                  e.currentTarget.style.color = colors.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!isProfileActive) {
                  e.currentTarget.style.backgroundColor = isDark ? '#16161f' : '#ffffff';
                  e.currentTarget.style.borderColor = isDark ? '#262633' : '#e2e8f0';
                  e.currentTarget.style.color = colors.textSecondary;
                }
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px',
                  flexShrink: 0,
                }}
              >
                {user?.avatarUrl && !avatarFailed ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name || user?.username || 'Profile'}
                    onError={() => setAvatarFailed(true)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                      border: isProfileActive
                        ? `1.5px solid ${colors.accent}`
                        : `1px solid ${isDark ? '#3b3b4d' : '#cbd5e1'}`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${colors.accentFrom || '#6366f1'}, ${colors.accentTo || '#8b5cf6'})`,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      border: isProfileActive ? `1.5px solid ${colors.accent}` : 'none',
                    }}
                  >
                    {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isProfileActive ? '600' : '500',
                  color: isProfileActive ? (isDark ? '#e0e7ff' : colors.accent) : colors.textSecondary,
                  letterSpacing: '-0.01em',
                  lineHeight: '1.2',
                }}
              >
                Profile
              </span>
            </button>

            {/* 2. Social Button */}
            <button
              type="button"
              onClick={() => handleItemSelect(onOpenFriendsModal)}
              title="Friends & Social Network"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 4px 7px 4px',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#262633' : '#e2e8f0'}`,
                backgroundColor: isDark ? '#16161f' : '#ffffff',
                color: colors.textSecondary,
                cursor: 'pointer',
                position: 'relative',
                outline: 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#1f1f2b' : '#f8fafc';
                e.currentTarget.style.borderColor = isDark ? '#3d3d52' : '#cbd5e1';
                e.currentTarget.style.color = colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#16161f' : '#ffffff';
                e.currentTarget.style.borderColor = isDark ? '#262633' : '#e2e8f0';
                e.currentTarget.style.color = colors.textSecondary;
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px',
                  flexShrink: 0,
                }}
              >
                <Users size={17} />
                {pendingRequestsCount > 0 ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-6px',
                      minWidth: '15px',
                      height: '15px',
                      padding: '0 3px',
                      borderRadius: '8px',
                      backgroundColor: '#f43f5e',
                      color: '#ffffff',
                      fontSize: '9.5px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(244, 63, 94, 0.4)',
                    }}
                  >
                    {pendingRequestsCount}
                  </span>
                ) : (
                  <span
                    style={{
                      position: 'absolute',
                      top: '0px',
                      right: '-2px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#a855f7',
                      boxShadow: '0 0 6px #a855f7',
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: colors.textSecondary,
                  letterSpacing: '-0.01em',
                  lineHeight: '1.2',
                }}
              >
                Social
              </span>
            </button>

            {/* 3. Chat Button */}
            <button
              type="button"
              onClick={() => handleItemSelect(onOpenChat)}
              title="Chat & Direct Messaging (Coming Soon)"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 4px 7px 4px',
                borderRadius: '12px',
                border: isChatActive
                  ? `1.5px solid ${colors.accent}`
                  : `1px solid ${isDark ? '#262633' : '#e2e8f0'}`,
                backgroundColor: isChatActive
                  ? (isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(79, 70, 229, 0.12)')
                  : (isDark ? '#16161f' : '#ffffff'),
                color: isChatActive ? (isDark ? '#a5b4fc' : colors.accent) : colors.textSecondary,
                cursor: 'pointer',
                position: 'relative',
                outline: 'none',
                boxShadow: isChatActive
                  ? (isDark ? '0 0 12px rgba(99, 102, 241, 0.25)' : '0 2px 8px rgba(79, 70, 229, 0.15)')
                  : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                if (!isChatActive) {
                  e.currentTarget.style.backgroundColor = isDark ? '#1f1f2b' : '#f8fafc';
                  e.currentTarget.style.borderColor = isDark ? '#3d3d52' : '#cbd5e1';
                  e.currentTarget.style.color = colors.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!isChatActive) {
                  e.currentTarget.style.backgroundColor = isDark ? '#16161f' : '#ffffff';
                  e.currentTarget.style.borderColor = isDark ? '#262633' : '#e2e8f0';
                  e.currentTarget.style.color = colors.textSecondary;
                }
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px',
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={17} />
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-6px',
                    minWidth: '15px',
                    height: '15px',
                    padding: '0 3px',
                    borderRadius: '8px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '9.5px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  2
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isChatActive ? '600' : '500',
                  color: isChatActive ? (isDark ? '#e0e7ff' : colors.accent) : colors.textSecondary,
                  letterSpacing: '-0.01em',
                  lineHeight: '1.2',
                }}
              >
                Chat
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
