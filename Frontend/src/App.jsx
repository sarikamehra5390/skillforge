import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'sonner';

import Dashboard from "./pages/Dashboard";
import Skills from "./pages/Skills";
import Sessions from "./pages/Sessions";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Friends from "./pages/Friends";
import Search from "./pages/Search";
import FriendProfile from "./pages/FriendProfile";
import CommunityGarden from "./pages/CommunityGarden";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" theme="dark" closeButton richColors />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
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
            element={
              <MainLayout>
                <Search />
              </MainLayout>
            }
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
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
