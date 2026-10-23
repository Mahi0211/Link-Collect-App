import React, { useState, useEffect } from 'react';
import {
  Folder,
  User,
  ExternalLink,
  Copy,
  Check,
  Search,
  Layers,
  ArrowLeft,
  Sparkles,
  Loader2,
  Calendar
} from 'lucide-react';
import { api } from '../utils/api';
import { getFaviconUrl } from '../utils/linkUtils';

export function SharedCollectionView({ shareId, onExit }) {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchShared = async () => {
      try {
        setLoading(true);
        const data = await api.getPublicCollection(shareId);
        if (isMounted) {
          setCollection(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load shared collection.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchShared();
    return () => { isMounted = false; };
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading curated collection...</p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
          <Folder className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <h2 className="text-lg font-bold">Collection Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">{error || 'This collection might be private or removed.'}</p>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to LinkCollect
        </button>
      </div>
    );
  }

  const filteredLinks = (collection.links || []).filter(l => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (l.title || '').toLowerCase().includes(q) ||
           (l.url || '').toLowerCase().includes(q) ||
           (l.domain || '').toLowerCase().includes(q) ||
           (l.customTags || []).some(t => t.toLowerCase().includes(q));
  });

  const handleCopyAll = () => {
    const urls = filteredLinks.map(l => l.url || l.link).join('\n');
    navigator.clipboard.writeText(urls);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleOpenAll = () => {
    if (confirm(`Open ${filteredLinks.length} links in new tabs?`)) {
      filteredLinks.forEach(l => window.open(l.url || l.link, '_blank'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Exit shared view"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-indigo-600/30">
              LC
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight">LinkCollect</span>
              <span className="text-[10px] text-indigo-400 ml-2 font-medium px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                Public Showcase
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? 'Copied All' : 'Copy All URLs'}
          </button>
          {filteredLinks.length > 0 && (
            <button
              onClick={handleOpenAll}
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open All ({filteredLinks.length})
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-8 flex-1 space-y-6">
        {/* Collection Hero */}
        <div className="p-6 md:p-8 bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-slate-300">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Curated by <strong className="text-white font-medium">{collection.authorName}</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(collection.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20 font-semibold">
              <Layers className="w-3.5 h-3.5" />
              {collection.linksCount} Curated Resources
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {collection.name}
          </h1>

          {/* Search filter */}
          <div className="relative max-w-md pt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in this collection..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((link) => {
            const favicon = getFaviconUrl(link.url || link.link);
            return (
              <div
                key={link.id}
                className="group p-5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      {favicon && <img src={favicon} alt="" className="w-4 h-4 rounded-sm shrink-0" />}
                      <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] truncate">
                        {link.domain}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 line-clamp-2 transition-colors">
                    {link.title || link.url}
                  </h3>

                  {link.notes && (
                    <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                      {link.notes}
                    </p>
                  )}

                  {link.customTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {link.customTags.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {link.rating ? '★'.repeat(link.rating) : ''}
                  </span>
                  <a
                    href={link.url || link.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium px-2.5"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLinks.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-sm bg-slate-900/40 rounded-3xl border border-slate-800">
            No bookmarks matching your search.
          </div>
        )}
      </main>
    </div>
  );
}
