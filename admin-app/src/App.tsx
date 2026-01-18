import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import { ROUTES } from './utils/constants';

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react';
import Loader from './components/common/Loader';

const UserList = lazy(() => import('./pages/users/UserList'));
const ChannelList = lazy(() => import('./pages/channels/ChannelList'));
const VideoList = lazy(() => import('./pages/videos/VideoList'));
const ProgramList = lazy(() => import('./pages/programs/ProgramList'));
const LivestreamList = lazy(() => import('./pages/livestreams/LivestreamList'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Loader />}>
                  <UserList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/channels"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Loader />}>
                  <ChannelList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Loader />}>
                  <VideoList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/programs"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Loader />}>
                  <ProgramList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/livestreams"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Loader />}>
                  <LivestreamList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
