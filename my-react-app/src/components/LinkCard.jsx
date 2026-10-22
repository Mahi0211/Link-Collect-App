import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { themes } from '../utils/themes';
import {
  getFaviconUrl,
  getDomainName,
  getPageTitle,
  getEstimatedReadingTime,
  getLinkPreviewData
} from '../utils/linkUtils';
import { StarRating } from './StarRating';

export const LinkCard = ({
  link,
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
  const domain = getDomainName(url);
  const title = customTitle || getPageTitle(url);
  const faviconUrl = getFaviconUrl(url);
  const readingTime = getEstimatedReadingTime(url);
  const preview = getLinkPreviewData(url);

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
    url,
    title,
    domain,
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
        onClick={() => onInspect && onInspect(itemPayload)}
        className="list-card-container"
        style={{
          backgroundColor: isDark ? colors.cardBg : '#ffffff',
          border: `1px solid ${colors.border}`,
          cursor: 'pointer',
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

          {/* Mobile-only Top Action Buttons (Heart + Open in new tab) */}
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
        </div>

        {/* Bottom Section on Mobile, Middle & Right on Desktop */}
        <div className="list-card-meta-row">
          {/* Rating & Status Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Star Rating */}
            <div onClick={(e) => e.stopPropagation()}>
              <StarRating
                rating={rating}
                onRate={handleStarRate}
                size={13}
                showScore={rating > 0}
                theme={theme}
              />
            </div>

            {/* Rewatch Worthy Flame Badge */}
            {rewatchWorthy && (
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
            {watched && (
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
          </div>

          {/* Action Buttons */}
          <div className="list-card-actions">
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
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODERN GRID CARD VIEW WITH RICH THUMBNAIL
  // ==========================================
  return (
    <div
      onClick={() => onInspect && onInspect(itemPayload)}
      style={{
        borderRadius: '14px',
        backgroundColor: isDark ? colors.cardBg : '#ffffff',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
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
      {/* Top Banner / Live Thumbnail Area */}
      <div
        style={{
          height: '130px',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: preview.gradient || 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
        }}
      >
        {/* Actual Live Screenshot Thumbnail */}
        {preview.thumbnailUrl && !thumbnailError && (
          <img
            src={preview.thumbnailUrl}
            alt={title}
            loading="lazy"
            onLoad={() => setThumbnailLoaded(true)}
            onError={() => setThumbnailError(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              opacity: thumbnailLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease, transform 0.4s ease',
            }}
          />
        )}

        {/* Subtle Dark Gradient Overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.35) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Badges: Domain Pill & Quick Action Controls */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 3,
          }}
        >
          {/* Domain Pill */}
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontSize: '10.5px',
              fontWeight: '600',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {preview.badge || domain}
          </span>

          {/* Quick Action Floating Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Watched Toggle Button */}
            <button
              onClick={handleWatchedClick}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: watched ? 'rgba(16, 185, 129, 0.95)' : 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              title={watched ? `Watched (${watchCount}x)` : 'Mark as Watched'}
            >
              <CheckCircle size={14} />
            </button>

            {/* Heart Favorite Toggle */}
            <button
              onClick={handleFavoriteClick}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: isFavorite ? 'rgba(244, 63, 94, 0.95)' : 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              title={isFavorite ? 'Favorited' : 'Add to Favorites'}
            >
              <Heart size={14} fill={isFavorite ? '#ffffff' : 'none'} />
            </button>

            {/* Read Later Toggle */}
            <button
              onClick={handleReadLaterClick}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: isReadLater ? 'rgba(2, 132, 199, 0.95)' : 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              title={isReadLater ? 'In Read Later' : 'Read Later'}
            >
              <Clock size={14} fill={isReadLater ? '#ffffff' : 'none'} />
            </button>
          </div>
        </div>

        {/* Bottom Banner Status Badges */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '10px',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 3,
          }}
        >
          {/* Rewatch Worthy Flame Badge */}
          {rewatchWorthy ? (
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: '700',
                padding: '2px 7px',
                borderRadius: '5px',
                backgroundColor: 'rgba(249, 115, 22, 0.9)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              }}
              className="animate-flame-pulse"
            >
              <Flame size={11} />
              <span>Rewatch Worthy</span>
            </span>
          ) : watched ? (
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '5px',
                backgroundColor: 'rgba(16, 185, 129, 0.9)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <CheckCircle size={11} />
              <span>Watched {watchCount > 1 ? `${watchCount}x` : ''}</span>
            </span>
          ) : <span />}

          <span
            style={{
              fontSize: '10.5px',
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: '500',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            {readingTime}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div
        style={{
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          gap: '10px',
        }}
      >
        <div>
          {/* Header Row: Favicon + Domain + Interactive Stars */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: isDark ? '#272730' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
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
                  fontSize: '11.5px',
                  color: colors.textSecondary,
                  fontFamily: 'var(--font-mono)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {domain}
              </span>
            </div>

            {/* 5-Star Rating component */}
            <div onClick={(e) => e.stopPropagation()}>
              <StarRating
                rating={rating}
                onRate={handleStarRate}
                size={14}
                showScore={rating > 0}
                theme={theme}
              />
            </div>
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.text,
              margin: '0 0 6px 0',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '38px',
            }}
          >
            {title}
          </h3>

          {/* Review Snippet if unlocked and reviewed */}
          {review && (
            <div
              style={{
                fontSize: '11.5px',
                fontStyle: 'italic',
                color: colors.textSecondary,
                backgroundColor: isDark ? 'rgba(251, 191, 36, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                borderLeft: `2px solid ${colors.rating}`,
                padding: '4px 8px',
                borderRadius: '0 6px 6px 0',
                marginBottom: '8px',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              "{review}"
            </div>
          )}

          {/* Collection Name & Notes indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {collectionName && (
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: '500',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: isDark ? '#1a1a22' : '#f1f5f9',
                  color: colors.textTertiary,
                }}
              >
                {collectionName}
              </span>
            )}
            {notes && (
              <span
                style={{
                  fontSize: '10.5px',
                  color: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                • has notes
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Quick Copy & External Open */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${colors.borderLight}`,
            paddingTop: '10px',
            marginTop: '4px',
          }}
        >
          {/* Quick Copy Link */}
          <button
            onClick={handleCopy}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11.5px',
              color: copied ? colors.success : colors.textTertiary,
              padding: '4px 6px',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
            }}
            title="Copy URL"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* External Direct Visit Button */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleWatched && !watched) onToggleWatched(url);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11.5px',
              fontWeight: '500',
              color: colors.accent,
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: colors.accentLight,
              transition: 'background 0.15s ease',
            }}
            title="Open in new window"
          >
            <span>Visit</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};