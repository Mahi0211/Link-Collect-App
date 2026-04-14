// LinkCard Component
import { useState } from "react";
import { themes } from "../utils/themes";
import { getFaviconUrl, getDomainName, getPageTitle } from "../utils/linkUtils";

export const LinkCard = ({ link, theme }) => {
  const [imageError, setImageError] = useState(false);
  const faviconUrl = getFaviconUrl(link);
  const domainName = getDomainName(link);
  const pageTitle = getPageTitle(link);
  const colors = themes[theme];
 
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        borderRadius: '12px',
        backgroundColor: colors.cardBg,
        border: `0.5px solid ${colors.border}`,
        padding: '1.25rem',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        minHeight: '112px',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme === 'dark' 
          ? '0 8px 16px rgba(0,0,0,0.4)' 
          : '0 8px 16px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.backgroundColor = colors.cardHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = colors.cardBg;
      }}
    >
      {/* Gradient overlay on hover */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${colors.accentFrom}10, ${colors.accentTo}10)`,
        borderRadius: '12px',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }} />
 
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}>
        {/* Favicon and external link icon */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <div>
            {faviconUrl && !imageError ? (
              <img
                src={faviconUrl}
                alt="favicon"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  backgroundColor: colors.bgSecondary,
                }}
                onError={() => setImageError(true)}
              />
            ) : (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${colors.accentFrom}, ${colors.accentTo})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                {domainName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span style={{
            fontSize: '16px',
            color: colors.textTertiary,
            transition: 'color 0.3s ease',
          }}>↗</span>
        </div>
 
        {/* Page Title */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: colors.text,
          margin: '0 0 6px 0',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {pageTitle}
        </h3>
 
        {/* Domain Name */}
        <p style={{
          fontSize: '12px',
          color: colors.textSecondary,
          margin: 0,
          lineHeight: '1.4',
        }}>
          {domainName}
        </p>
      </div>
    </a>
  );
};