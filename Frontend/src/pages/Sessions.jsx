import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  Calendar,
  History,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import api from "../api/axios";

import SessionTimeline from "../components/sessions/SessionTimeline";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import GlassCard from "../components/common/GlassCard";
import Illustration from "../components/common/Illustration";
import XPPopup from "../components/XPPopup";

import useDashboardStore from "../store/useDashboardStore";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [isLogModalOpen, setIsLogModalOpen] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [newSession, setNewSession] = useState({
    skillId: "",
    duration: "",
    notes: "",
  });

  const [showXPPopup, setShowXPPopup] =
    useState(false);

  const [xpGained, setXpGained] = useState(0);

  const createSession = useDashboardStore(
    (state) => state.createSession
  );

  // ---------------------------------------------------------
  // Fetch sessions + skills
  // ---------------------------------------------------------

  const fetchData = async () => {
    setError(null);
    setLoading(true);

    try {
      const [sessionsRes, skillsRes] =
        await Promise.all([
          api.get("/sessions"),
          api.get("/skills"),
        ]);

      const sessionData = Array.isArray(
        sessionsRes.data
      )
        ? sessionsRes.data
        : [];

      const skillData = Array.isArray(
        skillsRes.data
      )
        ? skillsRes.data
        : [];

      setSessions(sessionData);
      setSkills(skillData);
    } catch (requestError) {
      console.error(
        "Failed to load sessions:",
        requestError
      );

      toast.error(
        "Failed to read your journal"
      );

      setError(
        "Failed to load your journal. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setError(null);
      setLoading(true);

      try {
        const [
          sessionsRes,
          skillsRes,
        ] = await Promise.all([
          api.get("/sessions"),
          api.get("/skills"),
        ]);

        if (!mounted) return;

        const sessionData = Array.isArray(
          sessionsRes.data
        )
          ? sessionsRes.data
          : [];

        const skillData = Array.isArray(
          skillsRes.data
        )
          ? skillsRes.data
          : [];

        setSessions(sessionData);
        setSkills(skillData);
      } catch (requestError) {
        if (!mounted) return;

        console.error(
          "Failed to load sessions:",
          requestError
        );

        toast.error(
          "Failed to read your journal"
        );

        setError(
          "Failed to load your journal. Please try again."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------------------------------------
  // Session stats
  // ---------------------------------------------------------

  const totalDuration = useMemo(() => {
    return sessions.reduce(
      (total, session) =>
        total +
        (Number(session?.duration) || 0),
      0
    );
  }, [sessions]);

  const activeDays = useMemo(() => {
    const dates = sessions
      .map((session) => {
        if (!session?.completedAt) {
          return null;
        }

        const date = new Date(
          session.completedAt
        );

        return Number.isNaN(date.getTime())
          ? null
          : date.toDateString();
      })
      .filter(Boolean);

    return new Set(dates).size;
  }, [sessions]);

  // ---------------------------------------------------------
  // Search
  // ---------------------------------------------------------

  const normalizedSearchTerm =
    searchTerm.trim().toLowerCase();

  const filteredSessions = useMemo(() => {
    if (!normalizedSearchTerm) {
      return sessions;
    }

    return sessions.filter((session) => {
      const skillName = String(
        session?.skillName || ""
      ).toLowerCase();

      const notes = String(
        session?.notes || ""
      ).toLowerCase();

      return (
        skillName.includes(
          normalizedSearchTerm
        ) ||
        notes.includes(
          normalizedSearchTerm
        )
      );
    });
  }, [sessions, normalizedSearchTerm]);

  // ---------------------------------------------------------
  // Form changes
  // ---------------------------------------------------------

  const updateSessionField = (
    field,
    value
  ) => {
    setNewSession((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ---------------------------------------------------------
  // Close modal
  // ---------------------------------------------------------

  const closeModal = useCallback(() => {
    if (isSubmitting) return;

    setIsLogModalOpen(false);

    setNewSession({
      skillId: "",
      duration: "",
      notes: "",
    });
  }, [isSubmitting, setIsLogModalOpen]);

  // ---------------------------------------------------------
  // Escape key
  // ---------------------------------------------------------

  useEffect(() => {
    if (!isLogModalOpen) return;

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !isSubmitting
      ) {
        closeModal();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isLogModalOpen, isSubmitting, closeModal]);

  // ---------------------------------------------------------
  // Log session
  // ---------------------------------------------------------

  const handleLogSession = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!newSession.skillId) {
      toast.error(
        "Which path did you walk today?"
      );
      return;
    }

    const duration = Number(
      newSession.duration
    );

    if (
      !Number.isFinite(duration) ||
      duration < 1
    ) {
      toast.error(
        "Please enter at least 1 minute."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createSession({
        skillId: newSession.skillId,
        duration,
        notes: newSession.notes.trim(),
      });

      const xpGainedVal =
        Number(
          result?.xpGained ??
            result?.session?.xpGained
        ) || 0;

      toast.success(
        `A beautiful ritual. +${xpGainedVal} XP`,
        {
          icon: "🌱",
        }
      );

      setXpGained(xpGainedVal);
      setShowXPPopup(true);

      // Level up
      if (result?.levelUp) {
        toast.success(
          `You have evolved! Level ${result.newLevel}`,
          {
            icon: "🦋",
            duration: 6000,
          }
        );
      }

      // Achievements
      if (
        Array.isArray(
          result?.newUnlockedAchievements
        )
      ) {
        result.newUnlockedAchievements.forEach(
          (achievement) => {
            const title =
              achievement?.title ||
              achievement?.name ||
              "Achievement";

            toast.success(
              `Achievement Unlocked: ${title}!`,
              {
                icon: "🏆",
                duration: 5000,
              }
            );
          }
        );
      }

      setIsLogModalOpen(false);

      setNewSession({
        skillId: "",
        duration: "",
        notes: "",
      });

      await fetchData();
    } catch (requestError) {
      console.error(
        "Failed to create session:",
        requestError
      );

      toast.error(
        requestError?.response?.data?.message ||
          "The journal is full. Try again in a moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
            The Ritual Journal
          </h1>

          <p className="text-slate-400 font-medium leading-relaxed">
            Every moment of focus is a brick in the
            foundation of your mastery. Look back
            with pride at the time you've dedicated
            to your growth.
          </p>
        </div>

        <Button
          type="button"
          onClick={() =>
            setIsLogModalOpen(true)
          }
          size="lg"
          className="rounded-2xl shadow-xl shadow-primary-500/10"
        >
          <Plus
            size={20}
            className="mr-2"
            aria-hidden="true"
          />
          Log a Moment
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="p-8 flex items-center gap-8 group bg-white/[0.02] border-white/5">
          <div className="w-16 h-16 bg-primary-500/10 rounded-[1.5rem] flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform duration-500">
            <History
              size={28}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">
              Rituals
            </p>

            <p className="text-3xl font-bold text-white tracking-tighter">
              {sessions.length}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-8 flex items-center gap-8 group bg-white/[0.02] border-white/5">
          <div className="w-16 h-16 bg-secondary-500/10 rounded-[1.5rem] flex items-center justify-center text-secondary-400 group-hover:scale-110 transition-transform duration-500">
            <Clock
              size={28}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">
              Time Lived
            </p>

            <p className="text-3xl font-bold text-white tracking-tighter">
              {totalDuration}
              <span className="text-sm ml-1 text-slate-500 uppercase not-italic">
                m
              </span>
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-8 flex items-center gap-8 group bg-white/[0.02] border-white/5">
          <div className="w-16 h-16 bg-warm-amber/10 rounded-[1.5rem] flex items-center justify-center text-warm-amber group-hover:scale-110 transition-transform duration-500">
            <Calendar
              size={28}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">
              Active Days
            </p>

            <p className="text-3xl font-bold text-white tracking-tighter">
              {activeDays}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Search */}
      <GlassCard className="p-4 bg-white/[0.01] border-white/5">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-primary-400 transition-colors"
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder="Search your memories..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            aria-label="Search practice sessions"
            autoComplete="off"
            className="w-full bg-transparent border-none rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all"
          />
        </div>
      </GlassCard>

      {/* Timeline */}
      <div className="relative">
        {error ? (
          <GlassCard className="p-8 border-red-500/20 bg-red-500/5">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                <AlertCircle
                  size={32}
                  aria-hidden="true"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Journal is hard to reach
                </h3>

                <p className="text-slate-400">
                  {error}
                </p>
              </div>

              <Button
                type="button"
                onClick={fetchData}
                variant="secondary"
                className="shrink-0"
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className="mr-2"
                  aria-hidden="true"
                />
                Retry
              </Button>
            </div>
          </GlassCard>
        ) : loading ? (
          <div
            className="flex items-center justify-center py-24"
            role="status"
            aria-label="Loading sessions"
          >
            <Loader2
              size={40}
              className="text-primary-500 animate-spin"
            />
          </div>
        ) : filteredSessions.length > 0 ? (
          <SessionTimeline
            sessions={filteredSessions}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center relative overflow-hidden rounded-[3rem] bg-forge-900/20 border border-white/5">
            <div className="relative w-80 h-80 mb-8">
              <Illustration
                name="studySanctuary"
                className="w-full h-full opacity-90"
              />
            </div>

            <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight">
              Your growth journal is empty...
            </h3>

            <p className="text-slate-400 mt-2 font-medium max-w-sm mx-auto leading-relaxed">
              {normalizedSearchTerm
                ? "No watering moments match that search. Try looking for something else."
                : "Every practice session waters your tree. Record your first watering and watch your mastery grow."}
            </p>

            {!normalizedSearchTerm && (
              <Button
                type="button"
                className="mt-12 rounded-2xl px-12 py-5 shadow-2xl shadow-warm-amber/20 bg-gradient-to-r from-warm-amber to-primary-400 text-lg"
                onClick={() =>
                  setIsLogModalOpen(true)
                }
              >
                Water Your Tree
              </Button>
            )}

            {/* Ambient Glows */}
            <div
              className="absolute top-0 left-0 w-64 h-64 bg-warm-amber/5 rounded-full blur-[100px]"
              aria-hidden="true"
            />

            <div
              className="absolute bottom-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px]"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Log Session Modal */}
      {isLogModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forge-950/80 backdrop-blur-md animate-in fade-in duration-500"
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-session-title"
        >
          <GlassCard className="w-full max-w-md p-10 border-white/10 shadow-2xl rounded-[2.5rem]">
            <h2
              id="log-session-title"
              className="text-3xl font-bold text-white mb-8 tracking-tight italic"
            >
              Record a Ritual
            </h2>

            <form
              onSubmit={handleLogSession}
              className="space-y-8"
            >
              {/* Skill */}
              <div className="space-y-3">
                <label
                  htmlFor="session-skill"
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1"
                >
                  Mastery Path
                </label>

                <select
                  id="session-skill"
                  value={newSession.skillId}
                  onChange={(event) =>
                    updateSessionField(
                      "skillId",
                      event.target.value
                    )
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all appearance-none cursor-pointer"
                  required
                  disabled={
                    isSubmitting ||
                    skills.length === 0
                  }
                >
                  <option
                    value=""
                    disabled
                    className="bg-forge-950"
                  >
                    {skills.length === 0
                      ? "No skills available"
                      : "Which path?"}
                  </option>

                  {skills.map((skill) => (
                    <option
                      key={skill?._id}
                      value={skill?._id}
                      className="bg-forge-950"
                    >
                      {skill?.name || "Unnamed Skill"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <Input
                label="Time Dedicated (min)"
                type="number"
                min="1"
                step="1"
                placeholder="60"
                value={newSession.duration}
                onChange={(event) =>
                  updateSessionField(
                    "duration",
                    event.target.value
                  )
                }
                required
                disabled={isSubmitting}
                className="bg-white/5 border-white/10 p-4"
              />

              {/* Notes */}
              <div className="space-y-3">
                <label
                  htmlFor="session-notes"
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1"
                >
                  Reflections
                </label>

                <textarea
                  id="session-notes"
                  placeholder="What did you feel? What did you discover?"
                  value={newSession.notes}
                  onChange={(event) =>
                    updateSessionField(
                      "notes",
                      event.target.value
                    )
                  }
                  disabled={isSubmitting}
                  maxLength={2000}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all min-h-[120px] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-10">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 rounded-2xl py-4"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Close Journal
                </Button>

                <Button
                  type="submit"
                  className="flex-1 rounded-2xl py-4 shadow-xl shadow-primary-500/20"
                  loading={isSubmitting}
                  disabled={
                    isSubmitting ||
                    !newSession.skillId ||
                    !newSession.duration
                  }
                >
                  {isSubmitting
                    ? "Recording..."
                    : "Record Moment"}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* XP Popup */}
      <AnimatePresence>
        {showXPPopup && (
          <XPPopup
            xp={xpGained}
            onComplete={() =>
              setShowXPPopup(false)
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sessions;
