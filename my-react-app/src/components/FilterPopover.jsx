import React, { useState, useEffect, useRef } from 'react';
import {
  ListFilter,
  ChevronDown,
  ChevronUp,
  Check,
  Star,
  RotateCcw,
  Search,
  Folder
} from 'lucide-react';
import { themes } from '../utils/themes';

export const INITIAL_FILTERS = {
  mediaTypes: [],
  collectionIds: [],
  rating: null,
  dateAdded: 'all',
  unwatchedOnly: false,
  favoritedOnly: false,
};

export const countActiveFilters = (filters, isAllView = false) => {
  if (!filters) return 0;
  let count = 0;
  if (filters.mediaTypes && filters.mediaTypes.length > 0) count += filters.mediaTypes.length;
  if (isAllView && filters.collectionIds && filters.collectionIds.length > 0) count += filters.collectionIds.length;
  if (filters.rating !== null && filters.rating !== undefined) count += 1;
  if (filters.dateAdded && filters.dateAdded !== 'all') count += 1;
  if (filters.unwatchedOnly) count += 1;
  if (filters.favoritedOnly) count += 1;
  return count;
};

export const FilterPopover = ({
  filters = INITIAL_FILTERS,
  onApplyFilters,
  onResetFilters,
  collections = [],
  isAllView = false,
  theme = 'dark',
}) => {
  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const [collectionSearch, setCollectionSearch] = useState('');
  const popoverRef = useRef(null);

  // Synchronize draft when incoming filters change
  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeCount = countActiveFilters(filters, isAllView);

  const toggleMediaType = (type) => {
    setDraft((prev) => {
      const exists = prev.mediaTypes.includes(type);
      return {
        ...prev,
        mediaTypes: exists
          ? prev.mediaTypes.filter((t) => t !== type)
          : [...prev.mediaTypes, type],
      };
    });
  };

  const toggleCollection = (id) => {
    setDraft((prev) => {
      const exists = prev.collectionIds.includes(id);
      return {
        ...prev,
        collectionIds: exists
          ? prev.collectionIds.filter((c) => c !== id)
          : [...prev.collectionIds, id],
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(draft);
    setIsOpen(false);
  };

  const handleReset = () => {
    setDraft(INITIAL_FILTERS);
    onResetFilters();
  };

  const filteredCollections = collections.filter((c) =>
    (c.collectionName || '').toLowerCase().includes(collectionSearch.toLowerCase().trim())
  );

  return (
    <div ref={popoverRef} style={{ position: 'relative' }}>
      {/* Trigger Button near Add to Collection */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '8px',
          border: `1px solid ${activeCount > 0 ? '#6366f1' : colors.border}`,
          backgroundColor: activeCount > 0
            ? (isDark ? 'rgba(99, 102, 241, 0.14)' : 'rgba(79, 70, 229, 0.08)')
            : (isDark ? '#141418' : '#ffffff'),
          color: activeCount > 0 ? (isDark ? '#a5b4fc' : '#4f46e5') : colors.text,
          fontSize: '12.5px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: activeCount > 0 ? '0 2px 8px rgba(99, 102, 241, 0.2)' : 'none',
        }}
        title="Filter Bookmarks"
      >
        <ListFilter size={15} style={{ color: activeCount > 0 ? '#818cf8' : colors.textTertiary }} />
        <span>Filters</span>
        {activeCount > 0 && (
          <span
            style={{
              padding: '1px 6px',
              borderRadius: '9999px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '700',
              lineHeight: '14px',
            }}
          >
            {activeCount}
          </span>
        )}
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Filter Popover Dialog */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '320px',
            maxWidth: '90vw',
            backgroundColor: isDark ? '#111116' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)'}`,
            borderRadius: '16px',
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 20px 40px -15px rgba(0, 0, 0, 0.18)',
            padding: '18px',
            zIndex: 80,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14.5px', fontWeight: '700', color: colors.text, letterSpacing: '-0.01em' }}>
                Filter Bookmarks
              </span>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#818cf8',
                  display: 'inline-block',
                }}
              />
            </div>
            <button
              onClick={handleReset}
              style={{
                background: 'none',
                border: 'none',
                color: colors.textTertiary,
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = colors.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.textTertiary)}
            >
              Reset all
            </button>
          </div>

          {/* Section: MEDIA TYPE */}
          <div>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: '700',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '7px',
              }}
            >
              Media Type
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { key: 'videos', label: 'Videos' },
                { key: 'articles', label: 'Articles' },
                { key: 'portals', label: 'Portals' },
                { key: 'tools', label: 'Tools' },
              ].map(({ key, label }) => {
                const checked = draft.mediaTypes.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleMediaType(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: `1px solid ${checked ? '#6366f1' : isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border}`,
                      backgroundColor: checked
                        ? (isDark ? 'rgba(99, 102, 241, 0.16)' : 'rgba(79, 70, 229, 0.08)')
                        : (isDark ? '#17171d' : '#f8fafc'),
                      color: checked ? (isDark ? '#c7d2fe' : '#4f46e5') : colors.text,
                      fontSize: '12.5px',
                      fontWeight: checked ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: '15px',
                        height: '15px',
                        borderRadius: '4px',
                        border: `1px solid ${checked ? '#6366f1' : colors.textTertiary}`,
                        backgroundColor: checked ? '#6366f1' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {checked && <Check size={11} color="#ffffff" strokeWidth={3} />}
                    </div>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: COLLECTIONS (Multi-Select, Active in 'All Bookmarks' View) */}
          {isAllView && collections.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '7px',
                }}
              >
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: '700',
                    color: colors.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Collections {draft.collectionIds.length > 0 && `(${draft.collectionIds.length})`}
                </span>
                {draft.collectionIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, collectionIds: [] }))}
                    style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {collections.length > 5 && (
                <div style={{ position: 'relative', marginBottom: '6px' }}>
                  <Search size={12} style={{ position: 'absolute', left: '8px', top: '7px', color: colors.textTertiary }} />
                  <input
                    type="text"
                    value={collectionSearch}
                    onChange={(e) => setCollectionSearch(e.target.value)}
                    placeholder="Search collections..."
                    style={{
                      width: '100%',
                      padding: '5px 8px 5px 26px',
                      borderRadius: '6px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: isDark ? '#17171d' : '#f8fafc',
                      color: colors.text,
                      fontSize: '11.5px',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  maxHeight: '100px',
                  overflowY: 'auto',
                  paddingRight: '2px',
                }}
              >
                {filteredCollections.map((col) => {
                  const isSelected = draft.collectionIds.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => toggleCollection(col.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: `1px solid ${isSelected ? '#6366f1' : isDark ? 'rgba(255,255,255,0.08)' : colors.border}`,
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(79, 70, 229, 0.1)')
                          : (isDark ? '#17171d' : '#f8fafc'),
                        color: isSelected ? (isDark ? '#c7d2fe' : '#4f46e5') : colors.textSecondary,
                        fontSize: '11.5px',
                        fontWeight: isSelected ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Folder size={11} style={{ color: isSelected ? '#818cf8' : colors.textTertiary }} />
                      <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {col.collectionName}
                      </span>
                      {isSelected && <Check size={10} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: RATING */}
          <div>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: '700',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '7px',
              }}
            >
              Rating
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { label: '★ 4+', value: 4, isGold: true },
                { label: '★ 3+', value: 3, isGold: true },
                { label: 'Unrated', value: -1, isGold: false },
              ].map(({ label, value, isGold }) => {
                const isSelected = draft.rating === value;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, rating: isSelected ? null : value }))}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: `1px solid ${
                        isSelected
                          ? isGold ? '#eab308' : '#6366f1'
                          : isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border
                      }`,
                      backgroundColor: isSelected
                        ? (isGold ? 'rgba(234, 179, 8, 0.15)' : 'rgba(99, 102, 241, 0.18)')
                        : (isDark ? '#17171d' : '#f8fafc'),
                      color: isSelected
                        ? (isGold ? '#facc15' : (isDark ? '#c7d2fe' : '#4f46e5'))
                        : colors.textSecondary,
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: DATE ADDED */}
          <div>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: '700',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '7px',
              }}
            >
              Date Added
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { label: 'Last 7d', value: '7d' },
                { label: 'Past month', value: '30d' },
                { label: 'Any time', value: 'all' },
              ].map(({ label, value }) => {
                const isSelected = (draft.dateAdded || 'all') === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, dateAdded: value }))}
                    style={{
                      flex: 1,
                      padding: '7px 8px',
                      borderRadius: '8px',
                      border: `1px solid ${
                        isSelected ? '#6366f1' : isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border
                      }`,
                      backgroundColor: isSelected
                        ? (isDark ? 'rgba(99, 102, 241, 0.22)' : 'rgba(79, 70, 229, 0.1)')
                        : (isDark ? '#17171d' : '#f8fafc'),
                      color: isSelected ? (isDark ? '#c7d2fe' : '#4f46e5') : colors.textSecondary,
                      fontSize: '12px',
                      fontWeight: isSelected ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: STATUS */}
          <div>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: '700',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '7px',
              }}
            >
              Status
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {/* Unwatched */}
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, unwatchedOnly: !prev.unwatchedOnly }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: `1px solid ${
                    draft.unwatchedOnly ? '#6366f1' : isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border
                  }`,
                  backgroundColor: draft.unwatchedOnly
                    ? (isDark ? 'rgba(99, 102, 241, 0.16)' : 'rgba(79, 70, 229, 0.08)')
                    : (isDark ? '#17171d' : '#f8fafc'),
                  color: draft.unwatchedOnly ? (isDark ? '#c7d2fe' : '#4f46e5') : colors.text,
                  fontSize: '12.5px',
                  fontWeight: draft.unwatchedOnly ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '15px',
                    height: '15px',
                    borderRadius: '4px',
                    border: `1px solid ${draft.unwatchedOnly ? '#6366f1' : colors.textTertiary}`,
                    backgroundColor: draft.unwatchedOnly ? '#6366f1' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {draft.unwatchedOnly && <Check size={11} color="#ffffff" strokeWidth={3} />}
                </div>
                <span>Unwatched</span>
              </button>

              {/* Favorited */}
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, favoritedOnly: !prev.favoritedOnly }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: `1px solid ${
                    draft.favoritedOnly ? '#6366f1' : isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border
                  }`,
                  backgroundColor: draft.favoritedOnly
                    ? (isDark ? 'rgba(99, 102, 241, 0.16)' : 'rgba(79, 70, 229, 0.08)')
                    : (isDark ? '#17171d' : '#f8fafc'),
                  color: draft.favoritedOnly ? (isDark ? '#c7d2fe' : '#4f46e5') : colors.text,
                  fontSize: '12.5px',
                  fontWeight: draft.favoritedOnly ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '15px',
                    height: '15px',
                    borderRadius: '4px',
                    border: `1px solid ${draft.favoritedOnly ? '#6366f1' : colors.textTertiary}`,
                    backgroundColor: draft.favoritedOnly ? '#6366f1' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {draft.favoritedOnly && <Check size={11} color="#ffffff" strokeWidth={3} />}
                </div>
                <span>Favorited</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: `1px solid ${colors.borderLight}`,
              marginTop: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                handleReset();
                setIsOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: colors.textTertiary,
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '6px 4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = colors.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.textTertiary)}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleApply}
              style={{
                background: 'linear-gradient(135deg, #6661f1 0%, #793fed 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(102, 97, 241, 0.35)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(102, 97, 241, 0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 97, 241, 0.35)';
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

