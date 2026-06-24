import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Search, Check, X } from "lucide-react";
import useFriendsStore from "../store/useFriendsStore";
import GlassCard from "../components/common/GlassCard";
import Badge from "../components/common/Badge";
import { getTreeStage } from "../utils/gamification";

const Friends = () => {
  const {
    friends,
    pendingRequests,
    fetchFriends,
    fetchPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriendsStore();

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, [fetchFriends, fetchPendingRequests]);

  const today = new Date().toDateString();

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white italic">Friends</h1>
        <Link
          to="/search"
          className="px-6 py-3 bg-primary-500/20 text-primary-300 rounded-xl font-medium hover:bg-primary-500/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search size={20} />
            Find Friends
          </div>
        </Link>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4 italic">Pending Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((user) => (
              <GlassCard key={user._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold italic">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{user.username}</h3>
                      <p className="text-sm text-slate-400">Level {user.level}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptFriendRequest(user._id)}
                      className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(user._id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* Friends List */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 italic">Your Friends</h2>
        {friends.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Users size={64} className="mx-auto text-slate-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No friends yet</h3>
            <p className="text-slate-400 mb-6">Start growing your community by adding friends!</p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500/20 text-primary-300 rounded-xl font-medium hover:bg-primary-500/30 transition-colors"
            >
              <Search size={20} />
              Find Friends
            </Link>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => {
              const treeStage = getTreeStage(friend.xp);
              const practicedToday = friend.lastPracticeDate
                ? new Date(friend.lastPracticeDate).toDateString() === today
                : false;
              return (
                <Link to={`/friend/${friend._id}`} key={friend._id}>
                  <GlassCard className="p-6 hover:bg-white/5 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-2xl text-white font-bold italic">
                        {friend.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{friend.username}</h3>
                          {practicedToday && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Practiced Today
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">Level {friend.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{treeStage.emoji}</span>
                        <span className="text-sm text-slate-300">{treeStage.name}</span>
                      </div>
                      <div className="text-sm text-slate-400">
                        🔥 {friend.streak} day streak
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Friends;
