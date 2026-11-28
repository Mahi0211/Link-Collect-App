import React, { useMemo, useState, useEffect } from 'react';
import {
  Tag,
  ChevronRight,
  ArrowLeft,
  Star,
  Eye,
  Search,
  Sparkles,
  X
} from 'lucide-react';
import { themes } from '../utils/themes';
import { getLinkPreviewData, getFaviconUrl, getDomainName, getPageTitle } from '../utils/linkUtils';

const DECK_ACCENT_PALETTES = [
  { rim: '#E6C67A', rimDark: '#B8893A', glow: 'rgba(230, 198, 122, 0.36)', gem: '#818CF8', crestBg: 'rgba(129, 140, 248, 0.18)' },
  { rim: '#A5B4FC', rimDark: '#6366F1', glow: 'rgba(99, 102, 241, 0.36)', gem: '#38BDF8', crestBg: 'rgba(56, 189, 248, 0.18)' },
  { rim: '#FDE68A', rimDark: '#D97706', glow: 'rgba(245, 158, 11, 0.34)', gem: '#F43F5E', crestBg: 'rgba(244, 63, 94, 0.18)' },
  { rim: '#6EE7B7', rimDark: '#059669', glow: 'rgba(16, 185, 129, 0.34)', gem: '#34D399', crestBg: 'rgba(52, 211, 153, 0.18)' },
  { rim: '#FDA4AF', rimDark: '#E11D48', glow: 'rgba(244, 63, 94, 0.34)', gem: '#FB923C', crestBg: 'rgba(251, 146, 60, 0.18)' },
  { rim: '#7DD3FC', rimDark: '#0284C7', glow: 'rgba(56, 189, 248, 0.34)', gem: '#A78BFA', crestBg: 'rgba(167, 139, 250, 0.18)' },
];

// Circular slot mapping behind the solid center showcase card:
// 0 = docked behind center (currently spotlighted in front frame),
// 1 = Inner Left, 2 = Outer Left, 3 = Outer Right, 4 = Inner Right
const WING_SLOT_CLASS = [
  'lc-wing-docked',
  'lc-wing-inner-left',
  'lc-wing-outer-left',
  'lc-wing-outer-right',
  'lc-wing-inner-right',
];

const getDeckPalette = (tag) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DECK_ACCENT_PALETTES[Math.abs(hash) % DECK_ACCENT_PALETTES.length];
};

const getLinkMetricScore = (item, rankMode) => {
  const rating = Number(item.rating || 0);
  const views = Number(item.watchCount || 0);
  if (rankMode === 'viewed') {
    return views * 1000 + rating * 10 + (item.isFavorite ? 5 : 0);
  }
  if (rankMode === 'rated') {
    return rating * 1000 + views * 10 + (item.isFavorite ? 5 : 0);
  }
  return rating * 22 + views * 4 + (item.isFavorite ? 10 : 0) + (item.rewatchWorthy ? 6 : 0);
};

const formatCompactMetric = (item, rankMode) => {
  const rating = Number(item.rating || 0);
  const views = Number(item.watchCount || 0);
  if (rankMode === 'viewed' && views > 0) return { icon: 'eye', text: `${views}` };
  if (rating > 0) return { icon: 'star', text: `${rating.toFixed(rating % 1 === 0 ? 0 : 1)}` };
  if (views > 0) return { icon: 'eye', text: `${views}` };
  return null;
};

const CardArtwork = React.memo(function CardArtwork({ item, compact = false }) {
  const url = item?.url || item?.link || '';
  const preview = useMemo(() => getLinkPreviewData(url, item?.thumbnailUrl), [url, item?.thumbnailUrl]);
  const faviconUrl = useMemo(() => getFaviconUrl(url), [url]);
  const domain = useMemo(() => item?.domain || getDomainName(url), [item?.domain, url]);
  const [src, setSrc] = useState(preview.thumbnailUrl);
  const [failed, setFailed] = useState(!preview.thumbnailUrl);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: preview.gradient,
      }}
    >
      {!failed && src ? (
        <img
          src={src}
          alt={item?.title || domain}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => {
            if (preview.fallbackThumbnailUrl && src !== preview.fallbackThumbnailUrl) {
              setSrc(preview.fallbackThumbnailUrl);
            } else {
              setFailed(true);
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            background: preview.gradient,
            color: '#ffffff',
          }}
        >
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              style={{
                width: compact ? '20px' : '26px',
                height: compact ? '20px' : '26px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: '2px',
              }}
            />
          ) : null}
          <span
            style={{
              fontSize: compact ? '8.5px' : '10px',
              fontWeight: '700',
              letterSpacing: '0.06em',
              opacity: 0.92,
              textTransform: 'uppercase',
            }}
          >
            {domain.slice(0, 14)}
          </span>
        </div>
      )}
    </div>
  );
});

function CrestEmblem({ trimColor, gemColor }) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="lc-deck-crest"
      style={{ display: 'block' }}
    >
      <path
        d="M24 3L29 14L41 11L35 23L43 32L30 33L24 45L18 33L5 32L13 23L7 11L19 14L24 3Z"
        fill="rgba(14, 14, 20, 0.92)"
        stroke={trimColor}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M24 9L27.5 18L36 24L27.5 30L24 39L20.5 30L12 24L20.5 18L24 9Z"
        stroke={trimColor}
        strokeWidth="1.2"
        strokeOpacity="0.7"
      />
      <polygon points="24,18 28.5,24 24,30 19.5,24" fill={gemColor} />
    </svg>
  );
}

// Orbiting fan card with invariant layout dimensions — moves exclusively via GPU translate3d & opacity
const DeckWingCard = React.memo(function DeckWingCard({ item, rankNumber, slotIndex, rankMode, palette, isDark }) {
  const metric = formatCompactMetric(item, rankMode);
  const title = item.title || getPageTitle(item.url || item.link);
  const domain = item.domain || getDomainName(item.url || item.link);
  const trimColor = isDark ? palette.rim : palette.rimDark;
  const frameBg = isDark
    ? 'linear-gradient(175deg, #211f29 0%, #121117 100%)'
    : 'linear-gradient(175deg, #fbfaf6 0%, #efeadd 100%)';
  const surfaceBg = isDark ? '#14131a' : '#ffffff';

  return (
    <div
      data-card-slot={slotIndex}
      data-card-rank={rankNumber}
      className={`lc-wing-card ${WING_SLOT_CLASS[slotIndex]}`}
      style={{
        position: 'absolute',
        width: '132px',
        height: '168px',
        borderRadius: '13px',
        background: frameBg,
        border: `1.5px solid ${trimColor}`,
        padding: '4px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 10px 20px rgba(0, 0, 0, 0.58)'
          : '0 8px 18px rgba(15, 23, 42, 0.14)',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          flex: 1,
          borderRadius: '9px',
          border: `1px solid ${trimColor}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: surfaceBg,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '3px 6px',
            backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(15,23,42,0.04)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}`,
            gap: '4px',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '8.5px',
              fontWeight: '800',
              color: trimColor,
              letterSpacing: '0.02em',
            }}
          >
            #{rankNumber}
          </span>
          {metric ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '8.5px',
                fontWeight: '700',
                color: metric.icon === 'star' ? '#FBBF24' : '#38BDF8',
              }}
            >
              {metric.icon === 'star' ? <Star size={8} fill="currentColor" /> : <Eye size={8} />}
              {metric.text}
            </span>
          ) : (
            <span
              style={{
                fontSize: '8px',
                color: isDark ? '#94a3b8' : '#64748b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {domain}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <CardArtwork item={item} compact />
        </div>

        <div
          style={{
            padding: '5px 6px',
            backgroundColor: surfaceBg,
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: '600',
              lineHeight: '1.22',
              color: isDark ? '#f4f4f5' : '#0f172a',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: '2px',
              fontSize: '8px',
              color: isDark ? '#71717a' : '#94a3b8',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {domain}
          </div>
        </div>
      </div>
    </div>
  );
});

const TagDeckCard = React.memo(function TagDeckCard({ tagEntry, rankIndex, rankMode, activeRotation, onSelectTag, theme }) {
  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';
  const palette = useMemo(() => getDeckPalette(tagEntry.tag), [tagEntry.tag]);
  const trimColor = isDark ? palette.rim : palette.rimDark;

  // Arrange 5 cards around the circular deck:
  // Ring index i: 0=FrontShowcase(#1), 1=InnerLeft(#2), 2=OuterLeft(#4), 3=OuterRight(#5), 4=InnerRight(#3)
  const slotItems = useMemo(() => {
    const src = tagEntry.topLinks;
    const len = src.length;
    if (len === 0) return [];
    const pick = (rankIdx) => {
      const idx = rankIdx % len;
      return { item: src[idx], rankNumber: idx + 1 };
    };
    return [pick(0), pick(1), pick(3), pick(4), pick(2)];
  }, [tagEntry.topLinks]);

  const rotationStep = tagEntry.topLinks.length > 1 ? activeRotation % 5 : 0;
  const frontRingIndex = (5 - rotationStep) % 5;
  const frontEntry = slotItems[frontRingIndex] || slotItems[0];
  const frontItem = frontEntry?.item;
  const frontMetric = frontItem ? formatCompactMetric(frontItem, rankMode) : null;

  return (
    <button
      type="button"
      data-testid={`tag-deck-${tagEntry.tag}`}
      data-tag-name={tagEntry.tag}
      data-tag-count={tagEntry.count}
      data-front-card-step={rotationStep}
      data-front-link-id={frontItem?.id || frontItem?.url || ''}
      onClick={() => onSelectTag(tagEntry.tag)}
      aria-label={`Open #${tagEntry.tag} tag collection (${tagEntry.count} ${tagEntry.count === 1 ? 'link' : 'links'})`}
      className="lc-tag-deck"
      style={{
        background: 'none',
        border: 'none',
        padding: '6px 4px 10px 4px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        outline: 'none',
        borderRadius: '20px',
        '--lc-deck-glow': palette.glow,
      }}
    >
      {/* Fanned 5-Card Stage */}
      <div
        className="lc-deck-stage"
        style={{
          position: 'relative',
          width: '100%',
          height: '206px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        {/* Hover Ambient Glow */}
        <div
          className="lc-deck-aura"
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '190px',
            height: '180px',
            borderRadius: '999px',
            background: palette.glow,
            filter: 'blur(26px)',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Orbiting Wings Moving Smoothly on GPU Behind the Solid Center Card Frame */}
        {slotItems.map((entry, ringIdx) => {
          const slotIndex = (ringIdx + rotationStep) % 5;
          return (
            <DeckWingCard
              key={`wing-card-${ringIdx}`}
              item={entry.item}
              rankNumber={entry.rankNumber}
              slotIndex={slotIndex}
              rankMode={rankMode}
              palette={palette}
              isDark={isDark}
            />
          );
        })}

        {/* Rock-Solid Front Hero Card Frame (Never Splits or Exposes Sharp Corners) */}
        <div
          data-front-showcase="true"
          className="lc-front-card"
          style={{
            position: 'relative',
            zIndex: 4,
            width: '184px',
            height: '194px',
            borderRadius: '15px',
            background: isDark
              ? 'linear-gradient(175deg, #211f29 0%, #121117 100%)'
              : 'linear-gradient(175deg, #fbfaf6 0%, #efeadd 100%)',
            border: `2px solid ${trimColor}`,
            padding: '5px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            boxShadow: isDark
              ? '0 18px 34px rgba(0, 0, 0, 0.72)'
              : '0 14px 28px rgba(15, 23, 42, 0.18)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="lc-foil-sheen" aria-hidden="true" />

          <div
            style={{
              flex: 1,
              borderRadius: '10px',
              border: `1px solid ${trimColor}`,
              backgroundColor: isDark ? '#14131a' : '#ffffff',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Enlarged Front Thumbnail Showcase Window with Crossfading Pre-Decoded Layers */}
            <div
              style={{
                position: 'relative',
                height: '124px',
                overflow: 'hidden',
                borderBottom: `1.5px solid ${trimColor}`,
              }}
            >
              {slotItems.map((entry, ringIdx) => {
                const isActive = ringIdx === frontRingIndex;
                return (
                  <div
                    key={`front-slide-${ringIdx}`}
                    className="lc-front-thumb-slide"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 0, 0) scale(1.06)',
                      zIndex: isActive ? 2 : 1,
                      pointerEvents: 'none',
                    }}
                  >
                    <CardArtwork item={entry.item} />
                  </div>
                );
              })}

              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 3,
                  background: isDark
                    ? 'linear-gradient(180deg, rgba(12,12,18,0.34) 0%, transparent 45%, rgba(16,15,22,0.42) 100%)'
                    : 'linear-gradient(180deg, rgba(15,23,42,0.24) 0%, transparent 45%, rgba(15,23,42,0.28) 100%)',
                }}
              />

              {/* Front Top Micro Badges (no link title overlay) */}
              <div
                style={{
                  position: 'absolute',
                  top: '5px',
                  left: '6px',
                  right: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '4px',
                  zIndex: 4,
                }}
              >
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: '800',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(10, 10, 16, 0.86)',
                    color: trimColor,
                    border: `1px solid ${trimColor}`,
                  }}
                >
                  TOP #{frontEntry?.rankNumber || 1}
                </span>
                {frontMetric && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '9px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(10, 10, 16, 0.86)',
                      color: frontMetric.icon === 'star' ? '#FBBF24' : '#38BDF8',
                    }}
                  >
                    {frontMetric.icon === 'star' ? <Star size={9} fill="currentColor" /> : <Eye size={9} />}
                    {frontMetric.text}
                  </span>
                )}
              </div>
            </div>

            {/* Central Bridging Crest Medallion */}
            <div
              style={{
                position: 'relative',
                height: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
              }}
            >
              <CrestEmblem trimColor={trimColor} gemColor={palette.gem} />
            </div>

            {/* Compact Sculpted Tag Nameplate */}
            <div
              style={{
                flex: 1,
                padding: '15px 8px 6px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: isDark
                  ? 'linear-gradient(180deg, #191822 0%, #111017 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #f5f2e9 100%)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  fontSize: '13px',
                  fontWeight: '800',
                  fontFamily: 'var(--font-heading)',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  letterSpacing: '-0.015em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.15',
                }}
              >
                #{tagEntry.tag}
              </div>
              <div
                style={{
                  marginTop: '2px',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: isDark ? palette.rim : palette.rimDark,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  lineHeight: '1.1',
                }}
              >
                {tagEntry.count} {tagEntry.count === 1 ? 'Link' : 'Links'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Single-Line Meta Under Deck */}
      <div
        style={{
          marginTop: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          flexWrap: 'wrap',
          fontSize: '11px',
          color: colors.textSecondary,
        }}
      >
        <span style={{ fontWeight: '700', color: colors.text }}>
          #{rankIndex + 1} Popular
        </span>
        {tagEntry.totalViews > 0 && (
          <>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Eye size={11} />
              {tagEntry.totalViews}
            </span>
          </>
        )}
        {tagEntry.maxRating > 0 && (
          <>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: colors.rating }}>
              <Star size={11} fill="currentColor" />
              {tagEntry.maxRating}
            </span>
          </>
        )}
      </div>
    </button>
  );
});

export function TagsPage({ links = [], onSelectTag, onBack, theme = 'dark' }) {
  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  const [tagFilter, setTagFilter] = useState('');
  const [rankMode, setRankMode] = useState('combined'); // 'combined' | 'viewed' | 'rated'
  const [rotationTick, setRotationTick] = useState(0);

  // Rotate deck cards smoothly every 3 seconds unless user prefers reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setRotationTick((prev) => prev + 1);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  // Group non-archived links by tag, sort tags descending by link count, and select top 5 links per tag
  const rankedTags = useMemo(() => {
    const tagMap = new Map();

    (links || []).forEach((item) => {
      if (item.isArchived) return;
      const tags = Array.isArray(item.customTags) ? item.customTags : [];
      tags.forEach((rawTag) => {
        const tag = String(rawTag || '').trim();
        if (!tag) return;
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag).push(item);
      });
    });

    const entries = Array.from(tagMap.entries()).map(([tag, tagLinks]) => {
      const sortedLinks = [...tagLinks].sort((a, b) => {
        const diff = getLinkMetricScore(b, rankMode) - getLinkMetricScore(a, rankMode);
        if (diff !== 0) return diff;
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return (b.id || 0) - (a.id || 0);
      });

      const totalViews = tagLinks.reduce((sum, l) => sum + Number(l.watchCount || 0), 0);
      const maxRating = tagLinks.reduce((max, l) => Math.max(max, Number(l.rating || 0)), 0);

      return {
        tag,
        count: tagLinks.length,
        topLinks: sortedLinks.slice(0, 5),
        totalViews,
        maxRating,
      };
    });

    // Always order tags with highest links first
    entries.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const engagementDiff = (b.totalViews + b.maxRating * 5) - (a.totalViews + a.maxRating * 5);
      if (engagementDiff !== 0) return engagementDiff;
      return a.tag.localeCompare(b.tag);
    });

    return entries;
  }, [links, rankMode]);

  const visibleTags = useMemo(() => {
    const q = tagFilter.trim().toLowerCase();
    if (!q) return rankedTags;
    return rankedTags.filter((entry) => entry.tag.toLowerCase().includes(q));
  }, [rankedTags, tagFilter]);

  return (
    <div
      data-testid="tags-page"
      style={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '24px 32px 64px 32px',
        backgroundColor: colors.bg,
        boxSizing: 'border-box',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <style>{`
        .lc-tag-deck {
          contain: layout style;
        }
        .lc-tag-deck .lc-wing-card,
        .lc-tag-deck .lc-front-card,
        .lc-tag-deck .lc-deck-crest,
        .lc-tag-deck .lc-deck-aura {
          will-change: transform, opacity;
          backface-visibility: hidden;
          transition: transform 0.72s cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 0.52s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lc-tag-deck .lc-front-thumb-slide {
          will-change: transform, opacity;
          backface-visibility: hidden;
          transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* 5-Card Pure GPU Symmetrical Orbit Behind Center Hero Frame */
        .lc-tag-deck .lc-front-card {
          transform: translate3d(0px, -2px, 0) scale(1);
        }
        .lc-tag-deck .lc-wing-docked {
          z-index: 2;
          opacity: 0;
          transform: translate3d(0px, 0px, 0) rotate(0deg) scale(0.86);
        }
        .lc-tag-deck .lc-wing-inner-left {
          z-index: 2;
          opacity: 0.98;
          transform-origin: 50% 88%;
          transform: translate3d(-54px, 5px, 0) rotate(-13deg) scale(0.95);
        }
        .lc-tag-deck .lc-wing-inner-right {
          z-index: 2;
          opacity: 0.98;
          transform-origin: 50% 88%;
          transform: translate3d(54px, 5px, 0) rotate(13deg) scale(0.95);
        }
        .lc-tag-deck .lc-wing-outer-left {
          z-index: 1;
          opacity: 0.92;
          transform-origin: 50% 90%;
          transform: translate3d(-76px, 14px, 0) rotate(-21deg) scale(0.88);
        }
        .lc-tag-deck .lc-wing-outer-right {
          z-index: 0;
          opacity: 0.92;
          transform-origin: 50% 90%;
          transform: translate3d(76px, 14px, 0) rotate(21deg) scale(0.88);
        }

        /* Clipped Metallic Foil Sheen */
        .lc-tag-deck .lc-foil-sheen {
          position: absolute;
          inset: -40%;
          background: linear-gradient(
            115deg,
            transparent 35%,
            rgba(255, 255, 255, 0.22) 48%,
            transparent 60%
          );
          transform: translate3d(-110%, 0, 0) rotate(14deg);
          pointer-events: none;
          z-index: 6;
          transition: transform 0.72s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Synchronized Hover & Keyboard Focus Fan Spread (Pure GPU Transform) */
        .lc-tag-deck:hover .lc-deck-aura,
        .lc-tag-deck:focus-visible .lc-deck-aura {
          opacity: 0.78;
        }
        .lc-tag-deck:hover .lc-front-card,
        .lc-tag-deck:focus-visible .lc-front-card {
          transform: translate3d(0px, -9px, 0) scale(1.04);
        }
        .lc-tag-deck:hover .lc-wing-inner-left,
        .lc-tag-deck:focus-visible .lc-wing-inner-left {
          transform: translate3d(-66px, -4px, 0) rotate(-17deg) scale(0.99);
        }
        .lc-tag-deck:hover .lc-wing-inner-right,
        .lc-tag-deck:focus-visible .lc-wing-inner-right {
          transform: translate3d(66px, -4px, 0) rotate(17deg) scale(0.99);
        }
        .lc-tag-deck:hover .lc-wing-outer-left,
        .lc-tag-deck:focus-visible .lc-wing-outer-left {
          transform: translate3d(-92px, 6px, 0) rotate(-26deg) scale(0.93);
          opacity: 0.98;
        }
        .lc-tag-deck:hover .lc-wing-outer-right,
        .lc-tag-deck:focus-visible .lc-wing-outer-right {
          transform: translate3d(92px, 6px, 0) rotate(26deg) scale(0.93);
          opacity: 0.98;
        }
        .lc-tag-deck:hover .lc-deck-crest,
        .lc-tag-deck:focus-visible .lc-deck-crest {
          transform: scale(1.1);
        }
        .lc-tag-deck:hover .lc-foil-sheen,
        .lc-tag-deck:focus-visible .lc-foil-sheen {
          transform: translate3d(115%, 0, 0) rotate(14deg);
        }
        .lc-tag-deck:focus-visible {
          box-shadow: 0 0 0 2px ${colors.accent};
        }
      `}</style>

      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                color: colors.textSecondary,
                marginBottom: '6px',
              }}
            >
              <button
                type="button"
                onClick={onBack}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: colors.textSecondary,
                  cursor: 'pointer',
                  fontSize: 'inherit',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = colors.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = colors.textSecondary)}
              >
                Workspace
              </button>
              <ChevronRight size={13} />
              <span style={{ color: colors.text, fontWeight: '500' }}>Tags</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '26px',
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--font-heading)',
                  color: colors.text,
                }}
              >
                Tag Decks
              </h1>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  backgroundColor: colors.accentLight,
                  color: colors.accent,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {rankedTags.length} {rankedTags.length === 1 ? 'Tag' : 'Tags'} · Ordered by Highest Links
              </span>
            </div>
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: colors.textSecondary }}>
              Each deck rotates through 5 top viewed or top rated bookmarks every 3 seconds. Click any tag deck to open its full link collection.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 14px',
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.cardBg,
              color: colors.text,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Bookmarks</span>
          </button>
        </div>

        {/* Filter & Top-Card Ranking Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px',
            padding: '12px 14px',
            borderRadius: '14px',
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: '1 1 240px',
              maxWidth: '340px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '11px',
                color: colors.textTertiary,
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder="Filter tag decks..."
              aria-label="Filter tag decks"
              style={{
                width: '100%',
                padding: '7px 30px 7px 32px',
                borderRadius: '9px',
                border: `1px solid ${colors.border}`,
                backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                color: colors.text,
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
            {tagFilter && (
              <button
                type="button"
                onClick={() => setTagFilter('')}
                aria-label="Clear tag filter"
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: colors.textTertiary,
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '2px',
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: colors.textTertiary }}>
              Preview Top 5 Cards By:
            </span>
            <div
              role="group"
              aria-label="Top card preview ranking"
              style={{
                display: 'inline-flex',
                padding: '3px',
                borderRadius: '10px',
                backgroundColor: isDark ? colors.bgTertiary : '#f1f5f9',
                border: `1px solid ${colors.border}`,
                gap: '3px',
              }}
            >
              {[
                { id: 'combined', label: 'Top Pick', icon: Sparkles },
                { id: 'viewed', label: 'Most Viewed', icon: Eye },
                { id: 'rated', label: 'Top Rated', icon: Star },
              ].map((opt) => {
                const OptIcon = opt.icon;
                const active = rankMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRankMode(opt.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: '7px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11.5px',
                      fontWeight: active ? '600' : '500',
                      backgroundColor: active ? (isDark ? colors.cardBg : '#ffffff') : 'transparent',
                      color: active ? colors.accent : colors.textSecondary,
                      boxShadow: active ? colors.shadowSm : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <OptIcon size={12} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tag Decks Grid */}
        {visibleTags.length > 0 ? (
          <div
            data-testid="tags-deck-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '24px 28px',
              paddingBottom: '20px',
            }}
          >
            {visibleTags.map((entry, idx) => (
              <TagDeckCard
                key={entry.tag}
                tagEntry={entry}
                rankIndex={idx}
                rankMode={rankMode}
                activeRotation={entry.topLinks.length > 1 ? rotationTick : 0}
                onSelectTag={onSelectTag}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '52px 24px',
              borderRadius: '18px',
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                backgroundColor: colors.accentLight,
                color: colors.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Tag size={22} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: colors.text }}>
              {tagFilter ? `No tags matching "${tagFilter}"` : 'No tags created yet'}
            </div>
            <div style={{ fontSize: '13px', color: colors.textSecondary, maxWidth: '400px' }}>
              {tagFilter
                ? 'Try clearing your filter query or add new tags to bookmarks.'
                : 'Add tags to your saved bookmarks to see collector-style Tag Decks ordered by link count.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
