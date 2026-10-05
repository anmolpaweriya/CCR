import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { AssistancePage } from './pages/AssistancePage';
import { CreateAssistancePage } from './pages/CreateAssistancePage';
import { AssistanceDetailsPage } from './pages/AssistanceDetailsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { CreateResourcePage } from './pages/CreateResourcePage';
import { ResourceDetailsPage } from './pages/ResourceDetailsPage';
import { WalletPage } from './pages/WalletPage';
import { GoodwillPage } from './pages/GoodwillPage';
import { MyActivitiesPage } from './pages/MyActivitiesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Connecting to CCR Network...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <ExplorePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assistance"
                element={
                  <ProtectedRoute>
                    <AssistancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assistance/new"
                element={
                  <ProtectedRoute>
                    <CreateAssistancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assistance/:id"
                element={
                  <ProtectedRoute>
                    <AssistanceDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resources"
                element={
                  <ProtectedRoute>
                    <ResourcesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resources/new"
                element={
                  <ProtectedRoute>
                    <CreateResourcePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resources/:id"
                element={
                  <ProtectedRoute>
                    <ResourceDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goodwill"
                element={
                  <ProtectedRoute>
                    <GoodwillPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-activities"
                element={
                  <ProtectedRoute>
                    <MyActivitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
