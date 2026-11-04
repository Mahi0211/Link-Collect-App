import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  X,
  Folder,
  Tag,
  Sparkles,
  Lock,
  Heart,
  Clock,
  Archive,
  Download,
  Trash2,
  ChevronDown,
  Loader2,
  FileText
} from 'lucide-react';
import { exportToNetscapeHtml, exportToCsv, triggerFileDownload } from '../utils/bookmarkParser';

export function BulkActionBar({
  selectedIds = [],
  allIds = [],
  links = [],
  collections = [],
  onSelectAll,
  onClearSelection,
  onExecuteAction,
  isLoading = false
}) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showTagPrompt, setShowTagPrompt] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const barRef = useRef(null);

  const safeSelectedIds = Array.isArray(selectedIds) ? selectedIds : [];
  const safeAllIds = Array.isArray(allIds) ? allIds : [];
  const safeLinks = Array.isArray(links) ? links : [];
  const safeCollections = Array.isArray(collections) ? collections : [];

  // Global hotkeys (M = Move, T = Tag, Del = Delete, Esc = Cancel)
  useEffect(() => {
    if (safeSelectedIds.length === 0) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setShowMoveMenu(prev => !prev);
        setShowTagPrompt(false);
        setShowExportMenu(false);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setShowTagPrompt(prev => !prev);
        setShowMoveMenu(false);
        setShowExportMenu(false);
      } else if (e.key === 'Delete') {
        e.preventDefault();
        onExecuteAction({ action: 'delete' });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (showMoveMenu) setShowMoveMenu(false);
        else if (showTagPrompt) setShowTagPrompt(false);
        else if (showExportMenu) setShowExportMenu(false);
        else onClearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeSelectedIds.length, showMoveMenu, showTagPrompt, showExportMenu, onClearSelection, onExecuteAction]);

  // Close menus when clicking outside
  useEffect(() => {
    if (safeSelectedIds.length === 0) return;

    const handleClickOutside = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setShowMoveMenu(false);
        setShowTagPrompt(false);
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [safeSelectedIds.length]);

  // Safe early exit AFTER all hooks are called
  if (safeSelectedIds.length === 0) return null;

  const isAllSelected = safeSelectedIds.length === safeAllIds.length && safeAllIds.length > 0;
  const selectedLinks = safeLinks.filter(l => safeSelectedIds.includes(l.id));

  const handleMove = (colId) => {
    setShowMoveMenu(false);
    onExecuteAction({ action: 'move', targetCollectionId: colId });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    onExecuteAction({ action: 'addTag', tag: tagInput.trim() });
    setTagInput('');
    setShowTagPrompt(false);
  };

  const handleExportSelected = (format) => {
    setShowExportMenu(false);
    const timestamp = new Date().toISOString().split('T')[0];
    if (format === 'html') {
      const html = exportToNetscapeHtml(selectedLinks);
      triggerFileDownload(html, `LinkCollect-Selected-${timestamp}.html`, 'text/html;charset=utf-8');
    } else if (format === 'csv') {
      const csv = exportToCsv(selectedLinks);
      triggerFileDownload(csv, `LinkCollect-Selected-${timestamp}.csv`, 'text/csv;charset=utf-8');
    }
  };

  return (
    <div
      ref={barRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw] animate-slide-up select-none"
      style={{
        animation: 'slideUpBar 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Outer Liquid Glassmorphism Capsule */}
      <div
        className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl text-slate-200"
        style={{
          background: 'linear-gradient(180deg, rgba(20, 24, 40, 0.82) 0%, rgba(12, 15, 26, 0.9) 100%)',
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          boxShadow: `
            0 20px 48px -10px rgba(0, 0, 0, 0.85),
            0 0 0 1px rgba(255, 255, 255, 0.07),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 -1px 1px 0 rgba(0, 0, 0, 0.45),
            0 0 35px -5px rgba(99, 102, 241, 0.12)
          `,
        }}
      >
        {/* 1. Selection Pill Capsule */}
        <div
          className="flex items-center gap-1.5 p-1 pl-1.5 rounded-xl border border-white/[0.08]"
          style={{
            background: 'rgba(25, 30, 48, 0.65)',
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Select / Deselect All Toggle */}
          <button
            type="button"
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer group"
            title={isAllSelected ? 'Deselect all bookmarks' : 'Select all visible bookmarks'}
          >
            <span
              className="w-4 h-4 rounded-[5px] bg-[#4f46e5] group-hover:bg-[#4338ca] flex items-center justify-center text-white transition-colors"
              style={{ boxShadow: '0 1px 3px rgba(79, 70, 229, 0.4)' }}
            >
              <Check size={11} strokeWidth={3} />
            </span>
            <span className="text-xs font-semibold text-white tracking-tight">
              {isAllSelected ? 'Deselect all' : 'Select all'}
            </span>
          </button>

          {/* Thin Vertical Separator */}
          <div className="h-3.5 w-[1px] bg-white/[0.12]" />

          {/* Indigo Count Pill with Blue Dot & Close X */}
          <div
            className="flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-lg border border-indigo-400/25"
            style={{
              background: 'rgba(59, 61, 191, 0.35)',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-indigo-400"
              style={{ boxShadow: '0 0 6px #818cf8' }}
            />
            <span className="text-xs font-semibold text-white whitespace-nowrap">
              {selectedIds.length} selected
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearSelection();
              }}
              className="p-0.5 text-slate-400 hover:text-white rounded-md hover:bg-white/[0.1] transition-colors ml-0.5"
              title="Clear selection (Esc)"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-5 bg-white/[0.1] mx-0.5" />

        {/* 2. Move to Collection Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowMoveMenu(!showMoveMenu);
              setShowTagPrompt(false);
              setShowExportMenu(false);
            }}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/[0.16] text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
            }}
            title="Move to Collection (M)"
          >
            <Folder size={13} className="text-indigo-400" />
            <span>Move</span>
            <kbd className="text-[9.5px] font-mono text-slate-400 bg-white/[0.06] border border-white/[0.08] px-1 py-0.2 rounded leading-tight">
              M
            </kbd>
            <ChevronDown size={11} className="text-slate-400 ml-0.5" />
          </button>

          {/* Move Menu Popover */}
          {showMoveMenu && (
            <div
              className="absolute bottom-full mb-3 left-0 w-52 rounded-2xl border border-white/10 shadow-2xl overflow-hidden py-1.5 z-50 animate-fade-in"
              style={{
                background: 'rgba(18, 22, 38, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/[0.06]">
                Select Collection
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                <button
                  type="button"
                  onClick={() => handleMove(null)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  (No Collection)
                </button>
                {safeCollections.map((c) => (
                  <button
                    key={c.id || c.name || c.collectionName}
                    type="button"
                    onClick={() => handleMove(c.id)}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors truncate flex items-center gap-2"
                  >
                    <Folder size={12} className="text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{c.collectionName || c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Add Tag Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowTagPrompt(!showTagPrompt);
              setShowMoveMenu(false);
              setShowExportMenu(false);
            }}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/[0.16] text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
            }}
            title="Add Tag (T)"
          >
            <Tag size={13} className="text-teal-400" />
            <span>Tag</span>
            <kbd className="text-[9.5px] font-mono text-slate-400 bg-white/[0.06] border border-white/[0.08] px-1 py-0.2 rounded leading-tight">
              T
            </kbd>
          </button>

          {/* Tag Input Popover */}
          {showTagPrompt && (
            <form
              onSubmit={handleAddTag}
              className="absolute bottom-full mb-3 left-0 w-60 rounded-2xl border border-white/10 shadow-2xl p-2.5 z-50 animate-fade-in"
              style={{
                background: 'rgba(18, 22, 38, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag size={12} className="text-teal-400" />
                <span>Add tag to {selectedIds.length} link(s)</span>
              </div>
              <input
                type="text"
                autoFocus
                placeholder="e.g. tutorial, research..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mb-2"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowTagPrompt(false)}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-md hover:bg-white/[0.06] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!tagInput.trim()}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-3 py-1 rounded-md transition-colors"
                >
                  Apply
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 4. Public Button (Active Green Glass Pill) */}
        <button
          type="button"
          onClick={() => onExecuteAction({ action: 'makePublic' })}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 hover:border-emerald-500/60 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
          style={{
            background: 'rgba(5, 150, 105, 0.22)',
            boxShadow: '0 0 14px rgba(16, 185, 129, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
          }}
          title="Make Public (Visible to Friends)"
        >
          <Sparkles size={13} className="text-emerald-400" />
          <span>Public</span>
        </button>

        {/* 5. Private Button */}
        <button
          type="button"
          onClick={() => onExecuteAction({ action: 'makePrivate' })}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/[0.16] text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
          }}
          title="Make Private (Visible only to you)"
        >
          <Lock size={12} className="text-slate-400" />
          <span>Private</span>
        </button>

        {/* 6. Compact Icon Actions (Favorite, Read Later, Archive) */}
        <div className="flex items-center gap-1">
          {/* Favorite */}
          <button
            type="button"
            onClick={() => onExecuteAction({ action: 'favorite' })}
            disabled={isLoading}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl border border-white/[0.06] hover:border-white/[0.15] text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
            }}
            title="Mark as Favorite"
          >
            <Heart size={14} />
          </button>

          {/* Read Later */}
          <button
            type="button"
            onClick={() => onExecuteAction({ action: 'readLater' })}
            disabled={isLoading}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl border border-white/[0.06] hover:border-white/[0.15] text-slate-400 hover:text-amber-400 transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
            }}
            title="Read Later"
          >
            <Clock size={14} />
          </button>

          {/* Archive */}
          <button
            type="button"
            onClick={() => onExecuteAction({ action: 'archive' })}
            disabled={isLoading}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl border border-white/[0.06] hover:border-white/[0.15] text-slate-400 hover:text-purple-400 transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
            }}
            title="Archive"
          >
            <Archive size={14} />
          </button>
        </div>

        {/* 7. Export Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowMoveMenu(false);
              setShowTagPrompt(false);
            }}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/[0.16] text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
            }}
            title="Export Selected"
          >
            <Download size={13} className="text-slate-300" />
            <span>Export</span>
          </button>

          {/* Export Menu Popover */}
          {showExportMenu && (
            <div
              className="absolute bottom-full mb-3 right-0 w-44 rounded-2xl border border-white/10 shadow-2xl overflow-hidden py-1.5 z-50 animate-fade-in"
              style={{
                background: 'rgba(18, 22, 38, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/[0.06]">
                Export Format
              </div>
              <button
                type="button"
                onClick={() => handleExportSelected('html')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center gap-2"
              >
                <Download size={12} className="text-cyan-400" />
                <span>Netscape HTML</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportSelected('csv')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center gap-2"
              >
                <FileText size={12} className="text-emerald-400" />
                <span>CSV Spreadsheet</span>
              </button>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-5 bg-white/[0.1] mx-0.5" />

        {/* 8. Delete Button (Crimson Glass Pill) */}
        <button
          type="button"
          onClick={() => onExecuteAction({ action: 'delete' })}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/35 hover:border-red-500/55 text-xs font-semibold text-red-400 hover:text-red-300 transition-all cursor-pointer"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            boxShadow: '0 0 14px rgba(239, 68, 68, 0.16), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
          }}
          title="Delete Selected (Del)"
        >
          {isLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Trash2 size={13} className="text-red-400" />
          )}
          <span>Delete</span>
          <kbd className="text-[9.5px] font-mono text-red-300/80 bg-red-950/60 border border-red-500/25 px-1 py-0.2 rounded leading-tight">
            Del
          </kbd>
        </button>
      </div>
    </div>
  );
}
