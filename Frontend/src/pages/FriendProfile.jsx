import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Flower2,
  Star,
  Flame,
  AlertCircle,
  Loader2,
} from "lucide-react";

import useFriendsStore from "../store/useFriendsStore";
import useSanctuaryStore from "../store/useSanctuaryStore";

import GlassCard from "../components/common/GlassCard";
import Button from "../components/common/Button";

import {
  getTreeStage,
  TREE_STAGES,
} from "../utils/gamification";

import {
  COMPANION_OPTIONS,
  TREE_OPTIONS,
  THEME_OPTIONS,
} from "../utils/sanctuary";

const DEFAULT_REACTIONS = {
  flower: 0,
  star: 0,
  fire: 0,
};

const normalizeReactions = (data) => ({
  flower: Number(data?.flower) || 0,
  star: Number(data?.star) || 0,
  fire: Number(data?.fire) || 0,
});

const FriendProfile = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();

  const [friend, setFriend] = useState(null);
  const [sanctuary, setSanctuary] = useState(null);
  const [reactions, setReactions] = useState(
    DEFAULT_REACTIONS
  );
  const [error, setError] = useState(null);
  const [loadedFriendId, setLoadedFriendId] = useState(null);
  const loading = Boolean(friendId) && loadedFriendId !== friendId;
  const [reactionLoading, setReactionLoading] =
    useState(null);

  const sendReaction = useFriendsStore(
    (state) => state.sendReaction
  );

  const fetchPublicProfile = useFriendsStore(
    (state) => state.fetchPublicProfile
  );

  const fetchReactions = useFriendsStore(
    (state) => state.fetchReactions
  );

  const fetchPublicSanctuary = useSanctuaryStore(
    (state) => state.fetchPublicSanctuary
  );

  // ---------------------------------------------------------
  // Fetch Friend Data
  // ---------------------------------------------------------

  useEffect(() => {
    if (!friendId) return undefined;

    let active = true;
    const loadFriend = async () => {
      try {
        const [userData, sanctuaryData, reactionsData] = await Promise.all([
          fetchPublicProfile(friendId),
          fetchPublicSanctuary(friendId).catch(() => null),
          fetchReactions(friendId).catch(() => DEFAULT_REACTIONS),
        ]);

        if (!userData) throw new Error("Friend profile was not found.");
        if (!active) return;

        setError(null);
        setFriend(userData);
        setSanctuary(sanctuaryData);
        setReactions(normalizeReactions(reactionsData));
      } catch (err) {
        if (!active) return;
        console.error("Failed to fetch friend data:", err);
        setFriend(null);
        setSanctuary(null);
        setReactions(DEFAULT_REACTIONS);
        setError(
          "This sanctuary could not be reached. It may be private or the link is broken."
        );
      } finally {
        if (active) setLoadedFriendId(friendId);
      }
    };

    loadFriend();
    return () => {
      active = false;
    };
  }, [friendId, fetchPublicProfile, fetchPublicSanctuary, fetchReactions]);

  // ---------------------------------------------------------
  // Send Reaction
  // ---------------------------------------------------------

  const handleSendReaction = async (type) => {
    if (
      !friendId ||
      reactionLoading ||
      !["flower", "star", "fire"].includes(type)
    ) {
      return;
    }

    setReactionLoading(type);

    try {
      await sendReaction(friendId, type);

      const updatedReactions =
        await fetchReactions(friendId);

      setReactions(
        normalizeReactions(updatedReactions)
      );
    } catch (err) {
      console.error(
        "Failed to send reaction:",
        err
      );
    } finally {
      setReactionLoading(null);
    }
  };

  // ---------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 gap-4">
        <Loader2
          size={36}
          className="animate-spin text-primary-400"
          aria-hidden="true"
        />

        <p className="text-slate-400">
          Finding sanctuary...
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Error State
  // ---------------------------------------------------------

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <GlassCard className="p-5 sm:p-8 md:p-10 max-w-md text-center border-red-500/20 bg-red-500/5">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertCircle
              size={40}
              aria-hidden="true"
            />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3 italic">
            Sanctuary Unreachable
          </h2>

          <p className="text-slate-400 mb-8 leading-relaxed">
            {error}
          </p>

          <Button
            type="button"
            onClick={() => navigate(-1)}
            variant="secondary"
          >
            <ArrowLeft
              size={16}
              className="mr-2"
            />

            Go Back
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (!friend) {
    return null;
  }

  // ---------------------------------------------------------
  // Safe Friend Data
  // ---------------------------------------------------------

  const username =
    String(friend.username || "User").trim();

  const displayName =
    String(
      friend.displayName || username
    ).trim();

  const friendXP = Number(friend.xp) || 0;
  const friendLevel = Number(friend.level) || 1;
  const friendStreak = Number(friend.streak) || 0;
  const longestStreak =
    Number(friend.longestStreak) || 0;

  const avatarLetter =
    username.charAt(0).toUpperCase() || "U";

  // ---------------------------------------------------------
  // Tree Stage
  // ---------------------------------------------------------

  const treeStage = getTreeStage(friendXP);

  const selectedTree =
    TREE_STAGES.find(
      (tree) =>
        tree.stage === treeStage?.stage
    ) || TREE_STAGES[0];

  // ---------------------------------------------------------
  // Sanctuary Options
  // ---------------------------------------------------------

  const selectedTheme = sanctuary?.themeId
    ? THEME_OPTIONS.find(
        (theme) =>
          theme.id === sanctuary.themeId
      )
    : null;

  const sanctuaryTree = sanctuary?.treeType
    ? TREE_OPTIONS.find(
        (tree) =>
          tree.id === sanctuary.treeType
      )
    : null;

  const companion = sanctuary?.companionId
    ? COMPANION_OPTIONS.find(
        (item) =>
          item.id === sanctuary.companionId
      )
    : null;

  const hasSanctuaryInfo = Boolean(
    sanctuary?.bio ||
      selectedTheme ||
      sanctuaryTree ||
      companion
  );

  // ---------------------------------------------------------
  // Reaction Button
  // ---------------------------------------------------------

  const reactionButtons = [
    {
      type: "flower",
      icon: Flower2,
      color:
        "text-pink-400 bg-pink-500/20 hover:bg-pink-500/30",
      label: "Send flower",
    },
    {
      type: "star",
      icon: Star,
      color:
        "text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30",
      label: "Send star",
    },
    {
      type: "fire",
      icon: Flame,
      color:
        "text-orange-400 bg-orange-500/20 hover:bg-orange-500/30",
      label: "Send fire",
    },
  ];

  return (
    <div className="space-y-8 pb-24">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft
          size={20}
          aria-hidden="true"
        />

        Back
      </button>

      {/* Hero Section */}
      <GlassCard className="p-4 sm:p-6 md:p-8 text-center relative overflow-hidden">
        {/* Subtle theme layer */}
        {selectedTheme && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            aria-hidden="true"
          />
        )}

        <div className="relative z-10">
          {/* Avatar */}
          <div
            className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-4xl text-white font-bold italic shadow-2xl"
            aria-label={`${displayName} profile`}
          >
            {avatarLetter}
          </div>

          <h1 className="text-3xl font-bold text-white italic mb-2">
            {displayName}
          </h1>

          <p className="text-slate-400 mb-6">
            Level {friendLevel} •{" "}
            {friendXP.toLocaleString()} XP
          </p>

          {/* Sanctuary Info */}
          {hasSanctuaryInfo && (
            <div className="mb-8 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              {sanctuary?.bio && (
                <p className="text-sm text-slate-300 font-medium italic mb-6 leading-relaxed">
                  &quot;{sanctuary.bio}&quot;
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-6">
                {/* Theme */}
                {selectedTheme && (
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] min-w-[100px]">
                    <span
                      className="text-3xl"
                      role="img"
                      aria-label={
                        selectedTheme.name
                      }
                    >
                      {selectedTheme.emoji}
                    </span>

                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {selectedTheme.name}
                    </span>
                  </div>
                )}

                {/* Tree */}
                {sanctuaryTree && (
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] min-w-[100px]">
                    <span
                      className="text-3xl"
                      role="img"
                      aria-label={
                        sanctuaryTree.name
                      }
                    >
                      {sanctuaryTree.emoji}
                    </span>

                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {sanctuaryTree.name}
                    </span>
                  </div>
                )}

                {/* Companion */}
                {companion && (
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] min-w-[100px]">
                    <span
                      className="text-3xl animate-bounce"
                      role="img"
                      aria-label={
                        companion.name
                      }
                    >
                      {companion.emoji}
                    </span>

                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {companion.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tree Display */}
          <div className="mb-8">
            <div
              className="text-8xl mb-4"
              role="img"
              aria-label={selectedTree.name}
            >
              {selectedTree.emoji}
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              {selectedTree.name}
            </h2>

            <p className="text-slate-400">
              🔥 {friendStreak} day streak
            </p>
          </div>

          {/* Encouragement Reactions */}
          <div className="flex items-center justify-center gap-8 mb-8">
            {reactionButtons.map(
              ({
                type,
                icon: Icon,
                color,
                label,
              }) => {
                const isLoading =
                  reactionLoading === type;

                return (
                  <div
                    key={type}
                    className="text-center"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSendReaction(type)
                      }
                      disabled={
                        Boolean(reactionLoading) ||
                        isLoading
                      }
                      aria-label={label}
                      className={`p-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
                    >
                      {isLoading ? (
                        <Loader2
                          size={32}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Icon
                          size={32}
                          aria-hidden="true"
                        />
                      )}
                    </button>

                    <p className="text-2xl font-bold text-white mt-2">
                      {reactions[type] ?? 0}
                    </p>
                  </div>
                );
              }
            )}
          </div>

          <p className="text-sm text-slate-500">
            Leave an encouragement to support their
            growth! (3 per type/day)
          </p>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total XP */}
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">
            Total XP
          </p>

          <p className="text-3xl font-bold text-white">
            {friendXP.toLocaleString()}
          </p>
        </GlassCard>

        {/* Current Streak */}
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">
            Current Streak
          </p>

          <p className="text-3xl font-bold text-white">
            {friendStreak}
          </p>
        </GlassCard>

        {/* Tree Stage */}
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">
            Tree Stage
          </p>

          <p className="text-3xl font-bold text-white">
            {treeStage?.stage ?? 1}
          </p>
        </GlassCard>

        {/* Longest Streak */}
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">
            Longest Streak
          </p>

          <p className="text-3xl font-bold text-white">
            {longestStreak}
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default FriendProfile;
