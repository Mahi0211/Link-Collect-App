import React from 'react';
import {
  MessageSquare,
  Sparkles,
  Users,
  ChevronRight,
  ArrowLeft,
  Share2,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { themes } from '../utils/themes';

export const ChatComingSoonPage = ({
  onBack,
  onOpenFriends,
  theme = 'dark'
}) => {
  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  return (
    <div
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
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Breadcrumb & Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '12px',
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
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = colors.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = colors.textSecondary)}
              >
                Workspace
              </button>
              <ChevronRight size={13} />
              <span style={{ color: colors.text, fontWeight: '500' }}>Chat &amp; Collaboration</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '25px',
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--font-heading)',
                  color: colors.text,
                }}
              >
                Chat &amp; Collaboration
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 9px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                }}
              >
                v2.5 Preview
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textSecondary }}>
              Connect, share links in real-time, and collaborate seamlessly with friends and curators.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                color: colors.text,
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Bookmarks</span>
            </button>

            {onOpenFriends && (
              <button
                type="button"
                onClick={onOpenFriends}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Users size={14} />
                <span>Open Friends</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Banner Card */}
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            border: `1px solid ${colors.border}`,
            background: isDark
              ? 'linear-gradient(135deg, #13131c 0%, #1a162b 50%, #121829 100%)'
              : 'linear-gradient(135deg, #f8faff 0%, #ede9fe 100%)',
            padding: '48px 36px',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: isDark ? '0 12px 36px rgba(0, 0, 0, 0.5)' : colors.shadowMd,
            overflow: 'hidden',
          }}
        >
          {/* Subtle Glow Backdrop */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
              marginBottom: '20px',
            }}
          >
            <MessageSquare size={32} />
          </div>

          <h2
            style={{
              margin: '0 0 10px 0',
              fontSize: '28px',
              fontWeight: '800',
              color: colors.text,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
            }}
          >
            Realtime Chat &amp; Community Threads
          </h2>

          <p
            style={{
              maxWidth: '620px',
              margin: '0 auto 28px auto',
              fontSize: '14.5px',
              lineHeight: '1.6',
              color: colors.textSecondary,
            }}
          >
            We are building an integrated direct messaging and collaborative workspace experience.
            Soon, you’ll be able to discuss collections, share links instantly with friends, and curate together.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '24px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              border: `1px solid ${colors.border}`,
              fontSize: '12.5px',
              color: colors.textSecondary,
            }}
          >
            <Sparkles size={14} color="#a855f7" />
            <span>Currently under active development for <strong>LinkCollect v2.5</strong></span>
          </div>
        </div>

        {/* Feature Previews Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              padding: '24px',
              boxShadow: colors.shadowSm,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.1)',
                color: colors.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Zap size={20} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: colors.text }}>
              Instant 1-on-1 &amp; Group Chat
            </h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: colors.textSecondary }}>
              Direct messaging with friends, online status indicators, and group curation spaces.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              padding: '24px',
              boxShadow: colors.shadowSm,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Share2 size={20} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: colors.text }}>
              Inline Bookmark Drops
            </h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: colors.textSecondary }}>
              Drop links, full collections, or tags right into chat with rich previews and one-click import.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              backgroundColor: isDark ? colors.cardBg : '#ffffff',
              padding: '24px',
              boxShadow: colors.shadowSm,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)',
                color: '#ec4899',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Shield size={20} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: colors.text }}>
              Private &amp; Secure
            </h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: colors.textSecondary }}>
              Full control over privacy settings, invite links, and collection-sharing permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
