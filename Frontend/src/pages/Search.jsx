import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, UserPlus, Users } from "lucide-react";
import useFriendsStore from "../store/useFriendsStore";
import GlassCard from "../components/common/GlassCard";
import { getTreeStage } from "../utils/gamification";

// Let's add a simple useDebounce hook inline for now!
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { searchResults, searchUsers, sendFriendRequest, friends, pendingRequests } = useFriendsStore();

  useEffect(() => {
    searchUsers(debouncedQuery);
  }, [debouncedQuery, searchUsers]);

  const isAlreadyFriend = (userId) => {
    return friends.some((f) => f._id === userId);
  };

  const hasPendingRequest = (userId) => {
    return pendingRequests.some((r) => r._id === userId);
  };

  return (
    <div className="space-y-8 pb-24">
      <h1 className="text-3xl font-bold text-white italic">Find Friends</h1>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username, email, or name..."
          className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-400/30"
        />
      </div>

      {searchResults.length === 0 && searchQuery ? (
        <GlassCard className="p-12 text-center">
          <Users size={64} className="mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
          <p className="text-slate-400">Try a different search query</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((user) => {
          const treeStage = getTreeStage(user.xp);
          return (
            <GlassCard key={user._id} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-2xl text-white font-bold italic">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{user.username}</h3>
                  <p className="text-sm text-slate-400">Level {user.level}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{treeStage.emoji}</span>
                  <span className="text-sm text-slate-300">{treeStage.name}</span>
                </div>
                <div className="text-sm text-slate-400">
                  🔥 {user.streak} day streak
                </div>
              </div>
              <button
                onClick={() => sendFriendRequest(user._id)}
                disabled={isAlreadyFriend(user._id) || hasPendingRequest(user._id)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  isAlreadyFriend(user._id)
                    ? "bg-slate-500/20 text-slate-400 cursor-not-allowed"
                    : hasPendingRequest(user._id)
                    ? "bg-yellow-500/20 text-yellow-400 cursor-not-allowed"
                    : "bg-primary-500/20 text-primary-300 hover:bg-primary-500/30"
                }`}
              >
                <UserPlus size={20} />
                {isAlreadyFriend(user._id)
                  ? "Already Friends"
                  : hasPendingRequest(user._id)
                  ? "Request Sent"
                  : "Add Friend"}
              </button>
            </GlassCard>
          );
        })}
        </div>
      )}
    </div>
  );
};

export default Search;
