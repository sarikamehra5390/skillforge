import { useEffect, useRef, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CheckInModal from "../components/CheckInModal";
import CustomizeSanctuaryModal from "../components/CustomizeSanctuaryModal";
import Companion from "../components/Companion";
import Decorations from "../components/Decorations";
import Ambience from "../components/Ambience";

import useAppStore from "../store/useAppStore";
import useAuthStore from "../store/useAuthStore";
import useSanctuaryStore from "../store/useSanctuaryStore";

const fireflies = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  duration: `${10 + (index * 7) % 15}s`,
  x: `${((index * 97) % 600) - 300}px`,
  y: `${((index * 53) % 600) - 300}px`,
  top: `${(index * 37 + 11) % 100}%`,
  left: `${(index * 61 + 7) % 100}%`,
  animationDelay: `${(index * 13) % 10}s`,
}));

function MainLayout({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileNavOpen]);

  const showCheckInModal = useAppStore(
    (state) => state.showCheckInModal
  );

  const setShowCheckInModal = useAppStore(
    (state) => state.setShowCheckInModal
  );

  const checkMoodToday = useAppStore(
    (state) => state.checkMoodToday
  );

  const fetchSettings = useSanctuaryStore(
    (state) => state.fetchSettings
  );

  const settings = useSanctuaryStore(
    (state) => state.settings
  );

  const initializeFromLocal =
    useSanctuaryStore(
      (state) => state.initializeFromLocal
    );

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const activeAmbience = Array.isArray(
    settings?.music
  )
    ? settings.music
    : [];
  const ambientEffects = settings?.ambientEffects === true;
  const reducedMotion = settings?.reducedMotion === true;

  // Initialize user-specific data.
  useEffect(() => {
    if (!isAuthenticated) {
      initializeFromLocal();
      return;
    }

    let cancelled = false;

    const initializeAuthenticatedUser =
      async () => {
        const [moodResult, settingsResult] = await Promise.allSettled([
          checkMoodToday(),
          fetchSettings(),
        ]);

        if (cancelled) return;

        if (moodResult.status === "fulfilled") {
          if (!moodResult.value?.hasCheckedInToday) {
            setShowCheckInModal(true);
          }
        } else {
          console.error("Failed to check today's mood:", moodResult.reason);
        }

        if (settingsResult.status === "rejected") {
          console.error("Failed to fetch sanctuary settings:", settingsResult.reason);
        }
      };

    initializeAuthenticatedUser();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    checkMoodToday,
    setShowCheckInModal,
    fetchSettings,
    initializeFromLocal,
  ]);

  return (
    <div className="ambient-bg flex min-h-dvh w-full min-w-0 flex-col overflow-x-clip font-sans selection:bg-primary-500/30 md:h-dvh md:flex-row md:overflow-hidden">
      {/* Background Magical Elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-glow-pulse absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary-500/10 blur-[120px]" />

        <div
          className="animate-glow-pulse absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-secondary-500/10 blur-[120px]"
          style={{ animationDelay: "5s", animation: reducedMotion ? "none" : undefined }}
        />

        {/* Fireflies */}
        {ambientEffects && activeAmbience.includes("fireflies") &&
          fireflies.slice(0, Math.round(fireflies.length * ({ off: 0, low: 0.25, medium: 0.6, high: 1 }[settings?.particleIntensity] ?? 0.6))).map((firefly) => (
                <div
                  key={firefly.id}
                  className="firefly"
                  style={{
                    "--duration": firefly.duration,
                    "--x": firefly.x,
                    "--y": firefly.y,
                    top: firefly.top,
                    left: firefly.left,
                    animationDelay: firefly.animationDelay,
                    animation: reducedMotion ? "none" : undefined,
                    opacity: reducedMotion ? 0.65 : undefined,
                  }}
                  aria-hidden="true"
                />
          ))}
      </div>

      {/* Mobile Sidebar Backdrop */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() =>
            setMobileNavOpen(false)
          }
        />
      )}

      <Sidebar
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="relative z-10 flex min-h-0 min-w-0 w-full flex-1 flex-col md:w-0">
        <Navbar
          onMenuClick={() => setMobileNavOpen(true)}
          menuButtonRef={menuButtonRef}
          mobileMenuOpen={mobileNavOpen}
        />

        <main className="custom-scrollbar min-h-0 min-w-0 flex-1 overflow-y-visible p-3 sm:p-4 md:overflow-y-auto md:p-8">
          <div className="mx-auto w-full min-w-0 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() =>
          setShowCheckInModal(false)
        }
      />

      <CustomizeSanctuaryModal />

      <Ambience />

      <Decorations />

      <Companion />
    </div>
  );
}

export default MainLayout;
