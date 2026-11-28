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

// Maps circular slot index 0..4 to symmetric CSS fan slot classes
// Ring order: 0 (Center) -> 1 (Inner Left) -> 2 (Outer Left) -> 3 (Outer Right) -> 4 (Inner Right) -> 0
const SLOT_CLASS_BY_INDEX = [
  'lc-slot-center',
  'lc-slot-inner-left',
  'lc-slot-outer-left',
  'lc-slot-outer-right',
  'lc-slot-inner-right',
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

function CardArtwork({ item, compact = false }) {
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
}

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

// Unified GPU-composited card: all 5 slots keep invariant 184x194px layout dimensions and animate
// purely via compositor transform/opacity so 3s carousel swaps run cleanly at 60fps without reflows.
const DeckLinkCard = React.memo(function DeckLinkCard({ item, rankNumber, slotIndex, rankMode, palette, isDark }) {
  const isCenter = slotIndex === 0;
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
      className={`lc-slot-card ${SLOT_CLASS_BY_INDEX[slotIndex]}`}
      style={{
        position: 'absolute',
        width: '184px',
        height: '194px',
        borderRadius: '15px',
        background: frameBg,
        border: `2px solid ${trimColor}`,
        padding: '5px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 14px 28px rgba(0, 0, 0, 0.68)'
          : '0 12px 24px rgba(15, 23, 42, 0.16)',
      }}
    >
      <div
        className="lc-foil-sheen"
        aria-hidden="true"
        style={{ opacity: isCenter ? 1 : 0 }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '10px',
          border: `1px solid ${trimColor}`,
          overflow: 'hidden',
          backgroundColor: surfaceBg,
        }}
      >
        {/* Fixed-height upper thumbnail showcase (identical geometry in every slot) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '124px',
            overflow: 'hidden',
            borderBottom: `1.5px solid ${trimColor}`,
          }}
        >
          <CardArtwork item={item} />

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: isDark
                ? 'linear-gradient(180deg, rgba(12,12,18,0.34) 0%, transparent 45%, rgba(16,15,22,0.42) 100%)'
                : 'linear-gradient(180deg, rgba(15,23,42,0.24) 0%, transparent 45%, rgba(15,23,42,0.28) 100%)',
            }}
          />

          {/* Floating Rank / Metric Badges (solid high-contrast pill — zero backdrop-filter stall) */}
          <div
            style={{
              position: 'absolute',
              top: '6px',
              left: '6px',
              right: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '4px',
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: '800',
                padding: '2px 7px',
                borderRadius: '999px',
                backgroundColor: 'rgba(10, 10, 16, 0.86)',
                color: trimColor,
                border: `1px solid ${trimColor}`,
              }}
            >
              {isCenter ? `TOP #${rankNumber}` : `#${rankNumber}`}
            </span>
            {metric ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '9.5px',
                  fontWeight: '700',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(10, 10, 16, 0.86)',
                  color: metric.icon === 'star' ? '#FBBF24' : '#38BDF8',
                }}
              >
                {metric.icon === 'star' ? <Star size={9} fill="currentColor" /> : <Eye size={9} />}
                {metric.text}
              </span>
            ) : (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: '600',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(10, 10, 16, 0.8)',
                  color: '#e2e8f0',
                  maxWidth: '72px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {domain}
              </span>
            )}
          </div>
        </div>

        {/* Lower card title strip smoothly fades out when card enters Center slot behind tag nameplate */}
        <div
          data-card-footer="true"
          style={{
            position: 'absolute',
            top: '124px',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '7px 9px',
            backgroundColor: surfaceBg,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            opacity: isCenter ? 0 : 1,
            transition: 'opacity 0.28s ease',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: '11px',
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
              marginTop: '3px',
              fontSize: '9px',
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

  // Arrange up to 5 real cards into visual slots:
  // Ring index i: 0=Center(#1), 1=InnerLeft(#2), 2=OuterLeft(#4), 3=OuterRight(#5), 4=InnerRight(#3)
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
  const frontCardIndex = (5 - rotationStep) % 5;
  const frontItem = slotItems[frontCardIndex]?.item;

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

        {/* All 5 Uniform Collector Cards Rotating Around the Deck Every 3 Seconds */}
        {slotItems.map((entry, ringIdx) => {
          const slotIndex = (ringIdx + rotationStep) % 5;
          return (
            <DeckLinkCard
              key={`slot-card-${ringIdx}`}
              item={entry.item}
              rankNumber={entry.rankNumber}
              slotIndex={slotIndex}
              rankMode={rankMode}
              palette={palette}
              isDark={isDark}
            />
          );
        })}

        {/* Centered Collector Crest & Compact Tag Nameplate Anchored Over Front Card Lower Section */}
        <div
          className="lc-center-nameplate"
          style={{
            position: 'absolute',
            zIndex: 6,
            width: '170px',
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              height: '58px',
              borderRadius: '0 0 9px 9px',
              borderTop: `1.5px solid ${trimColor}`,
              background: isDark
                ? 'linear-gradient(180deg, #191822 0%, #111017 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #f5f2e9 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '13px 8px 5px 8px',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-17px',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <CrestEmblem trimColor={trimColor} gemColor={palette.gem} />
            </div>

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
        .lc-tag-deck .lc-slot-card,
        .lc-tag-deck .lc-center-nameplate,
        .lc-tag-deck .lc-deck-crest,
        .lc-tag-deck .lc-deck-aura {
          will-change: transform, opacity;
          backface-visibility: hidden;
          transition: transform 0.72s cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* 5-Card Pure GPU Symmetrical Slot Coordinates (Zero Layout Reflow) */
        .lc-tag-deck .lc-slot-center {
          z-index: 4;
          opacity: 1;
          transform: translate3d(0px, -2px, 0) rotate(0deg) scale(1);
        }
        .lc-tag-deck .lc-slot-inner-left {
          z-index: 2;
          opacity: 0.98;
          transform-origin: 50% 88%;
          transform: translate3d(-52px, 6px, 0) rotate(-13deg) scale(0.8);
        }
        .lc-tag-deck .lc-slot-inner-right {
          z-index: 2;
          opacity: 0.98;
          transform-origin: 50% 88%;
          transform: translate3d(52px, 6px, 0) rotate(13deg) scale(0.8);
        }
        .lc-tag-deck .lc-slot-outer-left {
          z-index: 1;
          opacity: 0.9;
          transform-origin: 50% 90%;
          transform: translate3d(-76px, 14px, 0) rotate(-21deg) scale(0.72);
        }
        .lc-tag-deck .lc-slot-outer-right {
          z-index: 0;
          opacity: 0.9;
          transform-origin: 50% 90%;
          transform: translate3d(76px, 14px, 0) rotate(21deg) scale(0.72);
        }
        .lc-tag-deck .lc-center-nameplate {
          transform: translate3d(0px, -2px, 0) scale(1);
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
          transition: transform 0.72s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
        }

        /* Synchronized Hover & Keyboard Focus Fan Spread (Pure GPU Transform) */
        .lc-tag-deck:hover .lc-deck-aura,
        .lc-tag-deck:focus-visible .lc-deck-aura {
          opacity: 0.78;
        }
        .lc-tag-deck:hover .lc-slot-center,
        .lc-tag-deck:focus-visible .lc-slot-center {
          transform: translate3d(0px, -9px, 0) rotate(0deg) scale(1.04);
        }
        .lc-tag-deck:hover .lc-center-nameplate,
        .lc-tag-deck:focus-visible .lc-center-nameplate {
          transform: translate3d(0px, -9px, 0) scale(1.04);
        }
        .lc-tag-deck:hover .lc-slot-inner-left,
        .lc-tag-deck:focus-visible .lc-slot-inner-left {
          transform: translate3d(-66px, -3px, 0) rotate(-17deg) scale(0.84);
        }
        .lc-tag-deck:hover .lc-slot-inner-right,
        .lc-tag-deck:focus-visible .lc-slot-inner-right {
          transform: translate3d(66px, -3px, 0) rotate(17deg) scale(0.84);
        }
        .lc-tag-deck:hover .lc-slot-outer-left,
        .lc-tag-deck:focus-visible .lc-slot-outer-left {
          transform: translate3d(-92px, 6px, 0) rotate(-26deg) scale(0.76);
          opacity: 0.98;
        }
        .lc-tag-deck:hover .lc-slot-outer-right,
        .lc-tag-deck:focus-visible .lc-slot-outer-right {
          transform: translate3d(92px, 6px, 0) rotate(26deg) scale(0.76);
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
