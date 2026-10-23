import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Link as LinkIcon,
  Folder,
  Tag,
  Heart,
  Clock,
  Sparkles,
  Check,
  CheckCircle,
  Flame,
  AlertTriangle,
  Loader2,
  Globe,
  FileText
} from 'lucide-react';
import { themes } from '../utils/themes';
import { getDomainName, getPageTitle, getSuggestedTags } from '../utils/linkUtils';
import { api } from '../utils/api';

export const AddLinkModal = ({
  isOpen,
  onClose,
  collections = [],
  activeCollectionIndex = 0,
  onAddLink,
  theme = 'dark',
  onShowToast,
  initialUrl = '',
  initialTitle = ''
}) => {
  if (!isOpen) return null;

  const colors = themes[theme];
  const isDark = theme === 'dark';

  const defaultCollection = collections[activeCollectionIndex]?.collectionName || collections[0]?.name || 'General';

  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const [selectedCollection, setSelectedCollection] = useState(defaultCollection);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReadLater, setIsReadLater] = useState(false);
  const [watched, setWatched] = useState(false);
  const [rewatchWorthy, setRewatchWorthy] = useState(false);

  // Advanced metadata & duplicate states
  const [isScraping, setIsScraping] = useState(false);
  const [metadataPreview, setMetadataPreview] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const debounceTimerRef = useRef(null);

  // Trigger auto-scrape and duplicate check on URL input
  useEffect(() => {
    if (!url || url.trim().length < 5) {
      setDuplicateWarning(null);
      setMetadataPreview(null);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      let finalUrl = url.trim();
      if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;

      // 1. Check Duplicate
      try {
        const dupRes = await api.checkDuplicate(finalUrl);
        if (dupRes && dupRes.exists) {
          setDuplicateWarning(dupRes);
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        // silent fail
      }

      // 2. Scrape Metadata
      setIsScraping(true);
      try {
        const meta = await api.scrapeMetadata(finalUrl);
        if (meta) {
          setMetadataPreview(meta);
          if (meta.title && (!title || title === 'Saved Link' || title === getPageTitle(finalUrl))) {
            setTitle(meta.title);
          }
          if (meta.description && !notes) {
            setNotes(meta.description);
          }
          const suggested = meta.keywords && meta.keywords.length > 0 ? meta.keywords : getSuggestedTags(finalUrl);
          setTags((prev) => Array.from(new Set([...prev, ...suggested])));
        }
      } catch {
        // fallback to client-side heuristics
        const autoTitle = getPageTitle(finalUrl);
        if (!title || title === 'Saved Link') setTitle(autoTitle);
        const suggested = getSuggestedTags(finalUrl);
        setTags((prev) => Array.from(new Set([...prev, ...suggested])));
      } finally {
        setIsScraping(false);
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [url]);

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Ensure valid protocol
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    const finalTitle = title.trim() || getPageTitle(finalUrl);

    onAddLink({
      url: finalUrl,
      title: finalTitle,
      collectionName: selectedCollection,
      customTags: tags,
      notes: notes.trim(),
      isFavorite,
      isReadLater,
      watched,
      watchCount: watched ? 1 : 0,
      rewatchWorthy,
      addedAt: new Date().toISOString(),
    });

    if (onShowToast) onShowToast(`Added "${finalTitle}" to ${selectedCollection}`);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: isDark ? colors.bgSecondary : '#ffffff',
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          boxShadow: colors.shadowLg,
          overflow: 'hidden',
          animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: colors.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.accent,
              }}
            >
              <Plus size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text }}>
              Save New Link
            </h2>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* URL Input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
              URL Address *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <LinkIcon size={15} style={{ position: 'absolute', left: '12px', color: colors.textTertiary }} />
              <input
                type="text"
                autoFocus
                placeholder="https://example.com/great-article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
              {isScraping && (
                <div style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: colors.accent }}>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Fetching...</span>
                </div>
              )}
            </div>

            {/* Duplicate Warning Alert */}
            {duplicateWarning && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(234, 179, 8, 0.12)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '11.5px',
                  color: '#eab308'
                }}
              >
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Already Saved!</strong> You already have this link in your library
                  {duplicateWarning.collectionName ? ` in "${duplicateWarning.collectionName}"` : ''}.
                </div>
              </div>
            )}

            {/* Live OpenGraph Preview Card */}
            {metadataPreview && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9',
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center'
                }}
              >
                {metadataPreview.image ? (
                  <img
                    src={metadataPreview.image}
                    alt=""
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      backgroundColor: colors.accentLight,
                      color: colors.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Globe size={18} />
                  </div>
                )}
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: colors.accent, textTransform: 'uppercase' }}>
                    {metadataPreview.domain}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {metadataPreview.title || 'Preview Title'}
                  </div>
                  {metadataPreview.description && (
                    <div style={{ fontSize: '11px', color: colors.textTertiary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {metadataPreview.description}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
              Custom Title (Optional)
            </label>
            <input
              type="text"
              placeholder="Descriptive title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
          </div>

          {/* Collection Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
              Destination Collection
            </label>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
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

          {/* Tags */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
              Tags (Press Enter or comma)
            </label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '10px',
                backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                border: `1px solid ${colors.border}`,
                alignItems: 'center',
                minHeight: '42px',
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
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{ background: 'none', border: 'none', color: colors.accent, cursor: 'pointer', padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={tags.length === 0 ? "e.g. tools, react..." : ""}
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
                  minWidth: '100px',
                }}
              />
            </div>
          </div>

          {/* Quick Checkboxes: Favorite, Read Later, Watched, Rewatch Worthy */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12.5px', color: colors.textSecondary }}>
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                style={{ accentColor: colors.favorite, width: '15px', height: '15px' }}
              />
              <Heart size={13} fill={isFavorite ? colors.favorite : 'none'} style={{ color: colors.favorite }} />
              <span>Favorite</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12.5px', color: colors.textSecondary }}>
              <input
                type="checkbox"
                checked={isReadLater}
                onChange={(e) => setIsReadLater(e.target.checked)}
                style={{ accentColor: colors.readLater, width: '15px', height: '15px' }}
              />
              <Clock size={13} fill={isReadLater ? colors.readLater : 'none'} style={{ color: colors.readLater }} />
              <span>Read Later</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12.5px', color: colors.textSecondary }}>
              <input
                type="checkbox"
                checked={watched}
                onChange={(e) => setWatched(e.target.checked)}
                style={{ accentColor: colors.watched, width: '15px', height: '15px' }}
              />
              <CheckCircle size={13} style={{ color: colors.watched }} />
              <span>Watched</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12.5px', color: colors.textSecondary }}>
              <input
                type="checkbox"
                checked={rewatchWorthy}
                onChange={(e) => setRewatchWorthy(e.target.checked)}
                style={{ accentColor: colors.rewatch, width: '15px', height: '15px' }}
              />
              <Flame size={13} style={{ color: colors.rewatch }} />
              <span>Rewatch Worthy</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: `1px solid ${colors.borderLight}`,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
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
              type="submit"
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: colors.accent,
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: `0 2px 8px ${colors.accentLight}`,
              }}
            >
              Save Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
