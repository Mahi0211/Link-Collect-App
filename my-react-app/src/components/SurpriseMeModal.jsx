import React, { useState, useEffect } from 'react';
import { X, Sparkles, ExternalLink, Check, Shuffle, Clock, Star, BookOpen } from 'lucide-react';

export function SurpriseMeModal({ isOpen, onClose, links = [], onMarkRead, onOpenDetail }) {
  const [currentLink, setCurrentLink] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Eligible pool: prefer read-later or unread links
  const pickRandom = (excludeId = null) => {
    if (!links || links.length === 0) return null;

    let pool = links.filter(l => (l.isReadLater || !l.watched) && !l.isArchived);
    if (pool.length === 0) {
      pool = links.filter(l => !l.isArchived);
    }
    if (pool.length > 1 && excludeId) {
      pool = pool.filter(l => l.id !== excludeId);
    }
    if (pool.length === 0) pool = links;

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  useEffect(() => {
    if (isOpen) {
      triggerShuffle();
    }
  }, [isOpen]);

  const triggerShuffle = () => {
    setIsShuffling(true);
    let counter = 0;
    const interval = setInterval(() => {
      setCurrentLink(pickRandom());
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        setCurrentLink(pickRandom());
        setIsShuffling(false);
      }
    }, 60);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>Surprise Me &bull; What to Read Next</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentLink ? (
          <div className={`p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-950/80 border border-slate-700/60 text-left space-y-3 transition-all duration-300 ${isShuffling ? 'scale-95 opacity-60 blur-xs' : 'scale-100 opacity-100'}`}>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
                {currentLink.domain || 'Article'}
              </span>
              {currentLink.collectionName && (
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">
                  {currentLink.collectionName}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
              {currentLink.title || currentLink.url}
            </h3>

            {currentLink.notes && (
              <p className="text-xs text-slate-300 line-clamp-2 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                "{currentLink.notes}"
              </p>
            )}

            {currentLink.customTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentLink.customTags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-slate-400 text-sm">
            No bookmarks found to read!
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={triggerShuffle}
            disabled={isShuffling}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            title="Shuffle Another"
          >
            <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>Shuffle</span>
          </button>

          {currentLink && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onOpenDetail?.(currentLink);
                }}
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <BookOpen className="w-4 h-4" />
                Details
              </button>

              <a
                href={currentLink.url || currentLink.link}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  onMarkRead?.(currentLink.id);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
              >
                <span>Read Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
