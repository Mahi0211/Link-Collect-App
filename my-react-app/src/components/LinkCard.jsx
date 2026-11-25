import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  Heart,
  Clock,
  Copy,
  Check,
  Tag as TagIcon,
  BookOpen,
  Star,
  CheckCircle,
  Flame,
  MessageSquare,
  QrCode,
  Square,
  CheckSquare,
  Activity,
  AlertTriangle,
  Globe,
  Lock,
  BookmarkPlus
} from 'lucide-react';
import { themes } from '../utils/themes';
import {
  getFaviconUrl,
  getDomainName,
  getPageTitle,
  getEstimatedReadingTime,
  getLinkPreviewData,
  isYouTubeUrl,
  resolveLinkThumbnail
} from '../utils/linkUtils';
import { api } from '../utils/api';
import { StarRating } from './StarRating';

export const LinkCard = ({
  id,
  link,
  thumbnailUrl: savedThumbnailUrl,
  onBackfillThumbnail,
  theme = 'dark',
  viewMode = 'grid',
  isFavorite = false,
  isReadLater = false,
  rating = 0,
  review = '',
  watched = false,
  watchCount = 0,
  rewatchWorthy = false,
  customTitle,
  customTags = [],
  notes = '',
  collectionName = '',
  isPublic = false,
  onTogglePublic,
  isReadOnly = false,
  onSaveToMyCollection,
  isSelected = false,
  onToggleSelect,
  onShowQr,
  linkStatus,
  onToggleFavorite,
  onToggleReadLater,
  onToggleWatched,
  onRate,
  onInspect,
  onCopySuccess,
  onSelectTag
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);

  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  const url = typeof link === 'string' ? link : link.url || '';
  const [resolvedThumbnail, setResolvedThumbnail] = useState(savedThumbnailUrl ?? null);

  useEffect(() => {
    setResolvedThumbnail(savedThumbnailUrl ?? null);
  }, [savedThumbnailUrl, url]);

  // Lazily fetch & backfill OpenGraph thumbnail once for legacy saved links missing thumbnailUrl
  useEffect(() => {
    if (resolvedThumbnail !== null && resolvedThumbnail !== undefined) return;
    if (!id || isReadOnly || !url || isYouTubeUrl(url)) return;
    if (!/^https?:\/\//i.test(url)) return;

    let isMounted = true;
    resolveLinkThumbnail(url, (u) => api.scrapeMetadata(u)).then((result) => {
      if (!isMounted || result === null) return;
      setResolvedThumbnail(result);
      if (onBackfillThumbnail) {
        onBackfillThumbnail(id, result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [id, url, isReadOnly, resolvedThumbnail, onBackfillThumbnail]);

  const domain = getDomainName(url);
  const title = customTitle || getPageTitle(url);
  const faviconUrl = getFaviconUrl(url);
  const readingTime = getEstimatedReadingTime(url);
  const preview = getLinkPreviewData(url, resolvedThumbnail);

  const [imgSrc, setImgSrc] = useState(preview.thumbnailUrl);
  const imgRef = useRef(null);
  const prevThumbnailUrlRef = useRef(preview.thumbnailUrl);

  useEffect(() => {
    if (prevThumbnailUrlRef.current !== preview.thumbnailUrl) {
      prevThumbnailUrlRef.current = preview.thumbnailUrl;
      setImgSrc(preview.thumbnailUrl);
      setThumbnailError(false);
      setThumbnailLoaded(false);
    }
  }, [preview.thumbnailUrl]);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      setThumbnailLoaded(true);
    }
  }, [imgSrc]);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    if (onCopySuccess) onCopySuccess(url);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(url);
  };

  const handleReadLaterClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleReadLater) onToggleReadLater(url);
  };

  const handleWatchedClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWatched) onToggleWatched(url);
  };

  const handleStarRate = (newRating) => {
    if (onRate) onRate(url, newRating);
  };

  // Pass all data when inspecting
  const itemPayload = {
    id,
    url,
    title,
    domain,
    thumbnailUrl: resolvedThumbnail,
    isFavorite,
    isReadLater,
    rating,
    review,
    watched,
    watchCount,
    rewatchWorthy,
    notes,
    customTags,
    collectionName
  };

  // ==========================================
  // COMPACT LIST VIEW
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div
        onClick={() => !isReadOnly && onInspect && onInspect(itemPayload)}
        className="list-card-container"
        style={{
          backgroundColor: isDark ? colors.cardBg : '#ffffff',
          border: `1px solid ${colors.border}`,
          cursor: isReadOnly ? 'default' : 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? colors.cardHover : '#f8fafc';
          e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? colors.cardBg : '#ffffff';
          e.currentTarget.style.borderColor = colors.border;
        }}
      >
        {/* Top/Main Section on Mobile, Left on Desktop */}
        <div className="list-card-left">
          {/* Multi-select Checkbox */}
          {!isReadOnly && onToggleSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: isSelected ? colors.accent : colors.textTertiary,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}
              title={isSelected ? 'Deselect link' : 'Select link'}
            >
              {isSelected ? <CheckSquare size={17} /> : <Square size={17} />}
            </button>
          )}

          {/* Favicon */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: isDark ? '#272730' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              border: `1px solid ${colors.borderLight}`,
            }}
          >
            {faviconUrl && !imageError ? (
              <img
                src={faviconUrl}
                alt=""
                style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                onError={() => setImageError(true)}
              />
            ) : (
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: colors.accent }}>
                {domain.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Title & Domain */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: 0, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: '500',
                  color: colors.text,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {title}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: colors.textTertiary,
                  fontFamily: 'var(--font-mono)',
                  flexShrink: 0,
                }}
              >
                {domain}
              </span>
            </div>
          </div>

          {/* Mobile-only Top Action Buttons */}
          {!isReadOnly && (
            <div className="list-card-mobile-top-actions" style={{ display: 'none', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <button
                onClick={handleFavoriteClick}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  color: isFavorite ? colors.favorite : colors.textTertiary,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
              >
                <Heart size={16} fill={isFavorite ? colors.favorite : 'none'} />
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleWatched && !watched) onToggleWatched(url);
                }}
                style={{
                  color: colors.textTertiary,
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
                title="Open in new tab"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          )}
        </div>

        {/* Bottom Section on Mobile, Middle & Right on Desktop */}
        <div className="list-card-meta-row">
          {/* Rating & Status Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Star Rating - only for personal links */}
            {!isReadOnly && (
              <div onClick={(e) => e.stopPropagation()}>
                <StarRating
                  rating={rating}
                  onRate={handleStarRate}
                  size={13}
                  showScore={rating > 0}
                  theme={theme}
                />
              </div>
            )}

            {/* Rewatch Worthy Flame Badge */}
            {!isReadOnly && rewatchWorthy && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: colors.rewatchLight,
                  color: colors.rewatch,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
                className="animate-flame-pulse"
                title="Rewatch Worthy!"
              >
                <Flame size={12} />
                <span>Rewatch</span>
              </span>
            )}

            {/* Watched Badge */}
            {!isReadOnly && watched && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: colors.watchedLight,
                  color: colors.watched,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
                title={`Watched ${watchCount} time(s)`}
              >
                <CheckCircle size={12} />
                <span>{watchCount > 1 ? `${watchCount}x` : 'Watched'}</span>
              </span>
            )}

            {/* Collection Badge */}
            {collectionName && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: isDark ? '#1f1f26' : '#f1f5f9',
                  color: colors.textSecondary,
                  fontWeight: '500',
                }}
              >
                {collectionName}
              </span>
            )}

            {/* Visibility Chip in List View */}
            {!isReadOnly && onTogglePublic ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePublic();
                }}
                style={{
                  padding: '2px 7px',
                  borderRadius: '5px',
                  backgroundColor: isPublic ? 'rgba(16, 185, 129, 0.15)' : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'),
                  color: isPublic ? '#10b981' : colors.textTertiary,
                  fontSize: '10.5px',
                  fontWeight: '600',
                  border: isPublic ? '1px solid rgba(16, 185, 129, 0.35)' : `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
                title={isPublic ? 'Public: Visible to approved friends (Click to toggle)' : 'Private: Only visible to you (Click to toggle)'}
              >
                {isPublic ? <Globe size={10} /> : <Lock size={10} />}
                <span>{isPublic ? 'Public' : 'Private'}</span>
              </button>
            ) : isPublic ? (
              <span
                style={{
                  padding: '2px 7px',
                  borderRadius: '5px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontSize: '10.5px',
                  fontWeight: '600',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Globe size={10} />
                <span>Public</span>
              </span>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="list-card-actions">
            {isReadOnly ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {onSaveToMyCollection && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveToMyCollection(itemPayload);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 11px',
                      borderRadius: '6px',
                      backgroundColor: colors.accentLight,
                      color: colors.accent,
                      border: `1px solid ${colors.borderActive}35`,
                      fontSize: '11.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                    title="Save to My Collection"
                  >
                    <BookmarkPlus size={13} />
                    <span>Save to My Collection</span>
                  </button>
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #6661f1 0%, #793fed 100%)',
                    boxShadow: '0 2px 8px rgba(102, 97, 241, 0.35)',
                  }}
                  title="Open in new window"
                >
                  <span>Visit</span>
                  <ExternalLink size={12} strokeWidth={2.2} />
                </a>
              </div>
            ) : (
              <>
                {/* Watched Quick Toggle */}
                <button
                  onClick={handleWatchedClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    color: watched ? colors.watched : colors.textTertiary,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={watched ? 'Mark as Unwatched' : 'Mark as Watched'}
                >
                  <CheckCircle size={15} />
                </button>

                {/* Desktop Favorite Button */}
                <button
                  className="list-card-desktop-action"
                  onClick={handleFavoriteClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    color: isFavorite ? colors.favorite : colors.textTertiary,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                >
                  <Heart size={15} fill={isFavorite ? colors.favorite : 'none'} />
                </button>

                {/* Read Later Button */}
                <button
                  onClick={handleReadLaterClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    color: isReadLater ? colors.readLater : colors.textTertiary,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={isReadLater ? 'Mark as Read' : 'Read Later'}
                >
                  <Clock size={15} fill={isReadLater ? colors.readLater : 'none'} />
                </button>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    color: copied ? colors.success : colors.textTertiary,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Copy URL"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>

                {/* QR Code Button */}
                {onShowQr && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowQr(itemPayload);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '6px',
                      color: colors.textTertiary,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Scan QR Code"
                  >
                    <QrCode size={15} />
                  </button>
                )}

                {/* Desktop External Link */}
                <a
                  className="list-card-desktop-action"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleWatched && !watched) onToggleWatched(url);
                  }}
                  style={{
                    color: colors.textTertiary,
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                  }}
                  title="Open in new tab"
                >
                  <ExternalLink size={15} />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODERN GRID CARD VIEW WITH UNOBSTRUCTED THUMBNAIL
  // ==========================================
  const quickHeaderActions = [
    {
      key: 'watched',
      onClick: handleWatchedClick,
      isActive: watched,
      activeColor: colors.watched,
      activeBg: colors.watchedLight,
      title: watched ? `Watched (${watchCount}x)` : 'Mark as Watched',
      icon: <CheckCircle size={15} />,
    },
    {
      key: 'favorite',
      onClick: handleFavoriteClick,
      isActive: isFavorite,
      activeColor: colors.favorite,
      activeBg: colors.favoriteLight,
      title: isFavorite ? 'Favorited' : 'Add to Favorites',
      icon: <Heart size={15} fill={isFavorite ? colors.favorite : 'none'} />,
    },
    {
      key: 'readLater',
      onClick: handleReadLaterClick,
      isActive: isReadLater,
      activeColor: colors.readLater,
      activeBg: colors.readLaterLight,
      title: isReadLater ? 'In Read Later' : 'Read Later',
      icon: <Clock size={15} fill={isReadLater ? colors.readLater : 'none'} />,
    },
    ...(onShowQr
      ? [
          {
            key: 'qr',
            onClick: (e) => {
              e.stopPropagation();
              onShowQr(itemPayload);
            },
            isActive: false,
            activeColor: colors.accent,
            activeBg: colors.accentLight,
            title: 'Scan QR Code',
            icon: <QrCode size={15} />,
          },
        ]
      : []),
  ];

  return (
    <div
      onClick={() => !isReadOnly && onInspect && onInspect(itemPayload)}
      style={{
        borderRadius: '14px',
        backgroundColor: isDark ? colors.cardBg : '#ffffff',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: isReadOnly ? 'default' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        boxShadow: colors.shadowSm,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 12px 24px -6px rgba(0, 0, 0, 0.6)'
          : '0 12px 24px -6px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = colors.shadowSm;
        e.currentTarget.style.borderColor = colors.border;
      }}
    >
      {/* Top Toolbar Header: Checkbox + Badge Pill (left) & Action Icons (right) — never covers thumbnail */}
      <div
        style={{
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        {/* Left: Multi-select Checkbox + Compact Source Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {!isReadOnly && onToggleSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              aria-label={isSelected ? 'Deselect link' : 'Select link'}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '7px',
                border: isSelected ? `1px solid ${colors.accent}` : `1px solid ${colors.border}`,
                backgroundColor: isSelected ? colors.accent : 'transparent',
                color: isSelected ? '#ffffff' : colors.textTertiary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = colors.accent;
                  e.currentTarget.style.color = colors.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.textTertiary;
                }
              }}
              title={isSelected ? 'Deselect link' : 'Select link'}
            >
              {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
            </button>
          )}

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 9px',
              borderRadius: '9999px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
              color: colors.textSecondary,
              fontSize: '10.5px',
              fontWeight: '600',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              border: `1px solid ${colors.border}`,
              maxWidth: '130px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={preview.badge || domain}
          >
            <Globe size={11} style={{ flexShrink: 0, opacity: 0.8 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {preview.badge || domain}
            </span>
          </span>
        </div>

        {/* Right: Quick Action Controls */}
        {!isReadOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            {quickHeaderActions.map((act) => (
              <button
                key={act.key}
                type="button"
                onClick={act.onClick}
                aria-label={act.title}
                title={act.title}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  border: act.isActive ? `1px solid ${act.activeColor}40` : '1px solid transparent',
                  backgroundColor: act.isActive ? act.activeBg : 'transparent',
                  color: act.isActive ? act.activeColor : colors.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!act.isActive) {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.07)' : '#f1f5f9';
                    e.currentTarget.style.color = colors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!act.isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.textSecondary;
                  }
                }}
              >
                {act.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Larger, Clean, Unobstructed 16:9 Thumbnail Area */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          minHeight: '168px',
          maxHeight: '220px',
          position: 'relative',
          overflow: 'hidden',
          borderTop: `1px solid ${colors.borderLight}`,
          borderBottom: `1px solid ${colors.borderLight}`,
          background: preview.gradient || 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
        }}
      >
        {/* Subtle fallback monogram when image is unavailable or loading */}
        {(!imgSrc || thumbnailError || !thumbnailLoaded) && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              {domain.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Saved OpenGraph / Fallback Screenshot Thumbnail */}
        {imgSrc && !thumbnailError && (
          <img
            ref={imgRef}
            src={imgSrc}
            alt={title}
            loading="lazy"
            onLoad={() => setThumbnailLoaded(true)}
            onError={() => {
              if (preview.fallbackThumbnailUrl && imgSrc !== preview.fallbackThumbnailUrl) {
                setImgSrc(preview.fallbackThumbnailUrl);
              } else {
                setThumbnailError(true);
              }
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: (preview.isCustomThumbnail && imgSrc === preview.thumbnailUrl) ? 'center' : 'top center',
              opacity: thumbnailLoaded ? 1 : 0,
              transition: 'opacity 0.25s ease, transform 0.35s ease',
            }}
          />
        )}

        {/* Light bottom-only scrim for pill legibility — leaves top & center unobstructed */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.48) 0%, transparent 45%)',
            pointerEvents: 'none',
          }}
        />

        {/* Bottom Banner Status & Reading Time Pills */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            zIndex: 2,
          }}
        >
          {!isReadOnly && rewatchWorthy ? (
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: '700',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(249, 115, 22, 0.92)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              }}
              className="animate-flame-pulse"
            >
              <Flame size={11} />
              <span>Rewatch Worthy</span>
            </span>
          ) : !isReadOnly && watched ? (
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: '600',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.92)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
              }}
            >
              <CheckCircle size={11} />
              <span>Watched {watchCount > 1 ? `${watchCount}x` : ''}</span>
            </span>
          ) : <span />}

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 9px',
              borderRadius: '7px',
              backgroundColor: 'rgba(15, 15, 20, 0.78)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '11px',
              color: '#ffffff',
              fontWeight: '600',
            }}
          >
            <BookOpen size={11} style={{ opacity: 0.9 }} />
            <span>{readingTime}</span>
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div
        style={{
          padding: '14px 16px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Domain Row: Favicon + Domain + Interactive Stars */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '6px',
                  backgroundColor: isDark ? '#272730' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: `1px solid ${colors.borderLight}`,
                }}
              >
                {faviconUrl && !imageError ? (
                  <img
                    src={faviconUrl}
                    alt=""
                    style={{ width: '14px', height: '14px', objectFit: 'contain' }}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: colors.accent }}>
                    {domain.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: colors.textSecondary,
                  fontFamily: 'var(--font-mono)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={domain}
              >
                {domain}
              </span>
            </div>

            {!isReadOnly && (
              <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                <StarRating
                  rating={rating}
                  onRate={handleStarRate}
                  size={14}
                  showScore={rating > 0}
                  theme={theme}
                />
              </div>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '14.5px',
              fontWeight: '600',
              color: colors.text,
              margin: 0,
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            title={title}
          >
            {title}
          </h3>

          {/* Review Snippet if unlocked and reviewed */}
          {!isReadOnly && review && (
            <div
              style={{
                fontSize: '11.5px',
                fontStyle: 'italic',
                color: colors.textSecondary,
                backgroundColor: isDark ? 'rgba(251, 191, 36, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                borderLeft: `2px solid ${colors.rating}`,
                padding: '5px 8px',
                borderRadius: '0 6px 6px 0',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              "{review}"
            </div>
          )}

          {/* Collection Pill & Visibility Chip Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexWrap: 'wrap' }}>
              {collectionName && (
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: '500',
                    padding: '4px 10px',
                    borderRadius: '7px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                    color: colors.textSecondary,
                    border: `1px solid ${colors.borderLight}`,
                    maxWidth: '170px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={collectionName}
                >
                  {collectionName}
                </span>
              )}
              {notes && (
                <span
                  style={{
                    fontSize: '11px',
                    color: colors.accent,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontWeight: '500',
                  }}
                >
                  • has notes
                </span>
              )}
            </div>

            <div>
              {!isReadOnly && onTogglePublic ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePublic();
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '7px',
                    backgroundColor: isPublic ? 'rgba(16, 185, 129, 0.15)' : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9'),
                    color: isPublic ? '#10b981' : colors.textSecondary,
                    fontSize: '11.5px',
                    fontWeight: '600',
                    border: isPublic ? '1px solid rgba(16, 185, 129, 0.35)' : `1px solid ${colors.border}`,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                  title={isPublic ? 'Public: Visible to approved friends (Click to make Private)' : 'Private: Only visible to you (Click to make Public)'}
                >
                  {isPublic ? <Globe size={11} /> : <Lock size={11} />}
                  <span>{isPublic ? 'Public' : 'Private'}</span>
                </button>
              ) : isPublic ? (
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '7px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Globe size={11} />
                  <span>Public</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Card Footer: Balanced Copy Button & Visit CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${colors.borderLight}`,
            paddingTop: '12px',
            marginTop: 'auto',
            gap: '8px',
          }}
        >
          {isReadOnly ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
              {onSaveToMyCollection && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveToMyCollection(itemPayload);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: colors.accent,
                    backgroundColor: colors.accentLight,
                    border: `1px solid ${colors.borderActive}35`,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Save to My Collection"
                >
                  <BookmarkPlus size={14} />
                  <span>Save to My Collection</span>
                </button>
              )}

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6661f1 0%, #793fed 100%)',
                  boxShadow: '0 2px 8px rgba(102, 97, 241, 0.35)',
                  transition: 'all 0.15s ease',
                }}
                title="Open in new window"
              >
                <span>Visit</span>
                <ExternalLink size={13} strokeWidth={2.2} />
              </a>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  backgroundColor: copied
                    ? (isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.1)')
                    : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc'),
                  border: copied
                    ? '1px solid rgba(16, 185, 129, 0.35)'
                    : `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: copied ? colors.success : colors.textSecondary,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!copied) {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9';
                    e.currentTarget.style.color = colors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!copied) {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc';
                    e.currentTarget.style.color = colors.textSecondary;
                  }
                }}
                title="Copy URL"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleWatched && !watched) onToggleWatched(url);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6661f1 0%, #793fed 100%)',
                  boxShadow: '0 2px 8px rgba(102, 97, 241, 0.35)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 97, 241, 0.55)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 97, 241, 0.35)';
                }}
                title="Open in new window"
              >
                <span>Visit</span>
                <ExternalLink size={13} strokeWidth={2.2} />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};