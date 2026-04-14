import { useState, useEffect } from "react";
import { themes } from "../utils/themes";

// TabNavigation Component
export const TabNavigation = ({ collections, activeTab, onTabChange, scrollContainerRef, theme }) => {
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const colors = themes[theme];
 
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
 
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);
 
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 100);
    }
  };
 
  return (
    <div style={{
      backgroundColor: colors.bg,
      borderBottom: `0.5px solid ${colors.border}`,
      position: 'sticky',
      top: '110px',
      zIndex: 40,
    }}>
      {/* Left scroll button */}
      {showLeftScroll && (
        <button
          onClick={() => scroll('left')}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: `linear-gradient(90deg, ${colors.bg} 0%, transparent 100%)`,
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            color: colors.textSecondary,
            fontSize: '20px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
        >
          ←
        </button>
      )}
 
      {/* Tabs container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        style={{
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          display: 'flex',
          gap: '8px',
          padding: '16px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {collections.map((collection, idx) => (
          <button
            key={idx}
            onClick={() => {
              onTabChange(idx);
              setTimeout(() => {
                if (scrollContainerRef.current) {
                  const activeButton = scrollContainerRef.current.children[idx];
                  if (activeButton) {
                    activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }
                }
              }, 0);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              flexShrink: 0,
              backgroundColor: activeTab === idx ? colors.tabActive : colors.tabInactive,
              color: activeTab === idx ? '#ffffff' : colors.text,
            }}
          >
            {collection.collectionName} <span style={{ marginLeft: '6px', fontSize: '12px', opacity: 0.8 }}>{collection.totalLinks}</span>
          </button>
        ))}
      </div>
 
      {/* Right scroll button */}
      {showRightScroll && (
        <button
          onClick={() => scroll('right')}
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: `linear-gradient(270deg, ${colors.bg} 0%, transparent 100%)`,
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            color: colors.textSecondary,
            fontSize: '20px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
        >
          →
        </button>
      )}
 
      <style>{`
        div:has(> [style*="overflowX"])::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};