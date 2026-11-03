import React, { useState } from 'react';
import {
  FolderPlus,
  Folder,
  X,
  Check,
  Globe,
  Lock,
  ExternalLink,
  Plus
} from 'lucide-react';
import { themes } from '../utils/themes';
import { getDomainName, getFaviconUrl } from '../utils/linkUtils';

export const SaveToCollectionModal = ({
  isOpen,
  onClose,
  linkItem,
  collections = [],
  onSave,
  theme = 'dark'
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState(() => {
    return collections.length > 0 ? (collections[0].id || 0) : 0;
  });
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !linkItem) return null;

  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  const url = linkItem.url || linkItem.link || '';
  const domain = linkItem.domain || getDomainName(url);
  const title = linkItem.title || url;
  const faviconUrl = getFaviconUrl(url);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        url,
        title,
        notes: linkItem.notes || '',
        customTags: linkItem.customTags || [],
        collectionId: isCreatingNew ? undefined : selectedCollectionId,
        collectionName: isCreatingNew ? newCollectionName.trim() : undefined,
        isPublic
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: isDark ? colors.bgSecondary : '#ffffff',
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: colors.shadowLg,
          overflow: 'hidden',
          animation: 'scaleUp 0.16s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: colors.accentLight,
                color: colors.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderPlus size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text }}>
                Save to My Collection
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: colors.textSecondary }}>
                Bookmark this friend's link to your workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textTertiary,
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Link Info Preview Box */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
              border: `1px solid ${colors.border}`,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: isDark ? '#272730' : '#ffffff',
                border: `1px solid ${colors.borderLight}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {faviconUrl ? (
                <img src={faviconUrl} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '11px', fontWeight: '700', color: colors.accent }}>
                  {domain.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h4
                style={{
                  margin: '0 0 3px 0',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  color: colors.text,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: '11.5px',
                  color: colors.textTertiary,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {url}
              </p>
            </div>
          </div>

          {/* Collection Picker */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: colors.text }}>
                Choose Target Collection
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.accent,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isCreatingNew ? 'Select Existing' : '+ New Collection'}
              </button>
            </div>

            {isCreatingNew ? (
              <input
                type="text"
                autoFocus
                placeholder="e.g. Read Later, Great Articles..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                  padding: '4px',
                }}
              >
                {collections.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '12.5px', color: colors.textSecondary }}>
                    No collections yet. Click "+ New Collection" above to create one.
                  </div>
                ) : (
                  collections.map((col) => {
                    const isSelected = selectedCollectionId === col.id;
                    return (
                      <div
                        key={col.id || col.collectionName}
                        onClick={() => setSelectedCollectionId(col.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: '7px',
                          cursor: 'pointer',
                          backgroundColor: isSelected
                            ? (isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)')
                            : 'transparent',
                          color: isSelected ? colors.accent : colors.text,
                          transition: 'background 0.12s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <Folder size={15} style={{ color: isSelected ? colors.accent : colors.textTertiary }} />
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: isSelected ? '600' : '400',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {col.collectionName || col.name}
                          </span>
                        </div>
                        {isSelected && <Check size={15} style={{ color: colors.accent, flexShrink: 0 }} />}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Visibility Checkbox */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
              border: `1px solid ${colors.border}`,
              marginBottom: '20px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', fontWeight: '500', color: colors.text }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ accentColor: colors.accent, width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {isPublic ? <Globe size={13} style={{ color: '#10b981' }} /> : <Lock size={13} style={{ color: colors.textTertiary }} />}
                Make this link public to my friends
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                padding: '9px 15px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                background: 'transparent',
                color: colors.textSecondary,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || (!isCreatingNew && !selectedCollectionId && collections.length > 0) || (isCreatingNew && !newCollectionName.trim())}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #6661f1 0%, #793fed 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                boxShadow: '0 2px 8px rgba(102, 97, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isSaving ? 'Saving...' : 'Save to Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

