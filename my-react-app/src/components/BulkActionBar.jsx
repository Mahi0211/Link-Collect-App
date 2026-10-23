import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Trash2,
  FolderInput,
  Tag,
  Heart,
  Clock,
  Archive,
  Download,
  X,
  Loader2,
  ChevronDown
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
  const [tagInput, setTagInput] = useState('');

  if (selectedIds.length === 0) return null;

  const isAllSelected = selectedIds.length === allIds.length && allIds.length > 0;
  const selectedLinks = links.filter(l => selectedIds.includes(l.id));

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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-slide-up">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-slate-200">
        {/* Left: Count & Select All */}
        <div className="flex items-center gap-3">
          <button
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            {isAllSelected ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4" />}
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-xs font-medium text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            {selectedIds.length} selected
          </span>
        </div>

        {/* Center: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Move to Collection */}
          <div className="relative">
            <button
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:text-white transition-colors"
              title="Move to Collection"
            >
              <FolderInput className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Move</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showMoveMenu && (
              <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  Select Collection
                </div>
                <button
                  onClick={() => handleMove(null)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  (No Collection)
                </button>
                {collections.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleMove(c.id)}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 truncate"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Tag */}
          <div className="relative">
            <button
              onClick={() => setShowTagPrompt(!showTagPrompt)}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:text-white transition-colors"
              title="Add Tag"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tag</span>
            </button>

            {showTagPrompt && (
              <form
                onSubmit={handleAddTag}
                className="absolute bottom-full mb-2 left-0 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-2 z-50 animate-fade-in"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="New tag name..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 mb-2"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowTagPrompt(false)}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2 py-0.5 rounded"
                  >
                    Apply
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Favorite */}
          <button
            onClick={() => onExecuteAction({ action: 'favorite' })}
            disabled={isLoading}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-rose-400 hover:text-rose-300 transition-colors"
            title="Mark as Favorite"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>

          {/* Read Later */}
          <button
            onClick={() => onExecuteAction({ action: 'readLater' })}
            disabled={isLoading}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
            title="Read Later"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          {/* Archive */}
          <button
            onClick={() => onExecuteAction({ action: 'archive' })}
            disabled={isLoading}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-purple-400 hover:text-purple-300 transition-colors"
            title="Archive"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>

          {/* Export Selected HTML */}
          <button
            onClick={() => handleExportSelected('html')}
            className="hidden md:flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Export Selected"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export</span>
          </button>

          {/* Delete Selected */}
          <button
            onClick={() => onExecuteAction({ action: 'delete' })}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
            title="Delete Selected"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* Right: Close */}
        <button
          onClick={onClearSelection}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
