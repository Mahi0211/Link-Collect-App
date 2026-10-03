import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Heart,
  Clock,
  Archive,
  Trash2,
  Tag,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  Star,
  CheckCircle,
  Eye,
  Flame,
  Lock,
  Unlock,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';
import { themes } from '../utils/themes';
import { getFaviconUrl, getDomainName, getLinkPreviewData } from '../utils/linkUtils';
import { StarRating } from './StarRating';

export const LinkDetailDrawer = ({
  item,
  isOpen,
  onClose,
  collections = [],
  onUpdateItem,
  onDeleteItem,
  theme = 'dark',
  onShowToast
}) => {
  if (!isOpen || !item) return null;

  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  const [title, setTitle] = useState(item.title || '');
  const [url, setUrl] = useState(item.url || '');
  const [collectionName, setCollectionName] = useState(item.collectionName || '');
  const [notes, setNotes] = useState(item.notes || '');
  const [tags, setTags] = useState(item.customTags || []);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(item.isFavorite || false);
  const [isReadLater, setIsReadLater] = useState(item.isReadLater || false);
  const [copied, setCopied] = useState(false);

  // New Rating, Watched & Review States
  const [rating, setRating] = useState(item.rating || 0);
  const [review, setReview] = useState(item.review || '');
  const [watched, setWatched] = useState(item.watched || false);
  const [watchCount, setWatchCount] = useState(item.watchCount || (item.watched ? 1 : 0));
  const [rewatchWorthy, setRewatchWorthy] = useState(item.rewatchWorthy || false);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setUrl(item.url || '');
      setCollectionName(item.collectionName || '');
      setNotes(item.notes || '');
      setTags(item.customTags || []);
      setIsFavorite(item.isFavorite || false);
      setIsReadLater(item.isReadLater || false);
      setRating(item.rating || 0);
      setReview(item.review || '');
      setWatched(item.watched || false);
      setWatchCount(item.watchCount || (item.watched ? 1 : 0));
      setRewatchWorthy(item.rewatchWorthy || false);
    }
  }, [item]);

  const domain = getDomainName(url);
  const faviconUrl = getFaviconUrl(url);
  const preview = getLinkPreviewData(url);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    if (onShowToast) onShowToast('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleRate = (newRating) => {
    setRating(newRating);
    if (newRating >= 4 && !rewatchWorthy) {
      // Intelligently suggest rewatch worthy for 4-5 stars
      setRewatchWorthy(true);
      if (onShowToast) onShowToast(`Rated ${newRating}★! Marked as Rewatch Worthy 🔥`);
    } else if (newRating > 0) {
      if (onShowToast) onShowToast(`Rated ${newRating}★ — Review field unlocked!`);
    }
  };

  const handleToggleWatched = () => {
    const nextWatched = !watched;
    setWatched(nextWatched);
    if (nextWatched && watchCount === 0) {
      setWatchCount(1);
    }
    if (onShowToast) onShowToast(nextWatched ? 'Marked as Watched ✓' : 'Marked as Unwatched');
  };

  const handleIncrementWatch = () => {
    const nextCount = watchCount + 1;
    setWatchCount(nextCount);
    setWatched(true);
    if (onShowToast) onShowToast(`Watch count updated to ${nextCount}x!`);
  };

  const handleDecrementWatch = () => {
    if (watchCount > 0) {
      const nextCount = watchCount - 1;
      setWatchCount(nextCount);
      if (nextCount === 0) setWatched(false);
    }
  };

  const handleSave = () => {
    if (onUpdateItem) {
      onUpdateItem({
        originalUrl: item.url,
        url,
        title,
        collectionName,
        notes,
        customTags: tags,
        isFavorite,
        isReadLater,
        rating,
        review,
        watched: watched || watchCount > 0,
        watchCount,
        rewatchWorthy,
      });
    }
    if (onShowToast) onShowToast('Link updated successfully!');
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteItem) {
      onDeleteItem(item.url, collectionName);
    }
    if (onShowToast) onShowToast('Link removed from collection');
    onClose();
  };

  // Rating descriptor
  const ratingLabels = [
    'Rate to unlock review',
    '★ 1.0 - Poor / Did not finish',
    '★★ 2.0 - Below average',
    '★★★ 3.0 - Good / Informative',
    '★★★★ 4.0 - Great resource',
    '★★★★★ 5.0 - Masterpiece / Essential'
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: isDark ? colors.bgSecondary : '#ffffff',
          borderLeft: `1px solid ${colors.border}`,
          boxShadow: colors.shadowLg,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#272730' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {faviconUrl ? (
                <img src={faviconUrl} alt="" style={{ width: '16px', height: '16px' }} />
              ) : (
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: colors.accent }}>
                  {domain.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textSecondary }}>
              {domain}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colors.textTertiary,
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Visual Preview Banner with Live Screenshot Thumbnail */}
        <div
          style={{
            height: '160px',
            background: preview.gradient || 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {preview.thumbnailUrl && (
            <img
              src={preview.thumbnailUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
                position: 'absolute',
                inset: 0,
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          {/* Dark Overlay for readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '16px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 2,
            }}
          >
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '600',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {preview.badge || domain}
            </span>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isFavorite ? colors.favorite : 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                <Heart size={13} fill={isFavorite ? '#ffffff' : 'none'} />
                <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
              </button>
              <button
                onClick={() => setIsReadLater(!isReadLater)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isReadLater ? colors.readLater : 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                <Clock size={13} fill={isReadLater ? '#ffffff' : 'none'} />
                <span>{isReadLater ? 'Reading List' : 'Read Later'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Form Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {/* Title Field */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: '14px',
                fontWeight: '500',
                outline: 'none',
              }}
            />
          </div>

          {/* URL & Action Buttons */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
              Target URL
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={url}
                readOnly
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? '#141418' : '#f1f5f9',
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: isDark ? colors.bgTertiary : '#ffffff',
                  color: copied ? colors.success : colors.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                }}
                title="Copy URL"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleIncrementWatch();
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: colors.accent,
                  color: '#ffffff',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                <span>Visit</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* WATCH ACTIVITY & REWATCH CONTROLS */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: isDark ? '#141418' : '#f8fafc',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: colors.text }}>
                Viewing Activity
              </span>
              {watched && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: colors.watched,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  className="animate-badge-bounce"
                >
                  <CheckCircle size={13} />
                  <span>Watched</span>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              {/* Mark as Watched Toggle */}
              <button
                type="button"
                onClick={handleToggleWatched}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${watched ? colors.watched : colors.border}`,
                  backgroundColor: watched ? colors.watchedLight : 'transparent',
                  color: watched ? colors.watched : colors.textSecondary,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckCircle size={14} />
                <span>{watched ? 'Already Watched' : 'Mark as Watched'}</span>
              </button>

              {/* Watch Count Stepper */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? colors.bgTertiary : '#ffffff',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <button
                  type="button"
                  onClick={handleDecrementWatch}
                  disabled={watchCount === 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: watchCount === 0 ? 'not-allowed' : 'pointer',
                    color: watchCount === 0 ? colors.textTertiary : colors.text,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Decrease watch count"
                >
                  <Minus size={13} />
                </button>
                <span style={{ fontSize: '12px', fontWeight: '600', color: colors.text, minWidth: '40px', textAlign: 'center' }}>
                  {watchCount} {watchCount === 1 ? 'view' : 'views'}
                </span>
                <button
                  type="button"
                  onClick={handleIncrementWatch}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: colors.text,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Increment watch count"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Rewatch Worthy Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextVal = !rewatchWorthy;
                  setRewatchWorthy(nextVal);
                  if (onShowToast) onShowToast(nextVal ? 'Flagged as Rewatch Worthy! 🔥' : 'Removed Rewatch Worthy flag');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${rewatchWorthy ? colors.rewatch : colors.border}`,
                  backgroundColor: rewatchWorthy ? colors.rewatchLight : 'transparent',
                  color: rewatchWorthy ? colors.rewatch : colors.textSecondary,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Flame size={14} className={rewatchWorthy ? 'animate-flame-pulse' : ''} />
                <span>Rewatch Worthy</span>
              </button>
            </div>
          </div>

          {/* 5-STAR RATING & PROGRESSIVE REVIEW UNLOCK */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: isDark ? '#141418' : '#f8fafc',
              border: `1px solid ${rating > 0 ? colors.rating + '40' : colors.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              transition: 'border-color 0.25s ease',
            }}
          >
            {/* Rating Stars Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.text }}>
                  5-Star Rating
                </span>
                <span style={{ fontSize: '11px', color: colors.rating, fontWeight: '500' }}>
                  {ratingLabels[rating]}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StarRating rating={rating} onRate={handleRate} size={22} theme={theme} />
                {rating > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRate(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.textTertiary,
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: '2px 4px',
                    }}
                    title="Clear rating"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* PROGRESSIVE REVIEW FIELD */}
            {rating === 0 ? (
              /* Locked State when Rating is 0 */
              <div
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                  border: `1px dashed ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: colors.textTertiary,
                  fontSize: '12px',
                }}
              >
                <Lock size={15} style={{ color: colors.textTertiary, flexShrink: 0 }} />
                <span>Rate this link with 1–5 stars above to unlock your personal review & critique field.</span>
              </div>
            ) : (
              /* Unlocked Review Field with Animation */
              <div className="animate-unlock-slide">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: colors.text,
                    }}
                  >
                    <Unlock size={14} style={{ color: colors.rating }} />
                    <span>Personal Review & Critique ({rating}.0★)</span>
                  </label>
                  <span style={{ fontSize: '11px', color: colors.rating, fontWeight: '600' }}>
                    Unlocked
                  </span>
                </div>
                <textarea
                  placeholder="What makes this link standout? Key impressions, pros/cons, or why you recommend it..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? colors.bgTertiary : '#ffffff',
                    border: `1px solid ${colors.rating}60`,
                    color: colors.text,
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                    lineHeight: '1.5',
                    boxShadow: `0 0 10px ${colors.ratingLight}`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Collection Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
              Collection
            </label>
            <select
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {collections.map((c, i) => (
                <option key={i} value={c.collectionName}>
                  {c.collectionName}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Manager */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
              Tags
            </label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                border: `1px solid ${colors.border}`,
                minHeight: '44px',
                alignItems: 'center',
              }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: colors.accentLight,
                    color: colors.accent,
                    fontSize: '11px',
                    fontWeight: '600',
                  }}
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.accent,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Type tag & press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  color: colors.text,
                  flex: 1,
                  minWidth: '120px',
                }}
              />
            </div>
          </div>

          {/* Personal Notes Field */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
              Quick Notes & Highlights
            </label>
            <textarea
              placeholder="Add personal reminders, timestamps, or quotes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: '13px',
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.5',
              }}
            />
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isDark ? '#141418' : '#f8fafc',
          }}
        >
          <button
            onClick={handleDelete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.dangerLight}`,
              backgroundColor: 'transparent',
              color: colors.danger,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            <Trash2 size={14} />
            <span>Remove</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: colors.accent,
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '600',
                boxShadow: `0 2px 8px ${colors.accentLight}`,
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
