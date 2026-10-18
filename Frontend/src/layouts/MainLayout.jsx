import { useEffect, useState } from "react";

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
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches
  );

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
        try {
          const {
            hasCheckedInToday,
          } = await checkMoodToday();

          if (
            !cancelled &&
            !hasCheckedInToday
          ) {
            setShowCheckInModal(true);
          }
        } catch (error) {
          if (!cancelled) {
            console.error(
              "Failed to check today's mood:",
              error
            );
          }
        }

        try {
          await fetchSettings();
        } catch (error) {
          if (!cancelled) {
            console.error(
              "Failed to fetch sanctuary settings:",
              error
            );
          }
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
    <div className="ambient-bg flex h-screen w-screen overflow-hidden overflow-x-hidden font-sans selection:bg-primary-500/30">
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
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="relative z-10 flex min-w-0 w-0 flex-1 flex-col">
        <Navbar
          setSidebarOpen={setSidebarOpen}
        />

        <main className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
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
