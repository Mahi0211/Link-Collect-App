import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FolderPlus,
  Layers,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  BookOpen,
  Heart,
  Clock,
  Archive,
  ExternalLink,
  Tag,
  CheckCircle2,
  Folder
} from 'lucide-react';
import { themes } from '../utils/themes';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LinkCard } from './LinkCard';
import { KanbanView } from './KanbanView';
import { LinkDetailDrawer } from './LinkDetailDrawer';
import { AddLinkModal } from './AddLinkModal';
import { CommandPalette } from './CommandPalette';
import { Toast } from './Toast';
import { Pagination } from './Pagination';
import { getDomainName, getPageTitle } from '../utils/linkUtils';

export default function LinkCollectionsApp({ data, onLogout, theme: initialTheme, onThemeChange }) {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('linkapp-theme') || initialTheme || 'dark';
  });

  // Collections state (initialized with data.collections + local additions)
  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem('linkapp-custom-collections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return data?.collections || [];
  });

  // Persist collections when changed
  const saveCollections = (newCols) => {
    setCollections(newCols);
    try {
      localStorage.setItem('linkapp-custom-collections', JSON.stringify(newCols));
    } catch {
      // ignore
    }
  };

  // View state: 'all' | 'favorites' | 'readLater' | 'archive' | 'collection'
  const [activeView, setActiveView] = useState('all');
  const [activeCollectionId, setActiveCollectionId] = useState(0);

  // View Mode: 'grid' | 'list' | 'kanban'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('linkapp-view-mode') || 'grid';
  });

  // Sorting: 'newest' | 'oldest' | 'alphabetical' | 'domain'
  const [sortOption, setSortOption] = useState('newest');

  // Screen responsiveness & Sidebar visibility
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return Number(localStorage.getItem('linkapp-items-per-page')) || 12;
  });
  const mainContentRef = useRef(null);
  const mainFrameRef = useRef(null);

  // Reset pagination on navigation or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, activeCollectionId, searchQuery, selectedTag, sortOption, itemsPerPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    mainFrameRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    mainContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleItemsPerPageChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
    localStorage.setItem('linkapp-items-per-page', String(newSize));
  };

  // Favorites, Read Later, and Archive stored in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('linkapp-favorites')) || [];
    } catch {
      return [];
    }
  });

  const [readLater, setReadLater] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('linkapp-readlater')) || [];
    } catch {
      return [];
    }
  });

  const [archive, setArchive] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('linkapp-archive')) || [];
    } catch {
      return [];
    }
  });

  // Custom metadata (notes, custom tags, edited titles)
  const [linkMetadata, setLinkMetadata] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('linkapp-link-metadata')) || {};
    } catch {
      return {};
    }
  });

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [drawerItem, setDrawerItem] = useState(null);
  const [toast, setToast] = useState(null);

  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Sync theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('linkapp-theme', nextTheme);
    if (onThemeChange) onThemeChange(nextTheme);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('linkapp-view-mode', mode);
  };

  // Keyboard Shortcuts (Ctrl+K for search, N for new link, Esc for cancel)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'n' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        setIsAddModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync favorites, readLater, archive, metadata to localStorage
  useEffect(() => {
    localStorage.setItem('linkapp-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('linkapp-readlater', JSON.stringify(readLater));
  }, [readLater]);

  useEffect(() => {
    localStorage.setItem('linkapp-archive', JSON.stringify(archive));
  }, [archive]);

  useEffect(() => {
    localStorage.setItem('linkapp-link-metadata', JSON.stringify(linkMetadata));
  }, [linkMetadata]);

  // Aggregate all links with ratings, watched state, and reviews
  const allLinks = useMemo(() => {
    return collections.flatMap((col) =>
      (col.links || []).map((link) => {
        const url = typeof link === 'string' ? link : link.url;
        const meta = linkMetadata[url] || {};
        return {
          link: url,
          url,
          collectionName: col.collectionName,
          title: meta.title || getPageTitle(url),
          domain: getDomainName(url),
          customTags: meta.customTags || [],
          notes: meta.notes || '',
          isFavorite: favorites.includes(url),
          isReadLater: readLater.includes(url),
          isArchived: archive.includes(url),
          rating: meta.rating || 0,
          review: meta.review || '',
          watched: Boolean(meta.watched || (meta.watchCount && meta.watchCount > 0)),
          watchCount: meta.watchCount || 0,
          rewatchWorthy: Boolean(meta.rewatchWorthy),
        };
      })
    );
  }, [collections, linkMetadata, favorites, readLater, archive]);

  // Derived counts for sidebar and quick filters
  const topRatedCount = useMemo(() => allLinks.filter((item) => item.rating >= 4 && !item.isArchived).length, [allLinks]);
  const rewatchCount = useMemo(() => allLinks.filter((item) => item.rewatchWorthy && !item.isArchived).length, [allLinks]);
  const watchedCount = useMemo(() => allLinks.filter((item) => item.watched && !item.isArchived).length, [allLinks]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    allLinks.forEach((item) => {
      (item.customTags || []).forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [allLinks]);

  // Direct card rating handler
  const handleRate = (url, newRating) => {
    setLinkMetadata((prev) => {
      const existing = prev[url] || {};
      const shouldRewatch = newRating >= 4 ? true : Boolean(existing.rewatchWorthy);
      return {
        ...prev,
        [url]: {
          ...existing,
          rating: newRating,
          rewatchWorthy: shouldRewatch,
        },
      };
    });
    if (newRating >= 4) {
      showToast(`Rated ${newRating}★ — Flagged as Rewatch Worthy! 🔥`, 'success');
    } else if (newRating > 0) {
      showToast(`Rated ${newRating}★ — Review unlocked!`, 'info');
    }
  };

  // Direct card watched toggle handler
  const handleToggleWatched = (url) => {
    setLinkMetadata((prev) => {
      const existing = prev[url] || {};
      const nextWatched = !existing.watched;
      const nextCount = nextWatched && (!existing.watchCount || existing.watchCount === 0) ? 1 : (existing.watchCount || 0);
      showToast(nextWatched ? 'Marked as Watched ✓' : 'Marked as Unwatched', 'info');
      return {
        ...prev,
        [url]: {
          ...existing,
          watched: nextWatched,
          watchCount: nextCount,
        },
      };
    });
  };

  // Favorite toggle handler
  const handleToggleFavorite = (url) => {
    setFavorites((prev) => {
      const exists = prev.includes(url);
      const updated = exists ? prev.filter((u) => u !== url) : [...prev, url];
      showToast(exists ? 'Removed from Favorites' : 'Added to Favorites!', 'info');
      return updated;
    });
  };

  // Read Later toggle handler
  const handleToggleReadLater = (url) => {
    setReadLater((prev) => {
      const exists = prev.includes(url);
      const updated = exists ? prev.filter((u) => u !== url) : [...prev, url];
      showToast(exists ? 'Removed from Reading List' : 'Added to Reading List!', 'info');
      return updated;
    });
  };

  // Add Link
  const handleAddLink = (newLinkData) => {
    const { url, title, collectionName, customTags, notes, isFavorite, isReadLater } = newLinkData;

    // Update collection
    const updatedCollections = collections.map((col) => {
      if (col.collectionName === collectionName) {
        return {
          ...col,
          links: [url, ...(col.links || [])],
          totalLinks: (col.totalLinks || 0) + 1,
        };
      }
      return col;
    });

    saveCollections(updatedCollections);

    // Save metadata
    setLinkMetadata((prev) => ({
      ...prev,
      [url]: { title, notes, customTags, collectionName },
    }));

    if (isFavorite && !favorites.includes(url)) {
      setFavorites((prev) => [...prev, url]);
    }
    if (isReadLater && !readLater.includes(url)) {
      setReadLater((prev) => [...prev, url]);
    }
  };

  // Update existing link from drawer
  const handleUpdateLink = ({
    originalUrl,
    url,
    title,
    collectionName,
    notes,
    customTags,
    isFavorite,
    isReadLater,
    rating,
    review,
    watched,
    watchCount,
    rewatchWorthy,
  }) => {
    setLinkMetadata((prev) => ({
      ...prev,
      [url]: {
        ...(prev[url] || {}),
        title,
        notes,
        customTags,
        collectionName,
        rating: rating !== undefined ? rating : (prev[url]?.rating || 0),
        review: review !== undefined ? review : (prev[url]?.review || ''),
        watched: watched !== undefined ? watched : (prev[url]?.watched || false),
        watchCount: watchCount !== undefined ? watchCount : (prev[url]?.watchCount || 0),
        rewatchWorthy: rewatchWorthy !== undefined ? rewatchWorthy : (prev[url]?.rewatchWorthy || false),
      },
    }));

    // If collection changed, migrate link
    const currentMeta = linkMetadata[originalUrl];
    const prevCollection = currentMeta?.collectionName;
    if (prevCollection && prevCollection !== collectionName) {
      const updated = collections.map((col) => {
        if (col.collectionName === prevCollection) {
          return { ...col, links: col.links.filter((l) => l !== originalUrl) };
        }
        if (col.collectionName === collectionName) {
          return { ...col, links: [...(col.links || []), url] };
        }
        return col;
      });
      saveCollections(updated);
    }

    if (isFavorite && !favorites.includes(url)) {
      setFavorites((prev) => [...prev, url]);
    } else if (!isFavorite && favorites.includes(url)) {
      setFavorites((prev) => prev.filter((u) => u !== url));
    }

    if (isReadLater && !readLater.includes(url)) {
      setReadLater((prev) => [...prev, url]);
    } else if (!isReadLater && readLater.includes(url)) {
      setReadLater((prev) => prev.filter((u) => u !== url));
    }
  };

  // Delete Link
  const handleDeleteLink = (urlToDelete, colName) => {
    const updated = collections.map((col) => {
      if (col.collectionName === colName) {
        return {
          ...col,
          links: col.links.filter((l) => l !== urlToDelete),
          totalLinks: Math.max(0, (col.totalLinks || col.links.length) - 1),
        };
      }
      return col;
    });
    saveCollections(updated);
    setFavorites((prev) => prev.filter((u) => u !== urlToDelete));
    setReadLater((prev) => prev.filter((u) => u !== urlToDelete));
  };

  // Add new collection
  const handleCreateCollection = (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    const trimmed = newCollectionName.trim();
    if (collections.some((c) => c.collectionName.toLowerCase() === trimmed.toLowerCase())) {
      showToast('A collection with this name already exists', 'error');
      return;
    }
    const newCol = {
      collectionName: trimmed,
      totalLinks: 0,
      links: [],
    };
    const updated = [...collections, newCol];
    saveCollections(updated);
    setNewCollectionName('');
    setIsAddCollectionModalOpen(false);
    setActiveView('collection');
    setActiveCollectionId(updated.length - 1);
    showToast(`Created collection "${trimmed}"!`);
  };

  // Filter links based on active view, search, and tags
  const displayedLinks = useMemo(() => {
    let list = [];

    // Step 1: Filter by Navigation View
    if (activeView === 'all') {
      list = allLinks.filter((item) => !item.isArchived);
    } else if (activeView === 'favorites') {
      list = allLinks.filter((item) => item.isFavorite && !item.isArchived);
    } else if (activeView === 'topRated') {
      list = allLinks.filter((item) => item.rating >= 4 && !item.isArchived);
    } else if (activeView === 'rewatchWorthy') {
      list = allLinks.filter((item) => item.rewatchWorthy && !item.isArchived);
    } else if (activeView === 'watched') {
      list = allLinks.filter((item) => item.watched && !item.isArchived);
    } else if (activeView === 'readLater') {
      list = allLinks.filter((item) => item.isReadLater && !item.isArchived);
    } else if (activeView === 'archive') {
      list = allLinks.filter((item) => item.isArchived);
    } else if (activeView === 'collection') {
      const activeCol = collections[activeCollectionId];
      if (activeCol) {
        list = allLinks.filter((item) => item.collectionName === activeCol.collectionName && !item.isArchived);
      }
    }

    // Step 2: Filter by Tag
    if (selectedTag) {
      list = list.filter((item) => (item.customTags || []).includes(selectedTag));
    }

    // Step 3: Search Query across title, domain, URL, notes, and collection
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.url.toLowerCase().includes(q) ||
          item.domain.toLowerCase().includes(q) ||
          item.collectionName.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          (item.review && item.review.toLowerCase().includes(q)) ||
          (item.customTags && item.customTags.some((t) => t.toLowerCase().includes(q)))
        );
      });
    }

    // Step 4: Sort
    const sorted = [...list];
    if (sortOption === 'topRated') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortOption === 'mostViewed') {
      sorted.sort((a, b) => (b.watchCount || 0) - (a.watchCount || 0));
    } else if (sortOption === 'alphabetical') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'domain') {
      sorted.sort((a, b) => a.domain.localeCompare(b.domain));
    } else if (sortOption === 'oldest') {
      // Keep naturally in order
    } else {
      // Default: newest first
      sorted.reverse();
    }

    return sorted;
  }, [allLinks, activeView, activeCollectionId, collections, selectedTag, searchQuery, sortOption]);

  // Paginated links for Grid and List views
  const paginatedLinks = useMemo(() => {
    if (viewMode === 'kanban') return displayedLinks;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayedLinks.slice(startIndex, startIndex + itemsPerPage);
  }, [displayedLinks, viewMode, currentPage, itemsPerPage]);

  // Current view title & description
  const viewInfo = useMemo(() => {
    if (searchQuery.trim()) {
      return {
        title: `Search Results (${displayedLinks.length})`,
        subtitle: `Matching query "${searchQuery}"`,
      };
    }
    if (selectedTag) {
      return {
        title: `#${selectedTag} (${displayedLinks.length})`,
        subtitle: `Links tagged with #${selectedTag}`,
      };
    }
    if (activeView === 'all') {
      return {
        title: 'All Bookmarks',
        subtitle: `${allLinks.length} total saved links across ${collections.length} collections`,
      };
    }
    if (activeView === 'favorites') {
      return {
        title: 'Favorites',
        subtitle: `${favorites.length} starred bookmarks for quick access`,
      };
    }
    if (activeView === 'topRated') {
      return {
        title: 'Top Rated Bookmarks',
        subtitle: `${topRatedCount} resources rated 4-5 stars`,
      };
    }
    if (activeView === 'rewatchWorthy') {
      return {
        title: 'Rewatch Worthy Gems 🔥',
        subtitle: `${rewatchCount} essential bookmarks worth watching again`,
      };
    }
    if (activeView === 'watched') {
      return {
        title: 'Already Watched / Completed ✓',
        subtitle: `${watchedCount} links and videos marked as watched`,
      };
    }
    if (activeView === 'readLater') {
      return {
        title: 'Read Later',
        subtitle: `${readLater.length} saved articles and resources to review`,
      };
    }
    if (activeView === 'archive') {
      return {
        title: 'Archive',
        subtitle: `${archive.length} archived bookmarks`,
      };
    }
    if (activeView === 'collection') {
      const col = collections[activeCollectionId];
      return {
        title: col?.collectionName || 'Collection',
        subtitle: `${col?.links?.length || 0} links saved in this collection`,
      };
    }
    return { title: 'Bookmarks', subtitle: '' };
  }, [activeView, activeCollectionId, collections, searchQuery, selectedTag, displayedLinks.length, allLinks.length, favorites.length, readLater.length, archive.length]);

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        maxWidth: '100vw',
        overflow: 'hidden',
        backgroundColor: colors.bg,
        color: colors.text,
        display: 'flex',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Collapsible Sidebar */}
      <Sidebar
        collections={collections}
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          setSelectedTag(null);
        }}
        activeCollectionId={activeCollectionId}
        onSelectCollection={(idx) => {
          setActiveView('collection');
          setActiveCollectionId(idx);
          setSelectedTag(null);
        }}
        favoriteCount={favorites.length}
        readLaterCount={readLater.length}
        archiveCount={archive.length}
        topRatedCount={topRatedCount}
        rewatchCount={rewatchCount}
        watchedCount={watchedCount}
        totalLinkCount={allLinks.length}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        allTags={allTags}
        theme={theme}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenAddCollection={() => setIsAddCollectionModalOpen(true)}
        user={{ username: data?.username, name: data?.name }}
      />

      {/* Main Workspace Frame */}
      <div
        ref={mainFrameRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          maxHeight: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Top Omnibar Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          viewMode={viewMode}
          onChangeViewMode={handleViewModeChange}
          sortOption={sortOption}
          onChangeSortOption={setSortOption}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          user={{ username: data?.username, name: data?.name }}
          onLogout={onLogout}
        />

        {/* Content Canvas */}
        <main
          ref={mainContentRef}
          style={{
            flex: 1,
            padding: isMobile ? '16px 14px' : '28px 32px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {/* View Title Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    fontFamily: 'var(--font-heading)',
                    color: colors.text,
                  }}
                >
                  {viewInfo.title}
                </h1>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    style={{
                      background: 'none',
                      border: `1px solid ${colors.border}`,
                      color: colors.textTertiary,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textSecondary }}>
                {viewInfo.subtitle}
              </p>
            </div>

            {/* Quick Action Button for Empty State */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: colors.accentLight,
                color: colors.accent,
                border: `1px solid ${colors.borderActive}30`,
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={15} />
              <span>Add to {activeView === 'collection' ? collections[activeCollectionId]?.collectionName : 'Collection'}</span>
            </button>
          </div>

          {/* Links Render Area */}
          {displayedLinks.length === 0 ? (
            /* Elegant Empty State */
            <div
              style={{
                textAlign: 'center',
                padding: '64px 20px',
                borderRadius: '16px',
                border: `1px dashed ${colors.border}`,
                backgroundColor: isDark ? 'rgba(24, 24, 27, 0.4)' : '#fafafa',
                maxWidth: '480px',
                margin: '40px auto',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: colors.accentLight,
                  color: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <BookOpen size={24} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '600', color: colors.text }}>
                {searchQuery ? 'No matching bookmarks' : 'No links saved here yet'}
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: colors.textSecondary, lineHeight: '1.5' }}>
                {searchQuery
                  ? `Try checking your spelling or search by another keyword or tag.`
                  : `Start collecting links, articles, and websites to keep your workspace organized.`}
              </p>
              <button
                onClick={() => {
                  if (searchQuery) setSearchQuery('');
                  else setIsAddModalOpen(true);
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: colors.accent,
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: `0 2px 8px ${colors.accentLight}`,
                }}
              >
                {searchQuery ? 'Clear Search' : '+ Add First Link'}
              </button>
            </div>
          ) : viewMode === 'kanban' ? (
            /* Kanban Board Mode */
            <KanbanView
              links={displayedLinks}
              theme={theme}
              favorites={favorites}
              readLater={readLater}
              archive={archive}
              onToggleFavorite={handleToggleFavorite}
              onToggleReadLater={handleToggleReadLater}
              onToggleWatched={handleToggleWatched}
              onRate={handleRate}
              onInspect={(item) => setDrawerItem(item)}
              onCopySuccess={() => showToast('Link copied to clipboard!')}
            />
          ) : viewMode === 'list' ? (
            /* Dense Compact List View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {paginatedLinks.map((item, idx) => (
                <LinkCard
                  key={idx}
                  link={item.url}
                  theme={theme}
                  viewMode="list"
                  isFavorite={item.isFavorite}
                  isReadLater={item.isReadLater}
                  rating={item.rating || 0}
                  review={item.review || ''}
                  watched={item.watched || false}
                  watchCount={item.watchCount || 0}
                  rewatchWorthy={item.rewatchWorthy || false}
                  customTitle={item.title}
                  customTags={item.customTags}
                  notes={item.notes}
                  collectionName={item.collectionName}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleReadLater={handleToggleReadLater}
                  onToggleWatched={() => handleToggleWatched(item.url)}
                  onRate={handleRate}
                  onInspect={(it) => setDrawerItem(it)}
                  onCopySuccess={() => showToast('Link copied to clipboard!')}
                  onSelectTag={setSelectedTag}
                />
              ))}
            </div>
          ) : (
            /* Visual Responsive Grid View */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? '1fr'
                  : 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: isMobile ? '14px' : '18px',
              }}
            >
              {paginatedLinks.map((item, idx) => (
                <LinkCard
                  key={idx}
                  link={item.url}
                  theme={theme}
                  viewMode="grid"
                  isFavorite={item.isFavorite}
                  isReadLater={item.isReadLater}
                  rating={item.rating || 0}
                  review={item.review || ''}
                  watched={item.watched || false}
                  watchCount={item.watchCount || 0}
                  rewatchWorthy={item.rewatchWorthy || false}
                  customTitle={item.title}
                  customTags={item.customTags}
                  notes={item.notes}
                  collectionName={item.collectionName}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleReadLater={handleToggleReadLater}
                  onToggleWatched={() => handleToggleWatched(item.url)}
                  onRate={handleRate}
                  onInspect={(it) => setDrawerItem(it)}
                  onCopySuccess={() => showToast('Link copied to clipboard!')}
                  onSelectTag={setSelectedTag}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {viewMode !== 'kanban' && displayedLinks.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={displayedLinks.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* Slide-over Inspector Drawer */}
      <LinkDetailDrawer
        item={drawerItem}
        isOpen={Boolean(drawerItem)}
        onClose={() => setDrawerItem(null)}
        collections={collections}
        onUpdateItem={handleUpdateLink}
        onDeleteItem={handleDeleteLink}
        theme={theme}
        onShowToast={showToast}
      />

      {/* Quick Add Link Modal */}
      <AddLinkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        collections={collections}
        activeCollectionIndex={activeCollectionId}
        onAddLink={handleAddLink}
        theme={theme}
        onShowToast={showToast}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        allLinks={allLinks}
        collections={collections}
        onSelectLink={(item) => setDrawerItem(item)}
        onSelectView={(view) => setActiveView(view)}
        onSelectCollection={(idx) => {
          setActiveView('collection');
          setActiveCollectionId(idx);
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onToggleTheme={handleToggleTheme}
        theme={theme}
      />

      {/* Add New Collection Modal */}
      {isAddCollectionModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
          }}
          onClick={() => setIsAddCollectionModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: isDark ? colors.bgSecondary : '#ffffff',
              border: `1px solid ${colors.border}`,
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '380px',
              width: '90%',
              boxShadow: colors.shadowLg,
              animation: 'scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FolderPlus size={18} style={{ color: colors.accent }} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text }}>
                New Collection
              </h3>
            </div>
            <form onSubmit={handleCreateCollection}>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Design Inspiration, AI Tools..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? colors.bgTertiary : '#f8fafc',
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '13.5px',
                  outline: 'none',
                  marginBottom: '16px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddCollectionModalOpen(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    background: 'transparent',
                    color: colors.textSecondary,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: colors.accent,
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} theme={theme} />
    </div>
  );
}