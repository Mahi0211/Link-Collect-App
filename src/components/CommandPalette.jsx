import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  Heart,
  Clock,
  Archive,
  Plus,
  Moon,
  Sun,
  ExternalLink,
  Tag,
  Folder,
  Star,
  Flame,
  CheckCircle
} from 'lucide-react';
import { themes } from '../utils/themes';

export const CommandPalette = ({
  isOpen,
  onClose,
  allLinks = [],
  collections = [],
  onSelectLink,
  onSelectView,
  onSelectCollection,
  onOpenAddModal,
  onToggleTheme,
  theme = 'dark'
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const colors = themes[theme];
  const isDark = theme === 'dark';

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Build items list
  const systemActions = [
    {
      id: 'action-add',
      title: 'Add New Link',
      type: 'Action',
      icon: Plus,
      run: () => { onClose(); onOpenAddModal(); }
    },
    {
      id: 'action-theme',
      title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      type: 'Action',
      icon: theme === 'dark' ? Sun : Moon,
      run: () => { onToggleTheme(); onClose(); }
    },
    {
      id: 'action-favorites',
      title: 'Go to Favorites',
      type: 'Navigation',
      icon: Heart,
      run: () => { onSelectView('favorites'); onClose(); }
    },
    {
      id: 'action-toprated',
      title: 'Go to Top Rated (★)',
      type: 'Navigation',
      icon: Star,
      run: () => { onSelectView('topRated'); onClose(); }
    },
    {
      id: 'action-rewatch',
      title: 'Go to Rewatch Worthy (🔥)',
      type: 'Navigation',
      icon: Flame,
      run: () => { onSelectView('rewatchWorthy'); onClose(); }
    },
    {
      id: 'action-watched',
      title: 'Go to Already Watched (✓)',
      type: 'Navigation',
      icon: CheckCircle,
      run: () => { onSelectView('watched'); onClose(); }
    },
    {
      id: 'action-readlater',
      title: 'Go to Read Later',
      type: 'Navigation',
      icon: Clock,
      run: () => { onSelectView('readLater'); onClose(); }
    },
    {
      id: 'action-archive',
      title: 'Go to Archive',
      type: 'Navigation',
      icon: Archive,
      run: () => { onSelectView('archive'); onClose(); }
    },
  ];

  const collectionItems = collections.map((c, i) => ({
    id: `col-${i}`,
    title: `Open Collection: ${c.collectionName}`,
    type: 'Collection',
    icon: Folder,
    run: () => { onSelectCollection(i); onClose(); }
  }));

  const linkItems = allLinks.map((item, i) => ({
    id: `link-${i}`,
    title: item.title || item.link,
    subtitle: item.link,
    type: 'Link',
    icon: ExternalLink,
    run: () => { onSelectLink(item); onClose(); }
  }));

  const allItems = [...systemActions, ...collectionItems, ...linkItems];

  const filteredItems = query.trim() === ''
    ? allItems.slice(0, 15)
    : allItems.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
          item.type.toLowerCase().includes(q)
        );
      }).slice(0, 20);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].run();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: isDark ? '#141418' : '#ffffff',
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          boxShadow: colors.shadowLg,
          overflow: 'hidden',
          animation: 'scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Search size={18} style={{ color: colors.textTertiary }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search links..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              border: 'none',
              background: 'none',
              color: colors.text,
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
            }}
          />
          <kbd
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: isDark ? '#272730' : '#f1f5f9',
              color: colors.textTertiary,
              fontSize: '11px',
              fontWeight: '600',
              border: `1px solid ${colors.border}`,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '8px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: colors.textTertiary, fontSize: '13px' }}>
              No commands or links found matching "{query}"
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => item.run()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? (isDark ? '#23232c' : '#f1f5f9') : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        color: isSelected ? colors.accent : colors.textTertiary,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '13.5px',
                          fontWeight: isSelected ? '600' : '500',
                          color: colors.text,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '11px',
                            color: colors.textTertiary,
                            fontFamily: 'var(--font-mono)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: '600',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: isDark ? '#1a1a20' : '#e2e8f0',
                      color: colors.textTertiary,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.type}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: colors.textTertiary,
            backgroundColor: isDark ? '#101014' : '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>Pro Omnibar</span>
        </div>
      </div>
    </div>
  );
};
