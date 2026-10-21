import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import Login from "./pages/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { TreeProvider } from "./context/TreeContext";
import { MotionConfig } from "framer-motion";
import useSanctuaryStore from "./store/useSanctuaryStore";
import { AmbienceAudioProvider } from "./context/AmbienceAudioContext";

const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Skills = lazy(() => import("./pages/Skills"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Profile = lazy(() => import("./pages/Profile"));
const Friends = lazy(() => import("./pages/Friends"));
const FriendProfile = lazy(() => import("./pages/FriendProfile"));
const CommunityGarden = lazy(() => import("./pages/CommunityGarden"));
const ManageAccount = lazy(() => import("./pages/ManageAccount"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));

const RouteLoadingFallback = () => (
  <div className="ambient-bg flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center" role="status" aria-label="Loading SkillForge">
    <img src="/brand/skillforge-fox.png" alt="" className="h-16 w-16 object-contain" />
    <p className="text-sm font-semibold text-white/70">Preparing your sanctuary…</p>
  </div>
);

function App() {
  const reducedMotion = useSanctuaryStore((state) => state.settings?.reducedMotion);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <TreeProvider>
          <AmbienceAudioProvider>
          <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
          <Toaster
            position="top-right"
            theme="dark"
            closeButton
            richColors
          />

          <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                }
              />

              <Route
                path="/skills"
                element={
                  <MainLayout>
                    <Skills />
                  </MainLayout>
                }
              />

              <Route
                path="/sessions"
                element={
                  <MainLayout>
                    <Sessions />
                  </MainLayout>
                }
              />

              <Route
                path="/analytics"
                element={
                  <MainLayout>
                    <Analytics />
                  </MainLayout>
                }
              />

              <Route
                path="/achievements"
                element={
                  <MainLayout>
                    <Achievements />
                  </MainLayout>
                }
              />

              <Route
                path="/profile"
                element={
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                }
              />

              <Route
                path="/friends"
                element={
                  <MainLayout>
                    <Friends />
                  </MainLayout>
                }
              />

              <Route
                path="/search"
                element={<Navigate to="/friends" replace />}
              />

              <Route
                path="/friend/:friendId"
                element={
                  <MainLayout>
                    <FriendProfile />
                  </MainLayout>
                }
              />

              <Route
                path="/garden"
                element={
                  <MainLayout>
                    <CommunityGarden />
                  </MainLayout>
                }
              />

              <Route
                path="/account"
                element={
                  <MainLayout>
                    <ManageAccount />
                  </MainLayout>
                }
              />

              <Route
                path="/notifications"
                element={
                  <MainLayout>
                    <NotificationSettings />
                  </MainLayout>
                }
              />
            </Route>

            {/* Fallback */}
            <Route
              path="*"
              element={<NotFound />}
            />
          </Routes>
          </Suspense>
          </MotionConfig>
          </AmbienceAudioProvider>
        </TreeProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
