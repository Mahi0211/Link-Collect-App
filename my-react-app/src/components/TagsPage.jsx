import React, { useMemo, useState } from 'react';
import {
  Tag,
  ChevronRight,
  ArrowLeft,
  Star,
  Eye,
  Search,
  Sparkles,
  ExternalLink,
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

function CardArtwork({ item, accentGradient, compact = false }) {
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
        background: preview.gradient || accentGradient,
      }}
    >
      {!failed && src ? (
        <img
          src={src}
          alt={item?.title || domain}
          loading="lazy"
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
                width: compact ? '20px' : '24px',
                height: compact ? '20px' : '24px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: '2px',
              }}
            />
          ) : null}
          <span
            style={{
              fontSize: compact ? '9px' : '10px',
              fontWeight: '700',
              letterSpacing: '0.06em',
              opacity: 0.9,
              textTransform: 'uppercase',
            }}
          >
            {domain.slice(0, 12)}
          </span>
        </div>
      )}
    </div>
  );
}

function OrnateCardBack({ palette, isDark, className, style }) {
  const surfaceBg = isDark
    ? 'linear-gradient(160deg, #1b1a22 0%, #101015 100%)'
    : 'linear-gradient(160deg, #f3f0e8 0%, #e5dfd0 100%)';
  const trimColor = isDark ? palette.rim : palette.rimDark;

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: 'absolute',
        borderRadius: '13px',
        background: surfaceBg,
        border: `1.5px solid ${trimColor}`,
        boxShadow: isDark
          ? '0 10px 22px rgba(0, 0, 0, 0.55)'
          : '0 8px 18px rgba(15, 23, 42, 0.14)',
        padding: '5px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '9px',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'}`,
          background: isDark
            ? 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.06), transparent 72%)'
            : 'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.04), transparent 72%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            transform: 'rotate(45deg)',
            border: `1.5px solid ${trimColor}`,
            opacity: 0.45,
          }}
        />
      </div>
    </div>
  );
}

function SidePreviewCard({ item, rankNumber, rankMode, palette, isDark, className }) {
  if (!item) {
    return (
      <OrnateCardBack
        palette={palette}
        isDark={isDark}
        className={className}
        style={{ width: '124px', height: '180px' }}
      />
    );
  }

  const metric = formatCompactMetric(item, rankMode);
  const title = item.title || getPageTitle(item.url || item.link);
  const domain = item.domain || getDomainName(item.url || item.link);
  const trimColor = isDark ? palette.rim : palette.rimDark;
  const frameBg = isDark ? '#17161e' : '#faf8f2';
  const textBg = isDark ? '#131219' : '#ffffff';

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        width: '124px',
        height: '180px',
        borderRadius: '13px',
        background: frameBg,
        border: `1.5px solid ${trimColor}`,
        padding: '4px',
        boxSizing: 'border-box',
        boxShadow: isDark
          ? '0 12px 26px rgba(0, 0, 0, 0.65)'
          : '0 10px 22px rgba(15, 23, 42, 0.16)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          borderRadius: '9px',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)'}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: textBg,
        }}
      >
        {/* Card Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 6px',
            backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(15,23,42,0.04)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}`,
            gap: '4px',
          }}
        >
          <span
            style={{
              fontSize: '9px',
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
                fontSize: '9px',
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
                fontSize: '8.5px',
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

        {/* Artwork Thumbnail */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <CardArtwork item={item} compact />
        </div>

        {/* Lower Card Title Strip */}
        <div
          style={{
            padding: '6px 7px',
            backgroundColor: textBg,
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: '600',
              lineHeight: '1.25',
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
              fontSize: '8.5px',
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
}

function CrestEmblem({ trimColor, gemColor }) {
  return (
    <svg
      width="42"
      height="42"
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

function TagDeckCard({ tagEntry, rankIndex, rankMode, onSelectTag, theme }) {
  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';
  const palette = useMemo(() => getDeckPalette(tagEntry.tag), [tagEntry.tag]);
  const trimColor = isDark ? palette.rim : palette.rimDark;

  const [topOne, topTwo, topThree] = tagEntry.topLinks;
  const topOneMetric = topOne ? formatCompactMetric(topOne, rankMode) : null;
  const topOneTitle = topOne ? (topOne.title || getPageTitle(topOne.url || topOne.link)) : tagEntry.tag;

  return (
    <button
      type="button"
      data-testid={`tag-deck-${tagEntry.tag}`}
      data-tag-name={tagEntry.tag}
      data-tag-count={tagEntry.count}
      onClick={() => onSelectTag(tagEntry.tag)}
      aria-label={`Open #${tagEntry.tag} tag collection (${tagEntry.count} ${tagEntry.count === 1 ? 'link' : 'links'})`}
      className="lc-tag-deck"
      style={{
        background: 'none',
        border: 'none',
        padding: '8px 6px 14px 6px',
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
      {/* Fanned Cards Stage */}
      <div
        className="lc-deck-stage"
        style={{
          position: 'relative',
          width: '100%',
          height: '248px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        {/* Outer Ambient Glow */}
        <div
          className="lc-deck-aura"
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '170px',
            height: '190px',
            borderRadius: '999px',
            background: palette.glow,
            filter: 'blur(28px)',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Outermost Card-Back Wings (matching reference deck frame) */}
        <OrnateCardBack
          palette={palette}
          isDark={isDark}
          className="lc-card-wing-left"
          style={{ width: '112px', height: '166px', zIndex: 1 }}
        />
        <OrnateCardBack
          palette={palette}
          isDark={isDark}
          className="lc-card-wing-right"
          style={{ width: '112px', height: '166px', zIndex: 1 }}
        />

        {/* #2 Top Card (Left) & #3 Top Card (Right) */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <SidePreviewCard
            item={topTwo}
            rankNumber={2}
            rankMode={rankMode}
            palette={palette}
            isDark={isDark}
            className="lc-card-left"
          />
          <SidePreviewCard
            item={topThree}
            rankNumber={3}
            rankMode={rankMode}
            palette={palette}
            isDark={isDark}
            className="lc-card-right"
          />
        </div>

        {/* Center Hero Collector Card (#1 Card Showcase + Tag Crest Cover) */}
        <div
          className="lc-card-center"
          style={{
            position: 'relative',
            zIndex: 4,
            width: '162px',
            height: '224px',
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
          {/* Foil Shimmer Overlay */}
          <div className="lc-foil-sheen" aria-hidden="true" />

          {/* Inner Ornate Card Frame */}
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
            {/* Top #1 Card Showcase Artwork Window */}
            <div
              style={{
                position: 'relative',
                height: '94px',
                overflow: 'hidden',
                borderBottom: `1.5px solid ${trimColor}`,
              }}
            >
              {topOne ? (
                <CardArtwork item={topOne} />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: colors.bgTertiary }} />
              )}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: isDark
                    ? 'linear-gradient(180deg, rgba(12,12,18,0.45) 0%, rgba(12,12,18,0.15) 45%, rgba(16,15,22,0.88) 100%)'
                    : 'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.08) 45%, rgba(15,23,42,0.78) 100%)',
                }}
              />

              {/* Top #1 Micro Badges */}
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
                }}
              >
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(10, 10, 16, 0.78)',
                    color: trimColor,
                    border: `1px solid ${trimColor}`,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  TOP #1
                </span>
                {topOneMetric && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '9px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(10, 10, 16, 0.78)',
                      color: topOneMetric.icon === 'star' ? '#FBBF24' : '#38BDF8',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {topOneMetric.icon === 'star' ? <Star size={9} fill="currentColor" /> : <Eye size={9} />}
                    {topOneMetric.text}
                  </span>
                )}
              </div>

              {/* Top #1 Title Caption inside Window */}
              <div
                style={{
                  position: 'absolute',
                  left: '7px',
                  right: '7px',
                  bottom: '22px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#ffffff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 3px rgba(0,0,0,0.85)',
                }}
              >
                {topOneTitle}
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
                zIndex: 3,
              }}
            >
              <CrestEmblem trimColor={trimColor} gemColor={palette.gem} />
            </div>

            {/* Sculpted Tag Nameplate Body */}
            <div
              style={{
                flex: 1,
                padding: '22px 8px 8px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'center',
                background: isDark
                  ? 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)'
                  : 'radial-gradient(circle at 50% 0%, rgba(79,70,229,0.05) 0%, transparent 70%)',
              }}
            >
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    fontFamily: 'var(--font-heading)',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    letterSpacing: '-0.015em',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'break-word',
                    lineHeight: '1.15',
                  }}
                >
                  #{tagEntry.tag}
                </div>
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '10.5px',
                    fontWeight: '700',
                    color: isDark ? palette.rim : palette.rimDark,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  {tagEntry.count} {tagEntry.count === 1 ? 'Link' : 'Links'}
                </div>
              </div>

              {/* Hover Action Pill */}
              <div
                className="lc-deck-open-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 9px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: '700',
                  backgroundColor: isDark ? palette.crestBg : colors.accentLight,
                  color: isDark ? '#F8FAFC' : colors.accent,
                  border: `1px solid ${trimColor}`,
                }}
              >
                <span>Open Deck</span>
                <ExternalLink size={9} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Deck Rank & Top Cards Summary Under Stage */}
      <div
        style={{
          marginTop: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          fontSize: '11.5px',
          color: colors.textSecondary,
        }}
      >
        <span
          style={{
            fontWeight: '700',
            color: colors.text,
          }}
        >
          #{rankIndex + 1} Popular
        </span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>
          {tagEntry.topLinks.length} top {tagEntry.topLinks.length === 1 ? 'card' : 'cards'}
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
}

export function TagsPage({ links = [], onSelectTag, onBack, theme = 'dark' }) {
  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  const [tagFilter, setTagFilter] = useState('');
  const [rankMode, setRankMode] = useState('combined'); // 'combined' | 'viewed' | 'rated'

  // Group non-archived links by tag, sort tags descending by link count, and select top 3 links per tag
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
        topLinks: sortedLinks.slice(0, 3),
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
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lc-tag-deck .lc-card-center,
        .lc-tag-deck .lc-card-left,
        .lc-tag-deck .lc-card-right,
        .lc-tag-deck .lc-card-wing-left,
        .lc-tag-deck .lc-card-wing-right,
        .lc-tag-deck .lc-deck-crest,
        .lc-tag-deck .lc-deck-aura,
        .lc-tag-deck .lc-deck-open-pill {
          transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 0.28s ease,
                      box-shadow 0.35s ease;
        }
        .lc-tag-deck .lc-card-left {
          transform: translate(-44px, 8px) rotate(-13deg);
          transform-origin: 50% 88%;
        }
        .lc-tag-deck .lc-card-right {
          transform: translate(44px, 8px) rotate(13deg);
          transform-origin: 50% 88%;
        }
        .lc-tag-deck .lc-card-wing-left {
          transform: translate(-54px, 16px) rotate(-21deg) scale(0.92);
          transform-origin: 50% 90%;
          opacity: 0.72;
        }
        .lc-tag-deck .lc-card-wing-right {
          transform: translate(54px, 16px) rotate(21deg) scale(0.92);
          transform-origin: 50% 90%;
          opacity: 0.72;
        }
        .lc-tag-deck .lc-deck-open-pill {
          opacity: 0.78;
          transform: translateY(2px);
        }
        .lc-tag-deck .lc-foil-sheen {
          position: absolute;
          inset: -40%;
          background: linear-gradient(
            115deg,
            transparent 35%,
            rgba(255, 255, 255, 0.22) 48%,
            transparent 60%
          );
          transform: translateX(-110%) rotate(14deg);
          pointer-events: none;
          z-index: 6;
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Hover & Keyboard Focus Fan Animation */
        .lc-tag-deck:hover .lc-deck-aura,
        .lc-tag-deck:focus-visible .lc-deck-aura {
          opacity: 0.72;
        }
        .lc-tag-deck:hover .lc-card-center,
        .lc-tag-deck:focus-visible .lc-card-center {
          transform: translateY(-10px) scale(1.04);
          box-shadow: 0 22px 42px var(--lc-deck-glow), 0 12px 24px rgba(0, 0, 0, 0.45);
        }
        .lc-tag-deck:hover .lc-card-left,
        .lc-tag-deck:focus-visible .lc-card-left {
          transform: translate(-64px, -6px) rotate(-20deg) scale(1.03);
        }
        .lc-tag-deck:hover .lc-card-right,
        .lc-tag-deck:focus-visible .lc-card-right {
          transform: translate(64px, -6px) rotate(20deg) scale(1.03);
        }
        .lc-tag-deck:hover .lc-card-wing-left,
        .lc-tag-deck:focus-visible .lc-card-wing-left {
          transform: translate(-76px, 8px) rotate(-29deg) scale(0.95);
          opacity: 0.94;
        }
        .lc-tag-deck:hover .lc-card-wing-right,
        .lc-tag-deck:focus-visible .lc-card-wing-right {
          transform: translate(76px, 8px) rotate(29deg) scale(0.95);
          opacity: 0.94;
        }
        .lc-tag-deck:hover .lc-deck-crest,
        .lc-tag-deck:focus-visible .lc-deck-crest {
          transform: scale(1.12);
        }
        .lc-tag-deck:hover .lc-deck-open-pill,
        .lc-tag-deck:focus-visible .lc-deck-open-pill {
          opacity: 1;
          transform: translateY(0);
        }
        .lc-tag-deck:hover .lc-foil-sheen,
        .lc-tag-deck:focus-visible .lc-foil-sheen {
          transform: translateX(115%) rotate(14deg);
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
            marginBottom: '22px',
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
              Each deck showcases up to 3 top viewed or top rated bookmarks. Click any tag deck to open its full link collection.
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
            marginBottom: '26px',
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
              Preview Top 3 Cards By:
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '28px 24px',
              paddingBottom: '20px',
            }}
          >
            {visibleTags.map((entry, idx) => (
              <TagDeckCard
                key={entry.tag}
                tagEntry={entry}
                rankIndex={idx}
                rankMode={rankMode}
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
