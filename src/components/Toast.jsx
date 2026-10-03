import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose, theme = 'dark' }) => {
  if (!toast) return null;

  const isDark = theme === 'dark';

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-rose-500" />,
    info: <Info size={18} className="text-indigo-400" />
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: '12px',
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        color: isDark ? '#f4f4f5' : '#0f172a',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
        boxShadow: isDark
          ? '0 12px 32px rgba(0, 0, 0, 0.6)'
          : '0 12px 32px rgba(0, 0, 0, 0.12)',
        fontSize: '14px',
        fontWeight: '500',
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {icons[toast.type || 'success']}
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: isDark ? '#a1a1aa' : '#64748b',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
          marginLeft: '4px',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
