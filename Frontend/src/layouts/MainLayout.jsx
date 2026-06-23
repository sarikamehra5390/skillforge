import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CheckInModal from "../components/CheckInModal";
import useAppStore from "../store/useAppStore";
import useAuthStore from "../store/useAuthStore";

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { showCheckInModal, setShowCheckInModal, checkMoodToday } = useAppStore();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      checkMoodToday().then(({ hasCheckedInToday }) => {
        if (!hasCheckedInToday) {
          setShowCheckInModal(true);
        }
      });
    }
  }, [isAuthenticated, checkMoodToday, setShowCheckInModal]);

  return (
    <div className="flex h-screen ambient-bg overflow-hidden font-sans selection:bg-primary-500/30">
      {/* Background Magical Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-500/10 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '5s' }} />
        
        {/* Fireflies */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="firefly"
            style={{
              '--duration': `${10 + Math.random() * 15}s`,
              '--x': `${(Math.random() - 0.5) * 600}px`,
              '--y': `${(Math.random() - 0.5) * 600}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <CheckInModal isOpen={showCheckInModal} onClose={() => setShowCheckInModal(false)} />
    </div>
  );
}

export default MainLayout;
