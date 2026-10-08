import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Flower2, Star, Flame, AlertCircle, Loader2 } from "lucide-react";
import useFriendsStore from "../store/useFriendsStore";
import useSanctuaryStore from "../store/useSanctuaryStore";
import GlassCard from "../components/common/GlassCard";
import Button from "../components/common/Button";
import { getTreeStage, TREE_STAGES } from "../utils/gamification";
import { COMPANION_OPTIONS, TREE_OPTIONS, THEME_OPTIONS } from "../utils/sanctuary";

const FriendProfile = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [sanctuary, setSanctuary] = useState(null);
  const [reactions, setReactions] = useState({ flower: 0, star: 0, fire: 0 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { sendReaction, fetchPublicProfile, fetchReactions } = useFriendsStore();
  const { fetchPublicSanctuary } = useSanctuaryStore();

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [userData, sanctuaryData, reactionsData] = await Promise.all([
        fetchPublicProfile(friendId),
        fetchPublicSanctuary(friendId).catch(() => null),
        fetchReactions(friendId).catch(() => ({ flower: 0, star: 0, fire: 0 })),
      ]);
      setFriend(userData);
      setSanctuary(sanctuaryData);
      setReactions(reactionsData || { flower: 0, star: 0, fire: 0 });
    } catch (err) {
      console.error("Failed to fetch friend data:", err);
      setError("This sanctuary could not be reached. It may be private or the link is broken.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (friendId) fetchData();
  }, [friendId]);

  const handleSendReaction = async (type) => {
    try {
      await sendReaction(friendId, type);
      const updatedReactions = await fetchReactions(friendId);
      if (updatedReactions) {
        setReactions(updatedReactions);
      }
    } catch (err) {
      console.error("Failed to send reaction:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 gap-4">
        <Loader2 size={36} className="animate-spin text-primary-400" />
        <p className="text-slate-400">Finding sanctuary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <GlassCard className="p-10 max-w-md text-center border-red-500/20 bg-red-500/5">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 italic">Sanctuary Unreachable</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">{error}</p>
          <Button onClick={() => navigate(-1)} variant="secondary">
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (!friend) {
    return null;
  }

  const treeStage = getTreeStage(friend.xp);
  const selectedTree = TREE_STAGES.find((t) => t.stage === treeStage.stage) || TREE_STAGES[0];

  const selectedTheme = sanctuary?.themeId
    ? THEME_OPTIONS.find((t) => t.id === sanctuary.themeId)
    : null;
  const sanctuaryTree = sanctuary?.treeType
    ? TREE_OPTIONS.find((t) => t.id === sanctuary.treeType)
    : null;
  const companion = sanctuary?.companionId
    ? COMPANION_OPTIONS.find((c) => c.id === sanctuary.companionId)
    : null;

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
      <GlassCard className="p-8 text-center relative overflow-hidden">
        {selectedTheme && (
          <div className="absolute inset-0 opacity-10 pointer-events-none" />
        )}
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-4xl text-white font-bold italic shadow-2xl">
            {(() => { const fc = friend.username?.charAt(0); return fc ? fc.toUpperCase() : '?'; })()}
          </div>
          <h1 className="text-3xl font-bold text-white italic mb-2">{friend.username}</h1>
          <p className="text-slate-400 mb-6">Level {friend.level ?? 1} • {friend.xp ?? 0} XP</p>

          {/* Sanctuary Info */}
          {(sanctuary?.bio || selectedTheme || sanctuaryTree || companion) && (
            <div className="mb-8 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              {sanctuary?.bio && (
                <p className="text-sm text-slate-300 font-medium italic mb-6 leading-relaxed">"{sanctuary.bio}"</p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-6">
                {selectedTheme && (
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] min-w-[100px]">
                    <span className="text-3xl">{selectedTheme.emoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedTheme.name}</span>
                  </div>
                )}
                {sanctuaryTree && (
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] min-w-[100px]">
                    <span className="text-3xl">{sanctuaryTree.emoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sanctuaryTree.name}</span>
                  </div>
                )}
                {companion && (
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] min-w-[100px]">
                    <span className="text-3xl animate-bounce">{companion.emoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{companion.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tree Display */}
          <div className="mb-8">
            <div className="text-8xl mb-4">{selectedTree.emoji}</div>
            <h2 className="text-xl font-bold text-white mb-2">{selectedTree.name}</h2>
            <p className="text-slate-400">🔥 {friend.streak ?? 0} day streak</p>
          </div>

          {/* Encouragement Reactions */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <button
                onClick={() => handleSendReaction("flower")}
                className="p-4 rounded-2xl bg-pink-500/20 hover:bg-pink-500/30 transition-colors"
              >
                <Flower2 size={32} className="text-pink-400" />
              </button>
              <p className="text-2xl font-bold text-white mt-2">{reactions.flower ?? 0}</p>
            </div>
            <div className="text-center">
              <button
                onClick={() => handleSendReaction("star")}
                className="p-4 rounded-2xl bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
              >
                <Star size={32} className="text-yellow-400" />
              </button>
              <p className="text-2xl font-bold text-white mt-2">{reactions.star ?? 0}</p>
            </div>
            <div className="text-center">
              <button
                onClick={() => handleSendReaction("fire")}
                className="p-4 rounded-2xl bg-orange-500/20 hover:bg-orange-500/30 transition-colors"
              >
                <Flame size={32} className="text-orange-400" />
              </button>
              <p className="text-2xl font-bold text-white mt-2">{reactions.fire ?? 0}</p>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Leave an encouragement to support their growth! (3 per type/day)
          </p>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Total XP</p>
          <p className="text-3xl font-bold text-white">{friend.xp ?? 0}</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Current Streak</p>
          <p className="text-3xl font-bold text-white">{friend.streak ?? 0}</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Tree Stage</p>
          <p className="text-3xl font-bold text-white">{treeStage.stage ?? 1}</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Longest Streak</p>
          <p className="text-3xl font-bold text-white">{friend.longestStreak ?? 0}</p>
        </GlassCard>
      </div>
    </div>
  );
};

export default FriendProfile;
