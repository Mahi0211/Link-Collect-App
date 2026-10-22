import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { themes } from '../utils/themes';

export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 12,
  onPageChange,
  onItemsPerPageChange,
  theme = 'dark'
}) => {
  const colors = themes[theme];
  const isDark = theme === 'dark';

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '32px',
        paddingTop: '20px',
        borderTop: `1px solid ${colors.border}`,
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      {/* Left: Summary and Page Size Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '13px', color: colors.textSecondary }}>
          Showing <strong style={{ color: colors.text }}>{startItem}–{endItem}</strong> of{' '}
          <strong style={{ color: colors.text }}>{totalItems}</strong> links
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: colors.textTertiary }}>Per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: isDark ? colors.bgTertiary : '#f1f5f9',
              border: `1px solid ${colors.border}`,
              color: colors.text,
              fontSize: '12px',
              fontWeight: '500',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

      {/* Right: Page Navigation Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* First Page Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            backgroundColor: isDark ? colors.bgTertiary : '#ffffff',
            color: currentPage === 1 ? colors.textTertiary : colors.text,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          title="First Page"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            backgroundColor: isDark ? colors.bgTertiary : '#ffffff',
            color: currentPage === 1 ? colors.textTertiary : colors.text,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          title="Previous Page"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Numeric Page Buttons */}
        {pages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                backgroundColor: isDark ? colors.bgTertiary : '#ffffff',
                color: colors.text,
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '500',
              }}
            >
              1
            </button>
            {pages[0] > 2 && (
              <span style={{ padding: '0 4px', color: colors.textTertiary, fontSize: '12px' }}>…</span>
            )}
          </>
        )}

        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: isActive ? 'none' : `1px solid ${colors.border}`,
                backgroundColor: isActive ? colors.accent : (isDark ? colors.bgTertiary : '#ffffff'),
                color: isActive ? '#ffffff' : colors.text,
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: isActive ? '700' : '500',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? `0 2px 8px ${colors.accentLight}` : 'none',
              }}
            >
              {p}
            </button>
          );
        })}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span style={{ padding: '0 4px', color: colors.textTertiary, fontSize: '12px' }}>…</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                backgroundColor: isDark ? colors.bgTertiary : '#ffffff',
                color: colors.text,
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '500',
              }}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            backgroundColor: isDark ? colors.bgTertiary : '#ffffff',
            color: currentPage === totalPages ? colors.textTertiary : colors.text,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          title="Next Page"
        >
          <ChevronRight size={15} />
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            backgroundColor: isDark ? colors.bgTertiary : '#ffffff',
            color: currentPage === totalPages ? colors.textTertiary : colors.text,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          title="Last Page"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
};
