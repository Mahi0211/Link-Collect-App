import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ExternalLink, Shuffle, BookOpen } from 'lucide-react';
import {
  getDomainName,
  getEstimatedReadingTime,
  getFaviconUrl,
  getLinkPreviewData,
  isYouTubeUrl,
  resolveLinkThumbnail
} from '../utils/linkUtils';
import { api } from '../utils/api';

export function SurpriseMeModal({
  isOpen,
  onClose,
  links = [],
  onMarkRead,
  onOpenDetail,
  onBackfillThumbnail
}) {
  const [currentLink, setCurrentLink] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [resolvedThumbnail, setResolvedThumbnail] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const shuffleIntervalRef = useRef(null);
  const imgRef = useRef(null);

  // Eligible pool: prefer read-later or unread links
  const pickRandom = (excludeUrl = null) => {
    if (!links || links.length === 0) return null;

    let pool = links.filter(l => (l.isReadLater || !l.watched) && !l.isArchived);
    if (pool.length === 0) {
      pool = links.filter(l => !l.isArchived);
    }
    if (pool.length > 1 && excludeUrl) {
      pool = pool.filter(l => (l.url || l.link) !== excludeUrl);
    }
    if (pool.length === 0) pool = links;

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  const triggerShuffle = () => {
    if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
    const excludeUrl = currentLink?.url || currentLink?.link || null;
    setIsShuffling(true);
    let counter = 0;
    shuffleIntervalRef.current = setInterval(() => {
      setCurrentLink(pickRandom());
      counter++;
      if (counter > 8) {
        clearInterval(shuffleIntervalRef.current);
        shuffleIntervalRef.current = null;
        setCurrentLink(pickRandom(excludeUrl));
        setIsShuffling(false);
      }
    }, 60);
  };

  useEffect(() => {
    if (isOpen) {
      triggerShuffle();
    } else if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current);
      shuffleIntervalRef.current = null;
    }
    return () => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
        shuffleIntervalRef.current = null;
      }
    };
  }, [isOpen]);

  const currentUrl = currentLink ? (currentLink.url || currentLink.link || '') : '';

  // Sync saved thumbnail when currentLink changes
  useEffect(() => {
    setResolvedThumbnail(currentLink?.thumbnailUrl ?? null);
    setFaviconError(false);
  }, [currentLink?.id, currentLink?.thumbnailUrl, currentUrl]);

  // Lazily fetch & backfill thumbnail once if the selected bookmark still lacks thumbnailUrl
  useEffect(() => {
    if (!isOpen || isShuffling || !currentLink || !currentUrl) return;
    if (resolvedThumbnail !== null && resolvedThumbnail !== undefined) return;
    if (!currentLink.id || isYouTubeUrl(currentUrl) || !/^https?:\/\//i.test(currentUrl)) return;

    let isMounted = true;
    resolveLinkThumbnail(currentUrl, (u) => api.scrapeMetadata(u)).then((result) => {
      if (!isMounted || result === null) return;
      setResolvedThumbnail(result);
      onBackfillThumbnail?.(currentLink.id, result);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, isShuffling, currentLink, currentUrl, resolvedThumbnail, onBackfillThumbnail]);

  const domain = currentUrl ? getDomainName(currentUrl) : '';
  const faviconUrl = currentUrl ? getFaviconUrl(currentUrl) : null;
  const readingTime = currentUrl ? getEstimatedReadingTime(currentUrl) : '';
  const preview = currentUrl ? getLinkPreviewData(currentUrl, resolvedThumbnail) : null;
  const previewThumbUrl = preview?.thumbnailUrl || null;

  useEffect(() => {
    setImgSrc(previewThumbUrl);
    setImgError(false);
    setImgLoaded(false);
  }, [previewThumbUrl]);

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, [imgSrc]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>Surprise Me &bull; What to Read Next</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Surprise Me"
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentLink ? (
          <div className={`rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-950/80 border border-slate-700/60 overflow-hidden text-left transition-all duration-300 ${isShuffling ? 'scale-95 opacity-60 blur-xs' : 'scale-100 opacity-100'}`}>
            {/* URL Thumbnail Banner */}
            <div
              className="relative w-full aspect-video overflow-hidden border-b border-slate-700/60"
              style={{
                background: preview?.gradient || 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
              }}
            >
              {(!imgSrc || imgError || !imgLoaded) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold text-white/85">
                    {(domain || 'L').charAt(0).toUpperCase()}
                  </div>
                </div>
              )}

              {imgSrc && !imgError && (
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt={currentLink.title || domain}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    if (preview?.fallbackThumbnailUrl && imgSrc !== preview.fallbackThumbnailUrl) {
                      setImgSrc(preview.fallbackThumbnailUrl);
                    } else {
                      setImgError(true);
                    }
                  }}
                  style={{
                    objectPosition: (preview?.isCustomThumbnail && imgSrc === preview?.thumbnailUrl) ? 'center' : 'top center',
                    opacity: imgLoaded ? 1 : 0,
                  }}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
                />
              )}

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 45%)',
                }}
              />

              {readingTime && (
                <div className="absolute bottom-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white">
                  <BookOpen className="w-3 h-3 opacity-90" />
                  <span>{readingTime}</span>
                </div>
              )}
            </div>

            {/* Metadata & Title Body */}
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 min-w-0">
                  {faviconUrl && !faviconError && (
                    <img
                      src={faviconUrl}
                      alt=""
                      className="w-4 h-4 rounded-sm shrink-0 bg-slate-800 object-contain"
                      onError={() => setFaviconError(true)}
                    />
                  )}
                  <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10.5px] truncate">
                    {currentLink.domain || domain || 'Article'}
                  </span>
                </div>
                {currentLink.collectionName && (
                  <span className="bg-slate-800 px-2.5 py-0.5 rounded-md text-[10.5px] text-slate-300 border border-slate-700/70 truncate max-w-[160px] shrink-0">
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
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {currentLink.customTags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-slate-400 text-sm">
            No bookmarks found to read!
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={triggerShuffle}
            disabled={isShuffling}
            className="p-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            title="Shuffle Another"
          >
            <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>Shuffle</span>
          </button>

          {currentLink && (
            <>
              <button
                type="button"
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
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  if (!currentLink.watched) onMarkRead?.(currentUrl);
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
