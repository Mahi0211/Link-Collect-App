import React from 'react';
import { Folder, ChevronRight, ArrowLeft, Layers } from 'lucide-react';
import { themes } from '../utils/themes';

function BrowseDirectoryPlaceholder({
  testId,
  breadcrumbLabel,
  title,
  subtitle,
  icon: Icon,
  count,
  itemLabel,
  onBack,
  theme = 'dark',
}) {
  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  return (
    <div
      data-testid={testId}
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
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = colors.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = colors.textSecondary)}
              >
                Workspace
              </button>
              <ChevronRight size={13} />
              <span style={{ color: colors.text, fontWeight: '500' }}>{breadcrumbLabel}</span>
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
                {title}
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 9px',
                  borderRadius: '20px',
                  backgroundColor: colors.accentLight,
                  color: colors.accent,
                  border: `1px solid ${colors.border}`,
                  letterSpacing: '0.03em',
                }}
              >
                {Number(count || 0).toLocaleString()} {itemLabel}
              </span>
            </div>
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

        <div
          style={{
            padding: '44px 32px',
            borderRadius: '18px',
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.35)' : colors.shadowSm,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: colors.accentLight,
              color: colors.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${colors.border}`,
            }}
          >
            <Icon size={26} />
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '19px',
              fontWeight: '700',
              fontFamily: 'var(--font-heading)',
              color: colors.text,
            }}
          >
            {title} Directory
          </h2>
          <p
            style={{
              margin: 0,
              maxWidth: '460px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: colors.textSecondary,
            }}
          >
            {subtitle}
          </p>
          <div
            style={{
              marginTop: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
              border: `1px solid ${colors.border}`,
              color: colors.textTertiary,
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            <Layers size={13} />
            <span>Dedicated {breadcrumbLabel} page route ready for implementation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CollectionsPlaceholderPage({ collectionsCount = 0, onBack, theme = 'dark' }) {
  return (
    <BrowseDirectoryPlaceholder
      testId="collections-placeholder-page"
      breadcrumbLabel="Collections"
      title="All Collections"
      subtitle="Dedicated workspace route for browsing, filtering, and organizing all your collections."
      icon={Folder}
      count={collectionsCount}
      itemLabel={collectionsCount === 1 ? 'Collection' : 'Collections'}
      onBack={onBack}
      theme={theme}
    />
  );
}
