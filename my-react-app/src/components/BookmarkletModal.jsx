import React, { useState, useEffect, useRef } from 'react';
import { X, BookmarkPlus, Copy, Check, Sparkles, HelpCircle } from 'lucide-react';

export function BookmarkletModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const bookmarkLinkRef = useRef(null);

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5070';
  const bookmarkletCode = `javascript:(function(){var url=encodeURIComponent(window.location.href);var title=encodeURIComponent(document.title);window.open('${appOrigin}/?addUrl='+url+'&addTitle='+title,'LinkCollect','width=640,height=720,toolbar=no,menubar=no');})();`;

  // Always declare all hooks at the top level before any conditional returns
  useEffect(() => {
    if (isOpen && bookmarkLinkRef.current) {
      bookmarkLinkRef.current.setAttribute('href', bookmarkletCode);
    }
  }, [isOpen, bookmarkletCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Conditional return must always be after all hooks
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-base">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <BookmarkPlus className="w-5 h-5 text-indigo-400" />
            </div>
            <span>1-Click Browser Bookmarklet</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Save any webpage to LinkCollect in one click while browsing without having to switch tabs or open the app manually!
        </p>

        {/* Method 1: Drag to Bookmarks Bar */}
        <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Method 1: Drag this button to your Bookmarks Bar
          </p>
          <div className="py-2">
            <a
              ref={bookmarkLinkRef}
              onClick={(e) => {
                e.preventDefault();
                alert('Drag this button to your Bookmarks Bar (Ctrl+Shift+B or Cmd+Shift+B) to install!');
              }}
              draggable="true"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 cursor-grab active:cursor-grabbing transform hover:-translate-y-0.5 transition-all select-none"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              + Save to LinkCollect
            </a>
          </div>
          <p className="text-[11px] text-slate-400">
            (Make sure your Bookmarks Bar is visible: press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-200">Ctrl+Shift+B</kbd> or <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-200">Cmd+Shift+B</kbd>)
          </p>
        </div>

        {/* Method 2: Manual 10-Second Setup */}
        <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              Method 2: Add manually (if drag is blocked)
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Code Copied!' : 'Copy Code'}
            </button>
          </div>
          <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1">
            <li>Right-click your browser's bookmarks bar and select <strong className="text-slate-200">"Add page..."</strong> or <strong className="text-slate-200">"Add bookmark"</strong>.</li>
            <li>Set Name to: <strong className="text-slate-200">+ Save to LinkCollect</strong></li>
            <li>Paste the copied code into the <strong className="text-slate-200">URL</strong> field and click Save!</li>
          </ol>
        </div>

        {/* Footer */}
        <div className="pt-1 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
