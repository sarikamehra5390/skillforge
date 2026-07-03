import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Check, X, UserPlus, Trash2, Send, Trees, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import useFriendsStore from "../store/useFriendsStore";
import useAuthStore from "../store/useAuthStore";
import GlassCard from "../components/common/GlassCard";
import Badge from "../components/common/Badge";
import { getTreeStage } from "../utils/gamification";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { user } = useAuthStore();
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    searchResults,
    fetchFriends,
    fetchPendingRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
  } = useFriendsStore();

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, [fetchFriends, fetchPendingRequests]);

  useEffect(() => {
    searchUsers(debouncedQuery);
  }, [debouncedQuery, searchUsers]);

  const isFriend = (userId) => friends.some((f) => f._id === userId);
  const isIncoming = (userId) => incomingRequests.some((r) => r._id === userId);
  const isOutgoing = (userId) => outgoingRequests.some((r) => r._id === userId);

  return (
    <div className="space-y-8 pb-24">
      <h1 className="text-3xl font-bold text-white italic">Friends</h1>

      {/* My Friends Section */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 italic">My Friends</h2>
        {friends.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Users size={48} className="mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No friends yet</h3>
            <p className="text-slate-400 mb-6">Start growing your community by adding friends!</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => {
              const treeStage = getTreeStage(friend.xp);
              return (
                <GlassCard key={friend._id} className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold italic">
                      {friend.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm">{friend.displayName || friend.username}</h3>
                      <p className="text-xs text-slate-400">Level {friend.level} • 🔥 {friend.streak} days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{treeStage.emoji}</span>
                    <span className="text-sm text-slate-400">{treeStage.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/friend/${friend._id}`}
                      className="flex-1 px-3 py-2 rounded-xl bg-primary-500/10 text-primary-300 text-sm font-medium hover:bg-primary-500/20 transition-colors"
                    >
                      Visit Sanctuary
                    </Link>
                    <button
                      onClick={() => removeFriend(friend._id)}
                      className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </section>

      {/* Pending Requests */}
      {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incoming Requests */}
          {incomingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 italic">Incoming Requests</h2>
              <div className="space-y-3">
                {incomingRequests.map((user) => {
                  const treeStage = getTreeStage(user.xp);
                  return (
                    <GlassCard key={user._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold italic">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm">{user.displayName || user.username}</h3>
                            <p className="text-xs text-slate-400">Level {user.level}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptFriendRequest(user._id)}
                            className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => rejectFriendRequest(user._id)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* Outgoing Requests */}
          {outgoingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 italic">Outgoing Requests</h2>
              <div className="space-y-3">
                {outgoingRequests.map((user) => {
                  return (
                    <GlassCard key={user._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold italic">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm">{user.displayName || user.username}</h3>
                            <p className="text-xs text-slate-400">Level {user.level}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => cancelFriendRequest(user._id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-500/10 text-slate-400 text-xs font-medium hover:bg-slate-500/20 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Find Friends Section */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 italic">Find Friends</h2>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, email, or display name"
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-400/30"
            />
          </div>
        </div>

        {searchQuery && searchResults.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Users size={48} className="mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No users found</h3>
            <p className="text-slate-400">Try a different search query</p>
          </GlassCard>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((user) => {
              const treeStage = getTreeStage(user.xp);
              const isFriendStatus = isFriend(user._id);
              const isIncomingStatus = isIncoming(user._id);
              const isOutgoingStatus = isOutgoing(user._id);
              return (
                <GlassCard key={user._id} className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold italic">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm">{user.displayName || user.username}</h3>
                      <p className="text-xs text-slate-400">Level {user.level} • 🔥 {user.streak} days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{treeStage.emoji}</span>
                    <span className="text-sm text-slate-400">{treeStage.name}</span>
                  </div>
                  {isFriendStatus ? (
                    <div className="w-full px-3 py-2 rounded-xl bg-green-500/10 text-green-400 text-sm font-medium text-center">
                      Already Friends
                    </div>
                  ) : isIncomingStatus ? (
                    <div className="w-full px-3 py-2 rounded-xl bg-yellow-500/10 text-yellow-400 text-sm font-medium text-center">
                      Request Pending (Incoming)
                    </div>
                  ) : isOutgoingStatus ? (
                    <div className="w-full px-3 py-2 rounded-xl bg-slate-500/10 text-slate-400 text-sm font-medium text-center">
                      Request Sent
                    </div>
                  ) : (
                    <button
                      onClick={() => sendFriendRequest(user._id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary-500/10 text-primary-300 text-sm font-medium hover:bg-primary-500/20 transition-colors"
                    >
                      <UserPlus size={16} />
                      Add Friend
                    </button>
                  )}
                </GlassCard>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default Friends;