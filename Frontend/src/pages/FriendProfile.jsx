import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { ArrowLeft, Flower2, Star, Flame } from "lucide-react";
import api from "../api/axios";
import useFriendsStore from "../store/useFriendsStore";
import useSanctuaryStore from "../store/useSanctuaryStore";
import GlassCard from "../components/common/GlassCard";
import { getTreeStage, TREE_STAGES } from "../utils/gamification";
import { COMPANION_OPTIONS } from "../utils/sanctuary";

const FriendProfile = () => {
  const { friendId } = useParams();
  const [friend, setFriend] = useState(null);
  const [sanctuary, setSanctuary] = useState(null);
  const [reactions, setReactions] = useState({ flower: 0, star: 0, fire: 0 });
  const { sendReaction } = useFriendsStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, sanctuaryRes, reactionsRes] = await Promise.all([
          api.get(`/users/${friendId}`),
          api.get(`/sanctuary/${friendId}`), // Oops, need to update sanctuary routes for public access! Wait, for now, let's just get the user and basic info.
          api.get(`/reactions/${friendId}`),
        ]);
        setFriend(userRes.data);
        setSanctuary(sanctuaryRes.data);
        setReactions(reactionsRes.data);
      } catch (error) {
        console.error("Failed to fetch friend data:", error);
      }
    };
    if (friendId) fetchData();
  }, [friendId]);

  if (!friend) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  const treeStage = getTreeStage(friend.xp);
  const selectedTree = TREE_STAGES.find((t) => t.stage === treeStage.stage) || TREE_STAGES[0];

  return (
    <div className="space-y-8 pb-24">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Hero Section */}
      <GlassCard className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-4xl text-white font-bold italic">
          {friend.username[0].toUpperCase()}
        </div>
        <h1 className="text-3xl font-bold text-white italic mb-2">{friend.username}</h1>
        <p className="text-slate-400 mb-6">Level {friend.level} • {friend.xp} XP</p>

        {/* Tree Display */}
        <div className="mb-8">
          <div className="text-8xl mb-4">{selectedTree.emoji}</div>
          <h2 className="text-xl font-bold text-white mb-2">{selectedTree.name}</h2>
          <p className="text-slate-400">🔥 {friend.streak} day streak</p>
        </div>

        {/* Encouragement Reactions */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <button
              onClick={() => sendReaction(friendId, "flower")}
              className="p-4 rounded-2xl bg-pink-500/20 hover:bg-pink-500/30 transition-colors"
            >
              <Flower2 size={32} className="text-pink-400" />
            </button>
            <p className="text-2xl font-bold text-white mt-2">{reactions.flower}</p>
          </div>
          <div className="text-center">
            <button
              onClick={() => sendReaction(friendId, "star")}
              className="p-4 rounded-2xl bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
            >
              <Star size={32} className="text-yellow-400" />
            </button>
            <p className="text-2xl font-bold text-white mt-2">{reactions.star}</p>
          </div>
          <div className="text-center">
            <button
              onClick={() => sendReaction(friendId, "fire")}
              className="p-4 rounded-2xl bg-orange-500/20 hover:bg-orange-500/30 transition-colors"
            >
              <Flame size={32} className="text-orange-400" />
            </button>
            <p className="text-2xl font-bold text-white mt-2">{reactions.fire}</p>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Leave an encouragement to support their growth! (3 per type/day)
        </p>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Total XP</p>
          <p className="text-3xl font-bold text-white">{friend.xp}</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Current Streak</p>
          <p className="text-3xl font-bold text-white">{friend.streak}</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Tree Stage</p>
          <p className="text-3xl font-bold text-white">{treeStage.stage}</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Longest Streak</p>
          <p className="text-3xl font-bold text-white">{friend.longestStreak || 0}</p>
        </GlassCard>
      </div>
    </div>
  );
};

export default FriendProfile;
