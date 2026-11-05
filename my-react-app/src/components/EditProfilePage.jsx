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
  Users,
  UserPlus,
  MessageSquare,
  Link2,
  Search,
  Award,
  TrendingUp,
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

  // Form state (loaded strictly from user DB record)
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email] = useState(user?.email || '');
  const [roleTitle, setRoleTitle] = useState(user?.roleTitle || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(user?.coverUrl || '');

  // Social Links state (parsed from user.socialLinksJson or empty)
  const [socialLinks, setSocialLinks] = useState(() => {
    if (user?.socialLinksJson) {
      try {
        const parsed = JSON.parse(user.socialLinksJson);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {}
    }
    return {};
  });

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState('available'); // 'available', 'checking', 'taken'
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [showAddSocialModal, setShowAddSocialModal] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState('Twitter');
  const [newSocialHandle, setNewSocialHandle] = useState('');

  // Friends & Network state (populated strictly from DB)
  const [friendsList, setFriendsList] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [inviteSearchResults, setInviteSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [inviteSentIds, setInviteSentIds] = useState(new Set());
  const [isInviteCopied, setIsInviteCopied] = useState(false);

  // Load real friends on mount from DB
  useEffect(() => {
    let isMounted = true;
    setIsLoadingFriends(true);
    api.getFriends()
      .then((data) => {
        if (isMounted) {
          setFriendsList(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (isMounted) setFriendsList([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingFriends(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Search users for invite modal (debounced)
  useEffect(() => {
    if (!inviteSearchQuery.trim() || inviteSearchQuery.trim().length < 2) {
      setInviteSearchResults([]);
      return;
    }

    setIsSearchingUsers(true);
    const timer = setTimeout(async () => {
      try {
        const results = await api.searchUsers(inviteSearchQuery.trim());
        setInviteSearchResults(Array.isArray(results) ? results : []);
      } catch {
        setInviteSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [inviteSearchQuery]);

  const handleSendInvite = async (targetUser) => {
    try {
      await api.sendFriendRequest(targetUser.username || targetUser.email);
      setInviteSentIds((prev) => new Set([...prev, targetUser.id]));
      showFeedback(`Invite sent to @${targetUser.username}!`);
    } catch (err) {
      showFeedback(err.message || 'Failed to send invite.', 'error');
    }
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `https://linkcollect.io/invite/@${username || 'user'}`;
    navigator.clipboard.writeText(inviteUrl);
    setIsInviteCopied(true);
    showFeedback('Invite link copied to clipboard!');
    setTimeout(() => setIsInviteCopied(false), 2500);
  };

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
    setRoleTitle(user?.roleTitle || '');
    setLocation(user?.location || '');
    setBio(user?.bio || '');
    setAvatarUrl(user?.avatarUrl || '');
    setCoverUrl(user?.coverUrl || '');
    if (user?.socialLinksJson) {
      try {
        const parsed = JSON.parse(user.socialLinksJson);
        setSocialLinks(parsed && typeof parsed === 'object' ? parsed : {});
      } catch {
        setSocialLinks({});
      }
    } else {
      setSocialLinks({});
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

  // Helper to match links for a collection by ID or collection name
  const getLinksForCollection = (col) => {
    if (!col) return [];
    return links.filter(
      (l) =>
        (col.id && l.collectionId === col.id) ||
        (col.collectionName && l.collectionName && l.collectionName.toLowerCase() === col.collectionName.toLowerCase()) ||
        (col.name && l.collectionName && l.collectionName.toLowerCase() === col.name.toLowerCase())
    );
  };

  // Dynamic Highlight calculations: find the top collection by views and link count
  const sortedCollections = [...collections].sort((a, b) => {
    const viewsB = getLinksForCollection(b).reduce((sum, l) => sum + (l.watchCount || 0), 0);
    const viewsA = getLinksForCollection(a).reduce((sum, l) => sum + (l.watchCount || 0), 0);
    if (viewsB !== viewsA) return viewsB - viewsA;
    const linksB = b.totalLinks || getLinksForCollection(b).length || 0;
    const linksA = a.totalLinks || getLinksForCollection(a).length || 0;
    return linksB - linksA;
  });

  const topCollection = sortedCollections[0] || null;
  const topCollectionLinks = getLinksForCollection(topCollection);
  const topCollectionLinksCount = topCollectionLinks.length || topCollection?.totalLinks || 0;
  const topCollectionViews = topCollectionLinks.reduce((sum, l) => sum + (l.watchCount || 0), 0);

  // Link with highest watch/visit count from DB (or first link if watches are 0)
  const mostViewedLink =
    links.length > 0
      ? [...links].sort((a, b) => (b.watchCount || 0) - (a.watchCount || 0))[0]
      : null;

  // Starred / Favorited link from DB
  const recentlyFavorited = links.find((l) => l.isFavorite) || null;

  // Connected socials count from user DB record
  const connectedSocialsCount = Object.keys(socialLinks).filter((k) => Boolean(socialLinks[k])).length;

  // Curators strictly from DB friendships
  const displayCurators = Array.isArray(friendsList) ? friendsList : [];

  // Helper formatting for social platforms
  const formatPlatformName = (key) => {
    const map = {
      twitter: 'X / Twitter',
      x: 'X / Twitter',
      github: 'GitHub',
      portfolio: 'Portfolio / Website',
      website: 'Portfolio / Website',
      farcaster: 'Farcaster',
      figma: 'Figma',
      dribbble: 'Dribbble',
      linkedin: 'LinkedIn',
    };
    return map[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const getPlatformSubtext = (key) => {
    const map = {
      twitter: 'Connected account',
      x: 'Connected account',
      github: 'Synced repository profile',
      portfolio: 'Primary Domain',
      website: 'Personal Website',
      farcaster: 'Decentralized social',
      figma: 'Design workspace',
      dribbble: 'Creative portfolio',
      linkedin: 'Professional network',
    };
    return map[key.toLowerCase()] || 'Connected profile';
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);
      if (diffSec < 60) return 'just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      if (diffDays < 30) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'recently';
    }
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
                  {name || user?.name || 'Unnamed Curator'}
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
                  <span>{links.length + collections.length > 0 ? `${links.length} links • ${collections.length} collections` : 'New Curator'}</span>
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '12.5px', color: colors.textSecondary }}>
                {roleTitle ? (
                  <span>{roleTitle}</span>
                ) : (
                  <span style={{ color: colors.textTertiary, fontStyle: 'italic' }}>No role specified</span>
                )}
                <span style={{ margin: '0 8px' }}>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={12} color={colors.textTertiary} />
                  {location ? (
                    <span>{location}</span>
                  ) : (
                    <span style={{ color: colors.textTertiary, fontStyle: 'italic' }}>Location not specified</span>
                  )}
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

      {/* MAIN TWO-COLUMN CONTENT GRID (60% Left / 40% Right) */}
      <div
        className="edit-profile-layout-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Settings & Forms (60%) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
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
                      placeholder="Your full name"
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
                      placeholder="username"
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
                      placeholder="e.g. Lead Designer, Software Engineer..."
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
                    placeholder="e.g. San Francisco, CA (UTC-7)"
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
                  placeholder="Write a brief bio about yourself and your curations..."
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
                      {connectedSocialsCount} Connected
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

            {/* Connected Profiles Grid or Empty State */}
            {connectedSocialsCount === 0 ? (
              <div
                style={{
                  padding: '28px 20px',
                  borderRadius: '12px',
                  border: `1px dashed ${colors.border}`,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              >
                <Share2 size={24} style={{ color: colors.textTertiary, margin: '0 auto 8px', display: 'block' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: '600', color: colors.text }}>
                  No social profiles connected yet
                </h4>
                <p style={{ margin: '0 auto', maxWidth: '380px', fontSize: '12px', color: colors.textTertiary, lineHeight: '1.4' }}>
                  Link your Twitter, GitHub, personal portfolio, or design accounts to showcase them on your public profile header.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                {Object.entries(socialLinks)
                  .filter(([_, val]) => Boolean(val))
                  .map(([key, handle]) => (
                    <div
                      key={key}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: isDark ? colors.bgSecondary : '#f8fafc',
                        border: `1px solid ${colors.border}`,
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: colors.text }}>
                          {formatPlatformName(key)}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Active
                        </span>
                      </div>
                      <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#818cf8', fontWeight: '500', wordBreak: 'break-all' }}>
                        {handle}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: colors.textTertiary }}>
                        <span>{getPlatformSubtext(key)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSocial(key)}
                          style={{ background: 'none', border: 'none', padding: 0, color: colors.textTertiary, cursor: 'pointer' }}
                          title="Disconnect"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

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

        {/* RIGHT COLUMN: Curation & Activity Highlights (40%) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
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

          {/* CARD 1: Top / Most Viewed Collection */}
          {topCollection ? (
            <div
              style={{
                padding: '22px 24px',
                borderRadius: '18px',
                backgroundColor: isDark ? colors.cardBg : '#ffffff',
                border: `1px solid ${colors.border}`,
                boxShadow: isDark ? '0 8px 30px rgba(0, 0, 0, 0.4)' : colors.shadowSm,
              }}
            >
              {/* Header Badges: Most Viewed Collection & Top Tier */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    color: '#818cf8',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  <Award size={13} strokeWidth={2.2} />
                  <span>MOST VIEWED COLLECTION</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#34d399' }}>
                  <TrendingUp size={14} strokeWidth={2.2} />
                  <span>Top Tier</span>
                </div>
              </div>

              {/* Title */}
              <h4
                style={{
                  margin: '0 0 10px 0',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: colors.text,
                  letterSpacing: '-0.02em',
                  lineHeight: '1.3',
                }}
              >
                {topCollection.collectionName || topCollection.name || topCollection.title || 'Untitled Collection'}
              </h4>

              {/* Description (shown only when it exists) */}
              {Boolean(topCollection.description?.trim()) && (
                <p
                  style={{
                    margin: '0 0 18px 0',
                    fontSize: '13px',
                    color: isDark ? '#94a3b8' : colors.textSecondary,
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {topCollection.description}
                </p>
              )}

              {/* Stats Box: Views, Links, and Type of Collection */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  backgroundColor: isDark ? 'rgba(0, 0, 0, 0.32)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e2e8f0',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: colors.text, lineHeight: '1.2' }}>
                    {topCollectionViews >= 1000
                      ? `${(topCollectionViews / 1000).toFixed(1)}k`
                      : topCollectionViews || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : colors.textTertiary, marginTop: '4px' }}>
                    Views
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#34d399', lineHeight: '1.2' }}>
                    {topCollectionLinksCount || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : colors.textTertiary, marginTop: '4px' }}>
                    Links
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#c084fc', lineHeight: '1.2' }}>
                    {topCollection.isPublic ? 'Public' : 'Private'}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : colors.textTertiary, marginTop: '4px' }}>
                    Type
                  </div>
                </div>
              </div>

              {/* Bottom Row: Public Feed / Private Collection Indicator & Open Collection Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isDark ? '#94a3b8' : colors.textSecondary, fontWeight: '500' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      display: 'inline-block',
                      boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)',
                    }}
                  />
                  <span>{topCollection.isPublic ? 'Public Feed' : 'Private Collection'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenCollection && onOpenCollection(topCollection)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '9px',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    backgroundColor: isDark ? 'rgba(99, 102, 241, 0.18)' : '#e0e7ff',
                    color: isDark ? '#c7d2fe' : '#4338ca',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(99, 102, 241, 0.28)' : '#c7d2fe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(99, 102, 241, 0.18)' : '#e0e7ff';
                  }}
                >
                  <span>Open Collection</span>
                  <ArrowRight size={13} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '24px 20px',
                borderRadius: '14px',
                backgroundColor: isDark ? colors.cardBg : '#ffffff',
                border: `1px dashed ${colors.border}`,
                textAlign: 'center',
                boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.25)' : colors.shadowSm,
              }}
            >
              <Folder size={26} style={{ color: colors.textTertiary, margin: '0 auto 8px', display: 'block' }} />
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: '600', color: colors.text }}>
                No collections yet
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: colors.textTertiary, lineHeight: '1.4' }}>
                Create collections in your workspace to feature your top curation here.
              </p>
            </div>
          )}

          {/* CARD 2: Most Viewed Link */}
          {mostViewedLink ? (
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
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981' }}>
                  {mostViewedLink.watchCount || 0} visits
                </span>
              </div>

              <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: colors.textTertiary }}>
                {mostViewedLink.url?.replace(/^https?:\/\//, '').split('/')[0]}
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
                {mostViewedLink.title || mostViewedLink.url}
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ color: colors.textSecondary }}>
                  {mostViewedLink.watchCount || 0} {mostViewedLink.watchCount === 1 ? 'total visit' : 'total visits'}
                </span>
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
          ) : (
            <div
              style={{
                padding: '20px',
                borderRadius: '14px',
                backgroundColor: isDark ? colors.cardBg : '#ffffff',
                border: `1px dashed ${colors.border}`,
                textAlign: 'center',
              }}
            >
              <Bookmark size={24} style={{ color: colors.textTertiary, margin: '0 auto 8px', display: 'block' }} />
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: colors.text }}>
                No links saved yet
              </h4>
              <p style={{ margin: 0, fontSize: '11.5px', color: colors.textTertiary }}>
                Add links to your workspace to track visits and views.
              </p>
            </div>
          )}

          {/* CARD 3: Recently Favorited */}
          {recentlyFavorited ? (
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: isDark ? colors.cardBg : '#ffffff',
                border: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
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
                <span style={{ fontSize: '11px', color: colors.textTertiary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} /> {formatRelativeTime(recentlyFavorited.updatedAt || recentlyFavorited.createdAt)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(244, 63, 94, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f43f5e',
                    flexShrink: 0,
                  }}
                >
                  <Heart size={15} fill="#f43f5e" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: colors.textTertiary }}>
                    {recentlyFavorited.url?.replace(/^https?:\/\//, '').split('/')[0]}
                    {(() => {
                      const col = collections.find((c) => c.id === recentlyFavorited.collectionId || (c.collectionName && c.collectionName === recentlyFavorited.collectionName));
                      return col ? (
                        <>
                          {' • '}
                          <span style={{ color: '#a78bfa' }}>{col.collectionName || col.name}</span>
                        </>
                      ) : null;
                    })()}
                  </p>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '12.5px',
                      fontWeight: '600',
                      color: colors.text,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {recentlyFavorited.title || recentlyFavorited.url}
                  </h4>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Folder size={12} color={colors.textTertiary} />
                  <span>Pinned to Favourites</span>
                </span>
                <a href={recentlyFavorited.url} target="_blank" rel="noreferrer" style={{ color: colors.accent, display: 'flex', alignItems: 'center' }}>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '20px',
                borderRadius: '14px',
                backgroundColor: isDark ? colors.cardBg : '#ffffff',
                border: `1px dashed ${colors.border}`,
                textAlign: 'center',
              }}
            >
              <Heart size={24} style={{ color: colors.textTertiary, margin: '0 auto 8px', display: 'block' }} />
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: colors.text }}>
                No favorited links yet
              </h4>
              <p style={{ margin: 0, fontSize: '11.5px', color: colors.textTertiary }}>
                Star your favorite links in any collection to feature them here.
              </p>
            </div>
          )}

          {/* CARD 4: Friends & Network */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8',
                  }}
                >
                  <Users size={16} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: colors.text }}>
                    Friends &amp; Network
                  </h4>
                  <p style={{ margin: 0, fontSize: '11px', color: colors.textTertiary }}>
                    Connected curators
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981' }}>
                    {friendsList.length} Connected
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.textTertiary,
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="View Collaborators"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Curators List or Loading or Empty State */}
            {isLoadingFriends ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: colors.textTertiary }}>
                <Loader2 size={18} className="animate-spin" style={{ margin: '0 auto 6px', display: 'block', color: colors.accent }} />
                <span style={{ fontSize: '12px' }}>Loading curators...</span>
              </div>
            ) : friendsList.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  borderRadius: '12px',
                  border: `1px dashed ${colors.border}`,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                  textAlign: 'center',
                }}
              >
                <Users size={24} style={{ color: colors.textTertiary, margin: '0 auto 8px', display: 'block' }} />
                <h5 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: colors.text }}>
                  No connected curators yet
                </h5>
                <p style={{ margin: 0, fontSize: '11.5px', color: colors.textTertiary, lineHeight: '1.4' }}>
                  Invite fellow curators or friends to share public feeds and collaborate on collections.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {friendsList.map((curator) => (
                  <div
                    key={curator.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '11px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.025)' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.accent;
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.025)' : '#f8fafc';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      {/* Avatar with relative online dot */}
                      <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                        <img
                          src={curator.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${curator.username}`}
                          alt={curator.name || curator.username}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            backgroundColor: isDark ? colors.bgTertiary : '#e2e8f0',
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-1px',
                            right: '-1px',
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            border: `2px solid ${isDark ? colors.cardBg : '#ffffff'}`,
                            backgroundColor: '#10b981',
                          }}
                        />
                      </div>

                      {/* Curator Info */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>
                            {curator.name || curator.username}
                          </span>
                          <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                            @{curator.username}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px',
                            fontSize: '11px',
                            color: colors.textTertiary,
                          }}
                        >
                          <Folder size={11} color="#a855f7" />
                          <span>
                            {curator.publicCollectionsCount != null
                              ? `${curator.publicCollectionsCount} collections • ${curator.publicLinksCount || 0} links`
                              : curator.friendsSince
                              ? `Connected ${formatRelativeTime(curator.friendsSince)}`
                              : 'Connected curator'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Message Action */}
                    <button
                      type="button"
                      onClick={() => showFeedback(`Chat with @${curator.username} started!`, 'info')}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: colors.textTertiary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.accent;
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.textTertiary;
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title={`Message @${curator.username}`}
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Find & Invite Collaborators Button */}
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                color: colors.text,
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.accent;
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(99, 102, 241, 0.12)' : '#e0e7ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#cbd5e1';
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9';
              }}
            >
              <UserPlus size={14} />
              <span>Find &amp; Invite Collaborators</span>
            </button>
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

      {/* MODAL: Find & Invite Collaborators */}
      {showInviteModal && (
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
              maxWidth: '460px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              animation: 'scaleUp 0.15s ease-out forwards',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8',
                  }}
                >
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: colors.text }}>
                    Find &amp; Invite Collaborators
                  </h3>
                  <p style={{ margin: 0, fontSize: '11.5px', color: colors.textSecondary }}>
                    Connect with fellow curators to share feeds and bookmark libraries.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                style={{ background: 'none', border: 'none', color: colors.textTertiary, cursor: 'pointer', padding: '4px' }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Quick Share Invite Link */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                border: `1px solid ${colors.border}`,
              }}
            >
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px', textTransform: 'uppercase' }}>
                Your Public Invite Link
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={`https://linkcollect.io/invite/@${username || 'user'}`}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '7px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? colors.bgTertiary : '#ffffff',
                    color: colors.text,
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: isInviteCopied ? '#10b981' : '#6366f1',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                >
                  {isInviteCopied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{isInviteCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Search Curators Input */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px', textTransform: 'uppercase' }}>
                Search Curators by Handle or Name
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', color: colors.textTertiary }} />
                <input
                  type="text"
                  value={inviteSearchQuery}
                  onChange={(e) => setInviteSearchQuery(e.target.value)}
                  placeholder="e.g. sjenkins, alex, devon..."
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                    color: colors.text,
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {isSearchingUsers && (
                  <Loader2 size={13} className="animate-spin" style={{ position: 'absolute', right: '12px', color: colors.accent }} />
                )}
              </div>
            </div>

            {/* Search Results */}
            {inviteSearchQuery.trim().length >= 2 && (
              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  borderRadius: '9px',
                  border: `1px solid ${colors.border}`,
                  padding: '8px',
                  backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc',
                }}
              >
                {inviteSearchResults.length === 0 && !isSearchingUsers ? (
                  <div style={{ textAlign: 'center', padding: '14px', fontSize: '12px', color: colors.textTertiary }}>
                    No curators found matching &quot;{inviteSearchQuery}&quot;
                  </div>
                ) : (
                  inviteSearchResults.map((u) => {
                    const isSent = inviteSentIds.has(u.id);
                    return (
                      <div
                        key={u.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: '7px',
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <img
                            src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                            alt={u.username}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12.5px', fontWeight: '600', color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.name || u.username}
                            </div>
                            <div style={{ fontSize: '11px', color: colors.textTertiary }}>
                              @{u.username}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isSent || u.friendshipStatus === 'Friends'}
                          onClick={() => handleSendInvite(u)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isSent || u.friendshipStatus === 'Friends' ? 'rgba(16, 185, 129, 0.15)' : '#6366f1',
                            color: isSent || u.friendshipStatus === 'Friends' ? '#10b981' : '#ffffff',
                            fontSize: '11.5px',
                            fontWeight: '600',
                            cursor: isSent || u.friendshipStatus === 'Friends' ? 'default' : 'pointer',
                          }}
                        >
                          {u.friendshipStatus === 'Friends'
                            ? 'Connected'
                            : isSent
                            ? 'Sent'
                            : 'Invite'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '7px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: 'transparent',
                  color: colors.text,
                  fontSize: '12.5px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

