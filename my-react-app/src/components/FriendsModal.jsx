import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  UserX,
  ExternalLink,
  Clock,
  Sparkles,
  Loader2,
  Folder,
  Globe
} from 'lucide-react';
import { themes } from '../utils/themes';
import { api } from '../utils/api';

export const FriendsModal = ({
  isOpen,
  onClose,
  theme = 'dark',
  onSelectFriend,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' | 'requests' | 'find'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const colors = themes[theme] || themes.dark;
  const isDark = theme === 'dark';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [friendsList, requestsList] = await Promise.all([
        api.getFriends().catch(() => []),
        api.getPendingFriendRequests().catch(() => [])
      ]);
      setFriends(friendsList || []);
      setRequests(requestsList || []);
    } catch (err) {
      console.warn('Friends load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Live search debouncing
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.searchUsers(searchQuery.trim());
        setSearchResults(results || []);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSendRequest = async (targetIdentifier) => {
    setActionLoadingId(targetIdentifier);
    try {
      await api.sendFriendRequest(targetIdentifier);
      onToast?.('Friend request sent successfully!', 'success');
      // Refresh search results
      if (searchQuery.trim()) {
        const results = await api.searchUsers(searchQuery.trim());
        setSearchResults(results || []);
      }
      loadData();
    } catch (err) {
      onToast?.(err.message || 'Failed to send friend request', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      await api.acceptFriendRequest(requestId);
      onToast?.('Friend request accepted!', 'success');
      loadData();
    } catch (err) {
      onToast?.(err.message || 'Failed to accept request', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      await api.rejectFriendRequest(requestId);
      onToast?.('Friend request declined.', 'info');
      loadData();
    } catch (err) {
      onToast?.(err.message || 'Failed to decline request', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveFriend = async (friendUserId, friendName) => {
    if (!window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      return;
    }
    setActionLoadingId(friendUserId);
    try {
      await api.removeFriend(friendUserId);
      onToast?.(`Removed ${friendName} from friends.`, 'info');
      loadData();
    } catch (err) {
      onToast?.(err.message || 'Failed to remove friend', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease forwards',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '85vh',
          backgroundColor: isDark ? '#141418' : '#ffffff',
          borderRadius: '16px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: colors.text }}>
                Friends & Social Sharing
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.textSecondary }}>
                Connect with friends to view and rate their public collections
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close"
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: colors.textTertiary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '0 24px',
            borderBottom: `1px solid ${colors.border}`,
            gap: '8px',
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : '#f8fafc',
          }}
        >
          <button
            onClick={() => setActiveTab('friends')}
            style={{
              padding: '12px 14px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              color: activeTab === 'friends' ? '#6366f1' : colors.textSecondary,
              borderBottom: activeTab === 'friends' ? '2px solid #6366f1' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Users size={15} />
            <span>My Friends</span>
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                color: colors.text,
              }}
            >
              {friends.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '12px 14px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              color: activeTab === 'requests' ? '#6366f1' : colors.textSecondary,
              borderBottom: activeTab === 'requests' ? '2px solid #6366f1' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <UserPlus size={15} />
            <span>Requests</span>
            {requests.length > 0 && (
              <span
                style={{
                  fontSize: '10.5px',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: '#f43f5e',
                  color: '#ffffff',
                  fontWeight: '700',
                }}
              >
                {requests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('find')}
            style={{
              padding: '12px 14px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              color: activeTab === 'find' ? '#6366f1' : colors.textSecondary,
              borderBottom: activeTab === 'find' ? '2px solid #6366f1' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Search size={15} />
            <span>Find People</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* TAB 1: MY FRIENDS */}
          {activeTab === 'friends' && (
            <div>
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 size={24} className="animate-spin" color="#6366f1" />
                </div>
              ) : friends.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                      color: colors.textTertiary,
                    }}
                  >
                    <Users size={26} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', color: colors.text, fontSize: '15px' }}>
                    No friends connected yet
                  </h4>
                  <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: colors.textSecondary, maxWidth: '320px', marginInline: 'auto' }}>
                    Use the <strong>Find People</strong> tab to search for other members and exchange friend requests.
                  </p>
                  <button
                    onClick={() => setActiveTab('find')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Find Friends
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            fontWeight: '700',
                          }}
                        >
                          {(friend.name || friend.username || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>
                              {friend.name || friend.username}
                            </span>
                            <span style={{ fontSize: '11px', color: colors.textTertiary }}>
                              @{friend.username}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                            <span style={{ fontSize: '11.5px', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Folder size={12} color="#6366f1" />
                              {friend.publicCollectionsCount} public collections
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => {
                            onClose();
                            onSelectFriend?.(friend);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${colors.border}`,
                            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.08)',
                            color: isDark ? '#a5b4fc' : '#4f46e5',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                          title="View public collections"
                        >
                          <Globe size={13} />
                          <span>Browse</span>
                        </button>

                        <button
                          onClick={() => handleRemoveFriend(friend.id, friend.name || friend.username)}
                          disabled={actionLoadingId === friend.id}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: colors.textTertiary,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Remove Friend"
                        >
                          <UserX size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING REQUESTS */}
          {activeTab === 'requests' && (
            <div>
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 size={24} className="animate-spin" color="#6366f1" />
                </div>
              ) : requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                      color: colors.textTertiary,
                    }}
                  >
                    <UserPlus size={26} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', color: colors.text, fontSize: '15px' }}>
                    No pending friend requests
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: colors.textSecondary }}>
                    When someone sends you a friend request, it will appear right here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '700',
                          }}
                        >
                          {(req.senderName || req.senderUsername || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: '600', color: colors.text }}>
                            {req.senderName || req.senderUsername}
                          </div>
                          <div style={{ fontSize: '11px', color: colors.textTertiary }}>
                            @{req.senderUsername} wants to connect
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          disabled={actionLoadingId === req.id}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={14} />
                          <span>Accept</span>
                        </button>

                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          disabled={actionLoadingId === req.id}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: `1px solid ${colors.border}`,
                            background: 'none',
                            color: colors.textSecondary,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FIND PEOPLE */}
          {activeTab === 'find' && (
            <div>
              <div
                style={{
                  position: 'relative',
                  marginBottom: '16px',
                }}
              >
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.textTertiary,
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by username, email, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? '#1a1a22' : '#f8fafc',
                    color: colors.text,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {isSearching && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6366f1',
                    }}
                  />
                )}
              </div>

              {searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '700',
                          }}
                        >
                          {(user.name || user.username || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>
                            {user.name || user.username}
                          </div>
                          <div style={{ fontSize: '11px', color: colors.textTertiary }}>
                            @{user.username}
                          </div>
                        </div>
                      </div>

                      {user.friendshipStatus === 'Friends' ? (
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: '600',
                            color: '#10b981',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          }}
                        >
                          Friends ✓
                        </span>
                      ) : user.friendshipStatus === 'PendingSent' ? (
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: '500',
                            color: colors.textSecondary,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0',
                          }}
                        >
                          Request Sent ⏳
                        </span>
                      ) : user.friendshipStatus === 'PendingReceived' ? (
                        <button
                          onClick={() => user.requestId && handleAcceptRequest(user.requestId)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Accept Request
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(user.username)}
                          disabled={actionLoadingId === user.username}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <UserPlus size={13} />
                          <span>Add Friend</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 2 && !isSearching ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: colors.textSecondary, fontSize: '13px' }}>
                  No members found matching "{searchQuery}"
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: colors.textTertiary, fontSize: '12.5px' }}>
                  Type a username or email address above to find and invite friends.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

