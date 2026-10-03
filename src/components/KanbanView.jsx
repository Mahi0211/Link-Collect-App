import React from 'react';
import { Heart, Clock, Archive, BookOpen, Star, Flame, CheckCircle } from 'lucide-react';
import { themes } from '../utils/themes';
import { LinkCard } from './LinkCard';

export const KanbanView = ({
  links = [],
  theme = 'dark',
  favorites = [],
  readLater = [],
  archive = [],
  onToggleFavorite,
  onToggleReadLater,
  onToggleWatched,
  onRate,
  onInspect,
  onCopySuccess
}) => {
  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  const columns = [
    {
      id: 'inbox',
      title: 'Inbox / All',
      icon: BookOpen,
      color: colors.accent,
      items: links.filter(l => !archive.includes(typeof l === 'string' ? l : l.url || l.link))
    },
    {
      id: 'topRated',
      title: 'Top Rated (4-5★)',
      icon: Star,
      color: colors.rating,
      items: links.filter(l => (l.rating || 0) >= 4)
    },
    {
      id: 'rewatch',
      title: 'Rewatch Worthy 🔥',
      icon: Flame,
      color: colors.rewatch,
      items: links.filter(l => l.rewatchWorthy)
    },
    {
      id: 'watched',
      title: 'Watched ✓',
      icon: CheckCircle,
      color: colors.watched,
      items: links.filter(l => l.watched)
    },
    {
      id: 'favorites',
      title: 'Favorites',
      icon: Heart,
      color: colors.favorite,
      items: links.filter(l => favorites.includes(typeof l === 'string' ? l : l.url || l.link))
    },
    {
      id: 'readLater',
      title: 'Read Later',
      icon: Clock,
      color: colors.readLater,
      items: links.filter(l => readLater.includes(typeof l === 'string' ? l : l.url || l.link))
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '20px',
        alignItems: 'start',
      }}
    >
      {columns.map((col) => {
        const Icon = col.icon;
        return (
          <div
            key={col.id}
            style={{
              backgroundColor: isDark ? 'rgba(24, 24, 27, 0.65)' : '#f8fafc',
              borderRadius: '14px',
              border: `1px solid ${colors.border}`,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: 'calc(100vh - 160px)',
              overflowY: 'auto',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: `1px solid ${colors.borderLight}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={16} style={{ color: col.color }} />
                <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '600', color: colors.text }}>
                  {col.title}
                </h4>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? '#272730' : '#e2e8f0',
                  color: colors.textSecondary,
                }}
              >
                {col.items.length}
              </span>
            </div>

            {/* Column Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {col.items.length === 0 ? (
                <div
                  style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: colors.textTertiary,
                    border: `1px dashed ${colors.border}`,
                    borderRadius: '10px',
                  }}
                >
                  No items in this column
                </div>
              ) : (
                col.items.map((item, idx) => {
                  const url = typeof item === 'string' ? item : item.url || item.link;
                  const isFav = favorites.includes(url);
                  const isRead = readLater.includes(url);
                  return (
                    <LinkCard
                      key={idx}
                      link={url}
                      theme={theme}
                      viewMode="grid"
                      isFavorite={isFav}
                      isReadLater={isRead}
                      rating={item.rating || 0}
                      review={item.review || ''}
                      watched={item.watched || false}
                      watchCount={item.watchCount || 0}
                      rewatchWorthy={item.rewatchWorthy || false}
                      collectionName={item.collectionName}
                      onToggleFavorite={onToggleFavorite}
                      onToggleReadLater={onToggleReadLater}
                      onToggleWatched={() => onToggleWatched && onToggleWatched(url)}
                      onRate={onRate}
                      onInspect={onInspect}
                      onCopySuccess={onCopySuccess}
                    />
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
