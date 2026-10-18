import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import Dashboard from "./pages/Dashboard";
import Skills from "./pages/Skills";
import Sessions from "./pages/Sessions";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Friends from "./pages/Friends";
import FriendProfile from "./pages/FriendProfile";
import CommunityGarden from "./pages/CommunityGarden";
import ManageAccount from "./pages/ManageAccount";
import NotificationSettings from "./pages/NotificationSettings";
import NotFound from "./pages/NotFound";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { TreeProvider } from "./context/TreeContext";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TreeProvider>
          <Toaster
            position="top-right"
            theme="dark"
            closeButton
            richColors
          />

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
        </TreeProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
