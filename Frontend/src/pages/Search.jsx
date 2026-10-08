import React, { useEffect, useState } from "react";
import {
  Search as SearchIcon,
  UserPlus,
  Users,
} from "lucide-react";

import useFriendsStore from "../store/useFriendsStore";
import GlassCard from "../components/common/GlassCard";
import { getTreeStage } from "../utils/gamification";
import useDebounce from "../utils/useDebounce";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [requestingUserId, setRequestingUserId] =
    useState(null);

  const debouncedQuery = useDebounce(
    searchQuery,
    300
  );

  const searchResults =
    useFriendsStore(
      (state) => state.searchResults
    ) || [];

  const searchUsers = useFriendsStore(
    (state) => state.searchUsers
  );

  const sendFriendRequest = useFriendsStore(
    (state) => state.sendFriendRequest
  );

  const friends =
    useFriendsStore(
      (state) => state.friends
    ) || [];

  const incomingRequests =
    useFriendsStore(
      (state) => state.incomingRequests
    ) || [];

  const outgoingRequests =
    useFriendsStore(
      (state) => state.outgoingRequests
    ) || [];

  // ---------------------------------------------------------
  // Search
  // ---------------------------------------------------------

  useEffect(() => {
    const query = debouncedQuery.trim();

    if (!query) {
      return;
    }

    searchUsers(query);
  }, [debouncedQuery, searchUsers]);

  // ---------------------------------------------------------
  // Friend status helpers
  // ---------------------------------------------------------

  const isAlreadyFriend = (userId) => {
    return friends.some(
      (friend) => friend?._id === userId
    );
  };

  const hasPendingRequest = (userId) => {
    return (
      incomingRequests.some(
        (request) => request?._id === userId
      ) ||
      outgoingRequests.some(
        (request) => request?._id === userId
      )
    );
  };

  // ---------------------------------------------------------
  // Send friend request
  // ---------------------------------------------------------

  const handleSendFriendRequest = async (
    userId
  ) => {
    if (!userId || requestingUserId) return;

    if (
      isAlreadyFriend(userId) ||
      hasPendingRequest(userId)
    ) {
      return;
    }

    setRequestingUserId(userId);

    try {
      await sendFriendRequest(userId);
    } catch (error) {
      console.error(
        "Failed to send friend request:",
        error
      );
    } finally {
      setRequestingUserId(null);
    }
  };

  const hasQuery =
    debouncedQuery.trim().length > 0;

  return (
    <div className="space-y-8 pb-24">
      <h1 className="text-3xl font-bold text-white italic">
        Find Friends
      </h1>

      {/* Search Input */}
      <div className="relative">
        <SearchIcon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
          aria-hidden="true"
        />

        <input
          type="search"
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
          placeholder="Search by username or display name..."
          aria-label="Search for friends"
          autoComplete="off"
          className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-400/30"
        />
      </div>

      {/* Empty Search */}
      {!hasQuery ? (
        <GlassCard className="p-12 text-center">
          <Users
            size={64}
            className="mx-auto text-slate-500 mb-4"
            aria-hidden="true"
          />

          <h3 className="text-xl font-bold text-white mb-2">
            Find your friends
          </h3>

          <p className="text-slate-400">
            Start typing to search for friends
          </p>
        </GlassCard>
      ) : searchResults.length === 0 ? (
        /* No Results */
        <GlassCard className="p-12 text-center">
          <Users
            size={64}
            className="mx-auto text-slate-500 mb-4"
            aria-hidden="true"
          />

          <h3 className="text-xl font-bold text-white mb-2">
            No users found
          </h3>

          <p className="text-slate-400">
            Try a different search query
          </p>
        </GlassCard>
      ) : (
        /* Results */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((user) => {
            const userId = user?._id;

            const username =
              user?.username ||
              user?.displayName ||
              "User";

            const displayName =
              user?.displayName ||
              user?.username ||
              "User";

            const level =
              Number(user?.level) || 1;

            const streak =
              Number(user?.streak) || 0;

            const treeStage = getTreeStage(
              Number(user?.xp) || 0
            );

            const alreadyFriend =
              isAlreadyFriend(userId);

            const pendingRequest =
              hasPendingRequest(userId);

            const isRequesting =
              requestingUserId === userId;

            return (
              <GlassCard
                key={userId}
                className="p-6"
              >
                {/* User Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-2xl text-white font-bold italic">
                    {username
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">
                      {displayName}
                    </h3>

                    <p className="text-sm text-slate-400">
                      Level {level}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl"
                      aria-hidden="true"
                    >
                      {treeStage.emoji}
                    </span>

                    <span className="text-sm text-slate-300">
                      {treeStage.name}
                    </span>
                  </div>

                  <div className="text-sm text-slate-400">
                    <span aria-hidden="true">
                      🔥
                    </span>{" "}
                    {streak} day streak
                  </div>
                </div>

                {/* Friend Request */}
                <button
                  type="button"
                  onClick={() =>
                    handleSendFriendRequest(userId)
                  }
                  disabled={
                    alreadyFriend ||
                    pendingRequest ||
                    isRequesting ||
                    !userId
                  }
                  aria-label={
                    alreadyFriend
                      ? `${displayName} is already your friend`
                      : pendingRequest
                      ? `Friend request pending for ${displayName}`
                      : `Add ${displayName} as a friend`
                  }
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    alreadyFriend
                      ? "bg-slate-500/20 text-slate-400 cursor-not-allowed"
                      : pendingRequest ||
                        isRequesting
                      ? "bg-yellow-500/20 text-yellow-400 cursor-not-allowed"
                      : "bg-primary-500/20 text-primary-300 hover:bg-primary-500/30"
                  }`}
                >
                  <UserPlus
                    size={20}
                    aria-hidden="true"
                  />

                  {isRequesting
                    ? "Sending..."
                    : alreadyFriend
                    ? "Already Friends"
                    : pendingRequest
                    ? "Request Pending"
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