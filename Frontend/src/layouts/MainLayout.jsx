import { useEffect, useMemo, useState } from "react";
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

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    showCheckInModal,
    setShowCheckInModal,
    checkMoodToday,
  } = useAppStore();

  const {
    fetchSettings,
    settings,
    initializeFromLocal,
  } = useSanctuaryStore();

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const activeAmbience = settings?.music || [];

  // Generate firefly properties only once.
  // This prevents them from jumping to new positions
  // whenever MainLayout rerenders.
  const fireflies = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        duration: `${10 + Math.random() * 15}s`,
        x: `${(Math.random() - 0.5) * 600}px`,
        y: `${(Math.random() - 0.5) * 600}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
      })),
    []
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDesktop = window.matchMedia(
        "(min-width: 768px)"
      ).matches;

      setSidebarOpen(isDesktop);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      initializeFromLocal();
      return;
    }

    const initializeAuthenticatedUser = async () => {
      try {
        const { hasCheckedInToday } = await checkMoodToday();

        if (!hasCheckedInToday) {
          setShowCheckInModal(true);
        }
      } catch (error) {
        console.error(
          "Failed to check today's mood:",
          error
        );
      }

      try {
        await fetchSettings();
      } catch (error) {
        console.error(
          "Failed to fetch sanctuary settings:",
          error
        );
      }
    };

    initializeAuthenticatedUser();
  }, [
    isAuthenticated,
    checkMoodToday,
    setShowCheckInModal,
    fetchSettings,
    initializeFromLocal,
  ]);

  return (
    <div className="flex h-screen w-screen ambient-bg overflow-hidden overflow-x-hidden font-sans selection:bg-primary-500/30">
      {/* Background Magical Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] animate-glow-pulse" />

        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-500/10 rounded-full blur-[120px] animate-glow-pulse"
          style={{ animationDelay: "5s" }}
        />

        {/* Fireflies */}
        {activeAmbience.includes("fireflies") &&
          fireflies.map((firefly) => (
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
              }}
            />
          ))}
      </div>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 w-0 relative z-10">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>

      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
      />

      <CustomizeSanctuaryModal />

      <Ambience />

      <Decorations />

      <Companion />
    </div>
  );
}

export default MainLayout;