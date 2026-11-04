import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Briefcase,
  MapPin,
  FileText,
  Share2,
  Plus,
  ExternalLink,
  Globe,
  Star,
  Sparkles,
  Clock,
  Heart,
  Bookmark,
  Check,
  Copy,
  RotateCcw,
  Camera,
  Upload,
  Trash2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Folder,
  Layers,
  X as CloseIcon,
} from 'lucide-react';
import { themes } from '../utils/themes';
import { api } from '../utils/api';

export function EditProfilePage({
  user,
  collections = [],
  links = [],
  onUpdateUser,
  onBack,
  onOpenCollection,
  theme = 'dark',
}) {
  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email] = useState(user?.email || '');
  const [roleTitle, setRoleTitle] = useState(user?.roleTitle || 'Staff Product Designer & Curation Lead');
  const [location, setLocation] = useState(user?.location || 'San Francisco, CA (UTC-7)');
  const [bio, setBio] = useState(
    user?.bio ||
      'Curating the web\'s best design systems, retro apparel, and frontend tools. Building thoughtful digital spaces.'
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(user?.coverUrl || '');

  // Social Links state (parsed from user.socialLinksJson or default)
  const defaultSocials = {
    twitter: '@alexkiradev',
    github: 'becauseiamkira',
    portfolio: 'alexkira.design',
    farcaster: '@alexkira',
  };

  const [socialLinks, setSocialLinks] = useState(() => {
    if (user?.socialLinksJson) {
      try {
        return JSON.parse(user.socialLinksJson);
      } catch {}
    }
    return defaultSocials;
  });

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState('available'); // 'available', 'checking', 'taken'
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [showAddSocialModal, setShowAddSocialModal] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState('Figma');
  const [newSocialHandle, setNewSocialHandle] = useState('');

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Character limit for bio
  const BIO_MAX_LENGTH = 240;

  // Real-time username availability check (debounced)
  useEffect(() => {
    if (!username || username === user?.username) {
      setUsernameStatus('available');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsername(username);
        setUsernameStatus(res?.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('available');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, user?.username]);

  // Show transient toast
  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 4000);
  };

  // Copy public profile link
  const handleCopyProfileLink = () => {
    const publicUrl = `https://linkcollect.io/@${username || 'user'}`;
    navigator.clipboard.writeText(publicUrl);
    setIsCopied(true);
    showFeedback('Public profile link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Discard changes
  const handleDiscard = () => {
    setName(user?.name || '');
    setUsername(user?.username || '');
    setRoleTitle(user?.roleTitle || 'Staff Product Designer & Curation Lead');
    setLocation(user?.location || 'San Francisco, CA (UTC-7)');
    setBio(
      user?.bio ||
        'Curating the web\'s best design systems, retro apparel, and frontend tools. Building thoughtful digital spaces.'
    );
    setAvatarUrl(user?.avatarUrl || '');
    setCoverUrl(user?.coverUrl || '');
    if (user?.socialLinksJson) {
      try {
        setSocialLinks(JSON.parse(user.socialLinksJson));
      } catch {}
    } else {
      setSocialLinks(defaultSocials);
    }
    showFeedback('Changes discarded.', 'info');
  };

  // Save changes
  const handleSave = async () => {
    if (!name.trim()) {
      showFeedback('Full Name is required.', 'error');
      return;
    }

    if (usernameStatus === 'taken') {
      showFeedback('Username is already taken. Please choose another.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        username: username.trim(),
        roleTitle: roleTitle.trim(),
        location: location.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || null,
        coverUrl: coverUrl.trim() || null,
        socialLinksJson: JSON.stringify(socialLinks),
      };

      const updated = await api.updateProfile(payload);
      if (onUpdateUser) {
        onUpdateUser(updated);
      }
      showFeedback('Profile & settings saved successfully!');
    } catch (err) {
      showFeedback(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Client-side image compression helper to keep payloads small and responsive
  const compressImageFile = (file, maxWidth, maxHeight, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.max(1, Math.round(width * ratio));
            height = Math.max(1, Math.round(height * ratio));
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target.result);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Avatar upload handler (client-side compression & base64 preview)
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showFeedback('Photo must be 8MB or less.', 'error');
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 400, 400, 0.85);
      setAvatarUrl(compressedDataUrl);
      showFeedback('Avatar photo updated. Click Save Changes to apply.');
    } catch {
      showFeedback('Could not process photo. Please choose another image.', 'error');
    }
  };

  // Cover photo upload handler (client-side compression & base64 preview)
  const handleCoverFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showFeedback('Cover photo must be 10MB or less.', 'error');
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 1600, 600, 0.85);
      setCoverUrl(compressedDataUrl);
      showFeedback('Cover banner updated. Click Save Changes to apply.');
    } catch {
      showFeedback('Could not process cover photo. Please choose another image.', 'error');
    }
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    showFeedback('Avatar removed.');
  };

  // Add / Quick connect social
  const handleAddSocial = (platform, handle) => {
    const key = platform.toLowerCase().replace(/[^a-z0-9]/g, '');
    setSocialLinks((prev) => ({
      ...prev,
      [key]: handle,
    }));
    setShowAddSocialModal(false);
    setNewSocialHandle('');
    showFeedback(`Connected ${platform}!`);
  };

  const handleRemoveSocial = (platformKey) => {
    setSocialLinks((prev) => {
      const copy = { ...prev };
      delete copy[platformKey];
      return copy;
    });
  };

  // Dynamic Highlight calculations from user's live collections & links
  const mostViewedCollection =
    collections.find((c) => c.isPublic) || collections[0] || {
      id: 1,
      name: 'Design Engineering Systems & Retro Apparel',
      description: 'Comprehensive curated repository spanning atomic design tokens, retro sportswear...',
    };

  const collectionLinksCount = links.filter((l) => l.collectionId === mostViewedCollection.id).length;

  const mostViewedLink = links[0] || {
    id: 101,
    url: 'https://github.com/becauseiamkira',
    title: 'Modern CSS Grid & Fluid Typography Systems',
  };

  const highestRatedLink = links.find((l) => (l.rating || 0) >= 4) || links[1] || {
    id: 102,
    url: 'https://msretro.com/archive',
    title: 'Barca 1999 Vintage Jersey Half Sleeve Collector Item',
    rating: 5.0,
  };

  const recentlyFavorited = links.find((l) => l.isFavorite) || links[2] || {
    id: 103,
    url: 'https://linear.app/motion',
    title: 'Linear Rebuild: Motion & Micro-interactions Guide',
  };

  const recentlyAdded = links[links.length - 1] || {
    id: 104,
    url: 'https://ui.shadcn.com',
    title: 'shadcn/ui - Accessible component primitives for React',
  };

  return (
    <div
      style={{
        minHeight: '100%',
        width: '100%',
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        padding: '24px 32px 60px 32px',
        overflowY: 'auto',
      }}
    >
      {/* Toast Feedback Notification */}
      {feedback.text && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 100,
            padding: '10px 18px',
            borderRadius: '10px',
            backgroundColor:
              feedback.type === 'error'
                ? '#ef4444'
                : feedback.type === 'info'
                ? '#3b82f6'
                : '#10b981',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            animation: 'scaleUp 0.2s ease-out forwards',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {feedback.type === 'error' ? <CloseIcon size={16} /> : <Check size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* TOP HEADER & ACTION BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          {/* Breadcrumb */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: colors.textTertiary,
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
                fontSize: '12px',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = colors.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.textSecondary)}
            >
              Workspace
            </button>
            <ChevronRight size={13} />
            <span style={{ color: colors.text, fontWeight: '500' }}>Profile &amp; Settings</span>
          </div>

          <h1
            style={{
              margin: '0 0 4px 0',
              fontSize: '25px',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-heading)',
              color: colors.text,
            }}
          >
            Profile &amp; Account Settings
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: colors.textSecondary }}>
            Manage your public presence, linked accounts, and workspace defaults.
          </p>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Public Profile link pill */}
          <div
            onClick={handleCopyProfileLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 12px',
              borderRadius: '8px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
              border: `1px solid ${colors.border}`,
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              transition: 'all 0.15s ease',
            }}
            title="Click to copy public profile link"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'inline-block',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
              }}
            />
            <span style={{ color: colors.textTertiary }}>linkcollect.io/</span>
            <span style={{ color: colors.text, fontWeight: '600' }}>@{username || 'user'}</span>
            {isCopied ? (
              <Check size={14} color="#10b981" />
            ) : (
              <Copy size={13} color={colors.textTertiary} />
            )}
          </div>

          {/* Discard button */}
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              backgroundColor: 'transparent',
              color: colors.text,
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Discard
          </button>

          {/* Save Changes button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.15s ease',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Check size={15} strokeWidth={2.5} />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* COVER BANNER & PROFILE HERO */}
      <div
        style={{
          borderRadius: '18px',
          border: `1px solid ${colors.border}`,
          backgroundColor: isDark ? colors.cardBg : '#ffffff',
          overflow: 'hidden',
          marginBottom: '24px',
          boxShadow: isDark ? '0 12px 30px rgba(0, 0, 0, 0.5)' : colors.shadowMd,
        }}
      >
        {/* Cover Image Canvas */}
        <div
          style={{
            height: '170px',
            width: '100%',
            position: 'relative',
            background: coverUrl
              ? `url(${coverUrl}) center/cover no-repeat`
              : 'radial-gradient(ellipse at 70% 30%, #2e1065 0%, #1e1b4b 45%, #0f172a 100%)',
          }}
        >
          {/* Cover Controls (Top Right) */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <button
              type="button"
              onClick={() => showFeedback('Drag to reposition cover photo.')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '7px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} />
              <span>Reposition</span>
            </button>

            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '7px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <Camera size={13} />
              <span>Change Cover</span>
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleCoverFileChange}
            />
          </div>
        </div>

        {/* Profile Identity Bar (Overlapping avatar) */}
        <div
          style={{
            padding: '0 28px 24px 28px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
            {/* Avatar with Glow Ring */}
            <div style={{ position: 'relative', marginTop: '-48px' }}>
              <div
                style={{
                  width: '94px',
                  height: '94px',
                  borderRadius: '24px',
                  border: `4px solid ${isDark ? colors.cardBg : '#ffffff'}`,
                  backgroundColor: '#1f1e2e',
                  background: avatarUrl
                    ? `url(${avatarUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '32px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.45)',
                  overflow: 'hidden',
                }}
              >
                {!avatarUrl && (name ? name.charAt(0).toUpperCase() : 'U')}
              </div>
              {/* Online Green Indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  border: `3px solid ${isDark ? colors.cardBg : '#ffffff'}`,
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
                }}
              />
            </div>

            {/* User Title & Badges */}
            <div style={{ paddingBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '21px',
                    fontWeight: '700',
                    color: colors.text,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {name || 'Alex Kira Morgan'}
                </h2>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    color: '#a78bfa',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <Star size={11} fill="#a78bfa" />
                  <span>PRO MEMBER</span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10.5px',
                    fontWeight: '600',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <Sparkles size={11} />
                  <span>2.5k reach</span>
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '12.5px', color: colors.textSecondary }}>
                <span>{roleTitle || 'Staff Product Designer & Curation Lead'}</span>
                <span style={{ margin: '0 8px' }}>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={12} color={colors.textTertiary} />
                  <span>{location || 'San Francisco, CA'}</span>
                </span>
              </p>
            </div>
          </div>

          {/* Avatar Upload Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                color: colors.text,
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <Upload size={13} />
              <span>Upload Photo</span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarFileChange}
            />

            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '12.5px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '6px 8px',
                }}
              >
                Remove
              </button>
            )}

            <span style={{ fontSize: '11px', color: colors.textTertiary }}>PNG or JPG ≤ 2MB</span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Settings & Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* CARD 1: Personal Information */}
          <div
            style={{
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              border: `1px solid ${colors.border}`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : colors.shadowSm,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8b5cf6',
                  }}
                >
                  <User size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: colors.text }}>
                    Personal Information
                  </h3>
                  <p style={{ margin: 0, fontSize: '11.5px', color: colors.textSecondary }}>
                    Your profile details displayed across public collections.
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: '600',
                  color: colors.textTertiary,
                  fontFamily: 'monospace',
                }}
              >
                v2.4 schema
              </span>
            </div>

            {/* Inputs Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Row 1: Full Name & Username */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      marginBottom: '6px',
                    }}
                  >
                    Full Name
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <User size={14} style={{ position: 'absolute', left: '12px', color: colors.textTertiary }} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Kira Morgan"
                      style={{
                        width: '100%',
                        padding: '9.5px 12px 9.5px 34px',
                        borderRadius: '9px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                        color: colors.text,
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = colors.accent)}
                      onBlur={(e) => (e.target.style.borderColor = colors.border)}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: '600', color: colors.textSecondary }}>
                      Username
                    </label>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: '600',
                        color: usernameStatus === 'taken' ? '#ef4444' : '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: usernameStatus === 'taken' ? '#ef4444' : '#10b981',
                        }}
                      />
                      {usernameStatus === 'checking'
                        ? 'Checking...'
                        : usernameStatus === 'taken'
                        ? 'Taken'
                        : 'Available'}
                    </span>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        fontSize: '12px',
                        color: colors.textTertiary,
                        userSelect: 'none',
                      }}
                    >
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="becauseiamkira1986"
                      style={{
                        width: '100%',
                        padding: '9.5px 12px 9.5px 28px',
                        borderRadius: '9px',
                        border: `1px solid ${usernameStatus === 'taken' ? '#ef4444' : colors.border}`,
                        backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                        color: colors.text,
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = colors.accent)}
                      onBlur={(e) => (e.target.style.borderColor = colors.border)}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email Address & Role / Title */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: '600', color: colors.textSecondary }}>
                      Email Address
                    </label>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <Check size={11} /> Verified
                    </span>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={14} style={{ position: 'absolute', left: '12px', color: colors.textTertiary }} />
                    <input
                      type="email"
                      value={email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '9.5px 12px 9.5px 34px',
                        borderRadius: '9px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f1f5f9',
                        color: colors.textSecondary,
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      marginBottom: '6px',
                    }}
                  >
                    Role / Title
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Briefcase size={14} style={{ position: 'absolute', left: '12px', color: colors.textTertiary }} />
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="Staff Product Designer & Curation Lead"
                      style={{
                        width: '100%',
                        padding: '9.5px 12px 9.5px 34px',
                        borderRadius: '9px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                        color: colors.text,
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = colors.accent)}
                      onBlur={(e) => (e.target.style.borderColor = colors.border)}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Location & Timezone */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    color: colors.textSecondary,
                    marginBottom: '6px',
                  }}
                >
                  Location &amp; Timezone
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <MapPin size={14} style={{ position: 'absolute', left: '12px', color: colors.textTertiary }} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA (UTC-7)"
                    style={{
                      width: '100%',
                      padding: '9.5px 12px 9.5px 34px',
                      borderRadius: '9px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                      color: colors.text,
                      fontSize: '13px',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = colors.accent)}
                    onBlur={(e) => (e.target.style.borderColor = colors.border)}
                  />
                </div>
              </div>

              {/* Row 4: Bio */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: '600', color: colors.textSecondary }}>
                    Bio
                  </label>
                  <span
                    style={{
                      fontSize: '11px',
                      color: bio.length > BIO_MAX_LENGTH ? '#ef4444' : colors.textTertiary,
                    }}
                  >
                    {bio.length} / {BIO_MAX_LENGTH}
                  </span>
                </div>
                <textarea
                  value={bio}
                  maxLength={BIO_MAX_LENGTH}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Curating the web's best design systems, retro apparel, and frontend tools..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '9px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                    color: colors.text,
                    fontSize: '13px',
                    lineHeight: '1.5',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.accent)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                />
                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: colors.textTertiary }}>
                  Displayed on your public profile header and link collection feeds.
                </p>
              </div>
            </div>
          </div>

          {/* CARD 2: Social Profiles & Portfolios */}
          <div
            style={{
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              border: `1px solid ${colors.border}`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : colors.shadowSm,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8b5cf6',
                  }}
                >
                  <Share2 size={16} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: colors.text }}>
                      Social Profiles &amp; Portfolios
                    </h3>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: '700',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(99, 102, 241, 0.12)',
                        color: '#818cf8',
                      }}
                    >
                      {Object.keys(socialLinks).length} Connected
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11.5px', color: colors.textSecondary }}>
                    Verified badges displayed on your public profile header.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddSocialModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>Add Connection</span>
              </button>
            </div>

            {/* 2x2 Connected Profiles Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              {/* X / Twitter */}
              {socialLinks.twitter !== undefined && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? colors.bgSecondary : '#f8fafc',
                    border: `1px solid ${colors.border}`,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: colors.text }}>X / Twitter</span>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Active
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#818cf8', fontWeight: '500' }}>
                    {socialLinks.twitter}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: colors.textTertiary }}>
                    <span>Updated 2d ago</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSocial('twitter')}
                      style={{ background: 'none', border: 'none', padding: 0, color: colors.textTertiary, cursor: 'pointer' }}
                      title="Disconnect"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* GitHub */}
              {socialLinks.github !== undefined && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? colors.bgSecondary : '#f8fafc',
                    border: `1px solid ${colors.border}`,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: colors.text }}>GitHub</span>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Active
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#818cf8', fontWeight: '500' }}>
                    {socialLinks.github}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: colors.textTertiary }}>
                    <span>Synced repo stars</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSocial('github')}
                      style={{ background: 'none', border: 'none', padding: 0, color: colors.textTertiary, cursor: 'pointer' }}
                      title="Disconnect"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {socialLinks.portfolio !== undefined && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? colors.bgSecondary : '#f8fafc',
                    border: `1px solid ${colors.border}`,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: colors.text }}>Portfolio</span>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#38bdf8', padding: '1px 5px', borderRadius: '3px', backgroundColor: 'rgba(56, 189, 248, 0.1)' }}>
                      Primary Domain
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#818cf8', fontWeight: '500' }}>
                    {socialLinks.portfolio}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: colors.textTertiary }}>
                    <span>SSL verified</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSocial('portfolio')}
                      style={{ background: 'none', border: 'none', padding: 0, color: colors.textTertiary, cursor: 'pointer' }}
                      title="Disconnect"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Farcaster */}
              {socialLinks.farcaster !== undefined && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? colors.bgSecondary : '#f8fafc',
                    border: `1px solid ${colors.border}`,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: colors.text }}>Farcaster</span>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Active
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#818cf8', fontWeight: '500' }}>
                    {socialLinks.farcaster}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: colors.textTertiary }}>
                    <span>FID: 18492</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSocial('farcaster')}
                      style={{ background: 'none', border: 'none', padding: 0, color: colors.textTertiary, cursor: 'pointer' }}
                      title="Disconnect"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Connect Services */}
            <div>
              <p
                style={{
                  margin: '0 0 10px 0',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: colors.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                ⚡ Quick Connect Services
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { name: 'Figma', color: '#a855f7' },
                  { name: 'Dribbble', color: '#ec4899' },
                  { name: 'LinkedIn', color: '#0ea5e9' },
                  { name: 'Custom URL', color: '#6366f1' },
                ].map((srv) => (
                  <button
                    key={srv.name}
                    type="button"
                    onClick={() => {
                      setNewSocialPlatform(srv.name);
                      setShowAddSocialModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                      color: colors.text,
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = srv.color;
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc';
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: srv.color }} />
                    <span>{srv.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Curation & Activity Highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#818cf8" />
              <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '700', color: colors.text }}>
                Curation &amp; Activity Highlights
              </h3>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                letterSpacing: '0.04em',
              }}
            >
              LIVE FEED
            </span>
          </div>

          {/* CARD 1: Most Viewed Collection */}
          <div
            style={{
              padding: '18px',
              borderRadius: '14px',
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              border: `1px solid ${colors.border}`,
              boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.25)' : colors.shadowSm,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  color: '#a78bfa',
                  textTransform: 'uppercase',
                }}
              >
                MOST VIEWED COLLECTION
              </span>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#34d399',
                }}
              >
                Top Tier
              </span>
            </div>

            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '700', color: colors.text }}>
              {mostViewedCollection.name}
            </h4>
            <p
              style={{
                margin: '0 0 12px 0',
                fontSize: '11.5px',
                color: colors.textSecondary,
                lineHeight: '1.4',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {mostViewedCollection.description || 'Comprehensive curated repository for quick reference.'}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: isDark ? colors.bgSecondary : '#f8fafc',
                marginBottom: '12px',
                fontSize: '11.5px',
              }}
            >
              <div>
                <span style={{ fontWeight: '700', color: colors.text }}>18.4k </span>
                <span style={{ color: colors.textTertiary }}>Views</span>
              </div>
              <div>
                <span style={{ fontWeight: '700', color: colors.text }}>{collectionLinksCount || 27} </span>
                <span style={{ color: colors.textTertiary }}>Links</span>
              </div>
              <div>
                <span style={{ fontWeight: '700', color: colors.text }}>142 </span>
                <span style={{ color: colors.textTertiary }}>Followers</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                Public Feed
              </span>
              <button
                type="button"
                onClick={() => onOpenCollection && onOpenCollection(mostViewedCollection)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <span>Open Collection</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* CARD 2: Most Viewed Link */}
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  color: '#a78bfa',
                  textTransform: 'uppercase',
                }}
              >
                MOST VIEWED LINK
              </span>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981' }}>+24%</span>
            </div>

            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: colors.textTertiary }}>
              {mostViewedLink.url?.replace(/^https?:\/\//, '').split('/')[0]} • 3 min read
            </p>
            <h4
              style={{
                margin: '0 0 10px 0',
                fontSize: '13px',
                fontWeight: '600',
                color: colors.text,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {mostViewedLink.title}
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
              <span style={{ color: colors.textSecondary }}>8.9k total visits</span>
              <a
                href={mostViewedLink.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: colors.accent,
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                <span>Visit</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* CARD 3: Highest Rated */}
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  textTransform: 'uppercase',
                }}
              >
                HIGHEST RATED
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#f59e0b' }}>⭐ 5.0 (128)</span>
            </div>

            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: colors.textTertiary }}>
              {highestRatedLink.url?.replace(/^https?:\/\//, '').split('/')[0]}
            </p>
            <h4
              style={{
                margin: '0 0 10px 0',
                fontSize: '13px',
                fontWeight: '600',
                color: colors.text,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {highestRatedLink.title}
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
              <span style={{ color: colors.textTertiary }}>Public Bookmark</span>
              <span style={{ color: colors.accent, cursor: 'pointer', fontWeight: '600' }}>Details &amp; Rating &gt;</span>
            </div>
          </div>

          {/* CARD 4: Recently Favorited */}
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  color: '#f43f5e',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Heart size={10} fill="#f43f5e" /> RECENTLY FAVORITED
              </span>
              <span style={{ fontSize: '11px', color: colors.textTertiary }}>45 mins ago</span>
            </div>

            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: colors.textTertiary }}>
              {recentlyFavorited.url?.replace(/^https?:\/\//, '').split('/')[0]} • UI Dynamics
            </p>
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '13px',
                fontWeight: '600',
                color: colors.text,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {recentlyFavorited.title}
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
              <span style={{ color: colors.textSecondary }}>Pinned to Favourites</span>
              <a href={recentlyFavorited.url} target="_blank" rel="noreferrer" style={{ color: colors.accent }}>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* CARD 5: Recently Added */}
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Clock size={10} /> RECENTLY ADDED
              </span>
              <span style={{ fontSize: '11px', color: colors.textTertiary }}>2 hours ago</span>
            </div>

            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: colors.textTertiary }}>
              {recentlyAdded.url?.replace(/^https?:\/\//, '').split('/')[0]} • Frontend Primitives
            </p>
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '13px',
                fontWeight: '600',
                color: colors.text,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {recentlyAdded.title}
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
              <span style={{ color: colors.textTertiary }}>Captured via Chrome Extension</span>
              <a
                href={recentlyAdded.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: colors.accent,
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                <span>Visit</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Add Social Connection */}
      {showAddSocialModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              border: `1px solid ${colors.border}`,
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              animation: 'scaleUp 0.15s ease-out forwards',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: colors.text }}>
                Add Social Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSocialModal(false)}
                style={{ background: 'none', border: 'none', color: colors.textTertiary, cursor: 'pointer' }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
                  Platform
                </label>
                <select
                  value={newSocialPlatform}
                  onChange={(e) => setNewSocialPlatform(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                    color: colors.text,
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="Twitter">X / Twitter</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Portfolio">Portfolio / Website</option>
                  <option value="Farcaster">Farcaster</option>
                  <option value="Figma">Figma</option>
                  <option value="Dribbble">Dribbble</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Custom">Custom URL</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
                  Handle or URL
                </label>
                <input
                  type="text"
                  value={newSocialHandle}
                  onChange={(e) => setNewSocialHandle(e.target.value)}
                  placeholder="@handle or https://..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                    color: colors.text,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowAddSocialModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: 'transparent',
                  color: colors.text,
                  fontSize: '12.5px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newSocialHandle.trim()) {
                    handleAddSocial(newSocialPlatform, newSocialHandle.trim());
                  }
                }}
                disabled={!newSocialHandle.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: !newSocialHandle.trim() ? 'not-allowed' : 'pointer',
                  opacity: !newSocialHandle.trim() ? 0.6 : 1,
                }}
              >
                Connect Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

