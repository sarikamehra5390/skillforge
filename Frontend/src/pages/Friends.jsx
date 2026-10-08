import { useEffect, useState } from "react";

import {
  Users,
  Search,
  Check,
  X,
  UserPlus,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";

import useFriendsStore from "../store/useFriendsStore";
import useAuthStore from "../store/useAuthStore";

import GlassCard from "../components/common/GlassCard";

import { getTreeStage } from "../utils/gamification";
import useDebounce from "../utils/useDebounce";

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] =
    useState(null);

  const debouncedQuery = useDebounce(
    searchQuery,
    300
  );

  const user = useAuthStore((state) => state.user);

  const friends = useFriendsStore(
    (state) => state.friends
  );

  const incomingRequests = useFriendsStore(
    (state) => state.incomingRequests
  );

  const outgoingRequests = useFriendsStore(
    (state) => state.outgoingRequests
  );

  const searchResults = useFriendsStore(
    (state) => state.searchResults
  );

  const fetchFriends = useFriendsStore(
    (state) => state.fetchFriends
  );

  const fetchPendingRequests = useFriendsStore(
    (state) => state.fetchPendingRequests
  );

  const searchUsers = useFriendsStore(
    (state) => state.searchUsers
  );

  const sendFriendRequest = useFriendsStore(
    (state) => state.sendFriendRequest
  );

  const acceptFriendRequest = useFriendsStore(
    (state) => state.acceptFriendRequest
  );

  const rejectFriendRequest = useFriendsStore(
    (state) => state.rejectFriendRequest
  );

  const cancelFriendRequest = useFriendsStore(
    (state) => state.cancelFriendRequest
  );

  const removeFriend = useFriendsStore(
    (state) => state.removeFriend
  );

  // ---------------------------------------------------------
  // Safe arrays
  // ---------------------------------------------------------

  const safeFriends = Array.isArray(friends)
    ? friends
    : [];

  const safeIncomingRequests = Array.isArray(
    incomingRequests
  )
    ? incomingRequests
    : [];

  const safeOutgoingRequests = Array.isArray(
    outgoingRequests
  )
    ? outgoingRequests
    : [];

  const safeSearchResults = Array.isArray(
    searchResults
  )
    ? searchResults
    : [];

  // ---------------------------------------------------------
  // Fetch Friends & Requests
  // ---------------------------------------------------------

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, [
    fetchFriends,
    fetchPendingRequests,
  ]);

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
  // Status Helpers
  // ---------------------------------------------------------

  const isFriend = (userId) =>
    safeFriends.some(
      (friend) =>
        String(friend?._id) === String(userId)
    );

  const isIncoming = (userId) =>
    safeIncomingRequests.some(
      (requestUser) =>
        String(requestUser?._id) ===
        String(userId)
    );

  const isOutgoing = (userId) =>
    safeOutgoingRequests.some(
      (requestUser) =>
        String(requestUser?._id) ===
        String(userId)
    );

  // ---------------------------------------------------------
  // Safe User Helpers
  // ---------------------------------------------------------

  const getUsername = (person) =>
    String(person?.username || "User").trim();

  const getDisplayName = (person) =>
    String(
      person?.displayName ||
        getUsername(person)
    ).trim();

  const getAvatarLetter = (person) => {
    const username = getUsername(person);

    return (
      username.charAt(0).toUpperCase() || "U"
    );
  };

  const getLevel = (person) =>
    Number(person?.level) || 1;

  const getXP = (person) =>
    Number(person?.xp) || 0;

  const getStreak = (person) =>
    Number(person?.streak) || 0;

  // ---------------------------------------------------------
  // Action Handler
  // ---------------------------------------------------------

  const handleAction = async (
    actionKey,
    action
  ) => {
    if (!action || actionLoading) return;

    setActionLoading(actionKey);

    try {
      await action();
    } catch (error) {
      console.error(
        "Friend action failed:",
        error
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <h1 className="text-3xl font-bold text-white italic">
        Friends
      </h1>

      {/* =====================================================
          My Friends
      ===================================================== */}

      <section>
        <h2 className="text-xl font-bold text-white mb-4 italic">
          My Friends
        </h2>

        {safeFriends.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Users
              size={48}
              className="mx-auto text-slate-500 mb-4"
              aria-hidden="true"
            />

            <h3 className="text-lg font-bold text-white mb-2">
              No friends yet
            </h3>

            <p className="text-slate-400 mb-6">
              Start growing your community by adding
              friends!
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeFriends.map((friend) => {
              const friendXP = getXP(friend);

              const treeStage = getTreeStage(
                friendXP
              );

              const friendId = friend?._id;

              return (
                <GlassCard
                  key={
                    friendId ||
                    getUsername(friend)
                  }
                  className="p-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold italic shrink-0"
                      aria-hidden="true"
                    >
                      {getAvatarLetter(friend)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">
                        {getDisplayName(friend)}
                      </h3>

                      <p className="text-xs text-slate-400">
                        Level {getLevel(friend)} • 🔥{" "}
                        {getStreak(friend)} days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="text-2xl"
                      role="img"
                      aria-label={
                        treeStage?.name ||
                        "Tree stage"
                      }
                    >
                      {treeStage?.emoji || "🌱"}
                    </span>

                    <span className="text-sm text-slate-400">
                      {treeStage?.name ||
                        "Seed"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/friend/${friendId}`}
                      className="flex-1 px-3 py-2 rounded-xl bg-primary-500/10 text-primary-300 text-sm font-medium hover:bg-primary-500/20 transition-colors text-center"
                    >
                      Visit Sanctuary
                    </Link>

                    <button
                      type="button"
                      disabled={
                        actionLoading ===
                        `remove-${friendId}`
                      }
                      onClick={() =>
                        handleAction(
                          `remove-${friendId}`,
                          () =>
                            removeFriend(friendId)
                        )
                      }
                      aria-label={`Remove ${getDisplayName(
                        friend
                      )} from friends`}
                      className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2
                        size={16}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================
          Pending Requests
      ===================================================== */}

      {(safeIncomingRequests.length > 0 ||
        safeOutgoingRequests.length > 0) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incoming Requests */}
          {safeIncomingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 italic">
                Incoming Requests
              </h2>

              <div className="space-y-3">
                {safeIncomingRequests.map(
                  (requestUser) => {
                    const requestId =
                      requestUser?._id;

                    return (
                      <GlassCard
                        key={
                          requestId ||
                          getUsername(requestUser)
                        }
                        className="p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold italic shrink-0"
                              aria-hidden="true"
                            >
                              {getAvatarLetter(
                                requestUser
                              )}
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-bold text-white text-sm truncate">
                                {getDisplayName(
                                  requestUser
                                )}
                              </h3>

                              <p className="text-xs text-slate-400">
                                Level{" "}
                                {getLevel(
                                  requestUser
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={
                                Boolean(
                                  actionLoading
                                )
                              }
                              onClick={() =>
                                handleAction(
                                  `accept-${requestId}`,
                                  () =>
                                    acceptFriendRequest(
                                      requestId
                                    )
                                )
                              }
                              aria-label={`Accept friend request from ${getDisplayName(
                                requestUser
                              )}`}
                              className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check
                                size={16}
                                aria-hidden="true"
                              />
                            </button>

                            <button
                              type="button"
                              disabled={
                                Boolean(
                                  actionLoading
                                )
                              }
                              onClick={() =>
                                handleAction(
                                  `reject-${requestId}`,
                                  () =>
                                    rejectFriendRequest(
                                      requestId
                                    )
                                )
                              }
                              aria-label={`Reject friend request from ${getDisplayName(
                                requestUser
                              )}`}
                              className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X
                                size={16}
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Outgoing Requests */}
          {safeOutgoingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 italic">
                Outgoing Requests
              </h2>

              <div className="space-y-3">
                {safeOutgoingRequests.map(
                  (requestUser) => {
                    const requestId =
                      requestUser?._id;

                    return (
                      <GlassCard
                        key={
                          requestId ||
                          getUsername(requestUser)
                        }
                        className="p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold italic shrink-0"
                              aria-hidden="true"
                            >
                              {getAvatarLetter(
                                requestUser
                              )}
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-bold text-white text-sm truncate">
                                {getDisplayName(
                                  requestUser
                                )}
                              </h3>

                              <p className="text-xs text-slate-400">
                                Level{" "}
                                {getLevel(
                                  requestUser
                                )}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={
                              actionLoading ===
                              `cancel-${requestId}`
                            }
                            onClick={() =>
                              handleAction(
                                `cancel-${requestId}`,
                                () =>
                                  cancelFriendRequest(
                                    requestId
                                  )
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-slate-500/10 text-slate-400 text-xs font-medium hover:bg-slate-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                          >
                            Cancel
                          </button>
                        </div>
                      </GlassCard>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================
          Find Friends
      ===================================================== */}

      <section>
        <h2 className="text-xl font-bold text-white mb-4 italic">
          Find Friends
        </h2>

        <div className="mb-6">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search by username or display name..."
              aria-label="Search for friends"
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-400/30"
            />
          </div>
        </div>

        {searchQuery.trim() &&
        safeSearchResults.filter(
          (resultUser) =>
            String(resultUser?._id) !==
            String(user?._id)
        ).length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Users
              size={48}
              className="mx-auto text-slate-500 mb-4"
              aria-hidden="true"
            />

            <h3 className="text-lg font-bold text-white mb-2">
              No users found
            </h3>

            <p className="text-slate-400">
              Try a different search query
            </p>
          </GlassCard>
        ) : (
          (() => {
            const filteredResults =
              safeSearchResults.filter(
                (resultUser) =>
                  String(resultUser?._id) !==
                  String(user?._id)
              );

            if (filteredResults.length === 0) {
              return null;
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map(
                  (resultUser) => {
                    const resultId =
                      resultUser?._id;

                    const resultXP =
                      getXP(resultUser);

                    const treeStage =
                      getTreeStage(
                        resultXP
                      );

                    const isFriendStatus =
                      isFriend(resultId);

                    const isIncomingStatus =
                      isIncoming(resultId);

                    const isOutgoingStatus =
                      isOutgoing(resultId);

                    return (
                      <GlassCard
                        key={
                          resultId ||
                          getUsername(
                            resultUser
                          )
                        }
                        className="p-4"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold italic shrink-0"
                            aria-hidden="true"
                          >
                            {getAvatarLetter(
                              resultUser
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-sm truncate">
                              {getDisplayName(
                                resultUser
                              )}
                            </h3>

                            <p className="text-xs text-slate-400">
                              Level{" "}
                              {getLevel(
                                resultUser
                              )}{" "}
                              • 🔥{" "}
                              {getStreak(
                                resultUser
                              )}{" "}
                              days
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span
                            className="text-2xl"
                            role="img"
                            aria-label={
                              treeStage?.name ||
                              "Tree stage"
                            }
                          >
                            {treeStage?.emoji ||
                              "🌱"}
                          </span>

                          <span className="text-sm text-slate-400">
                            {treeStage?.name ||
                              "Seed"}
                          </span>
                        </div>

                        {isFriendStatus ? (
                          <div className="w-full px-3 py-2 rounded-xl bg-green-500/10 text-green-400 text-sm font-medium text-center">
                            Already Friends
                          </div>
                        ) : isIncomingStatus ? (
                          <div className="w-full px-3 py-2 rounded-xl bg-yellow-500/10 text-yellow-400 text-sm font-medium text-center">
                            Request Pending
                            (Incoming)
                          </div>
                        ) : isOutgoingStatus ? (
                          <div className="w-full px-3 py-2 rounded-xl bg-slate-500/10 text-slate-400 text-sm font-medium text-center">
                            Request Sent
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              actionLoading ===
                              `send-${resultId}`
                            }
                            onClick={() =>
                              handleAction(
                                `send-${resultId}`,
                                () =>
                                  sendFriendRequest(
                                    resultId
                                  )
                              )
                            }
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary-500/10 text-primary-300 text-sm font-medium hover:bg-primary-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <UserPlus
                              size={16}
                              aria-hidden="true"
                            />

                            {actionLoading ===
                            `send-${resultId}`
                              ? "Sending..."
                              : "Add Friend"}
                          </button>
                        )}
                      </GlassCard>
                    );
                  }
                )}
              </div>
            );
          })()
        )}
      </section>
    </div>
  );
};

export default Friends;
