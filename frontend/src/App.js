import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import TouristMonitoring from './pages/TouristMonitoring';
import IncidentManagement from './pages/IncidentManagement';
import AIAnalytics from './pages/AIAnalytics';
import BlockchainLogs from './pages/BlockchainLogs';
import SystemHealth from './pages/SystemHealth';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ActivityLog from './pages/ActivityLog';
import Security from './pages/Security';
import GeofenceManagement from './pages/GeofenceManagement';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import { Analytics } from '@vercel/analytics/react';
import './App.css';

/* ── Dashboard shell (authenticated) ─────────────────────────── */
function DashboardShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/tourists" element={<TouristMonitoring />} />
            <Route path="/incidents" element={<IncidentManagement />} />
            <Route path="/ai-analytics" element={<AIAnalytics />} />
            <Route path="/geofences" element={<GeofenceManagement />} />
            <Route path="/blockchain" element={<BlockchainLogs />} />
            <Route path="/system-health" element={<SystemHealth />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/security" element={<Security />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* ── App content (route switching) ───────────────────────────── */
function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing page — redirect to dashboard if already logged in */}
      <Route
        path="/"
        element={
          user
            ? <Navigate to="/dashboard" replace />
            : <LandingPage onLogin={() => navigate('/login')} />
        }
      />

      {/* Login page — redirect to dashboard if already logged in */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      {/* All dashboard routes — redirect to login if not authenticated */}
      <Route
        path="/*"
        element={
          user
            ? <DashboardShell />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

/* ── Root ─────────────────────────────────────────────────────── */
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
      <Analytics />
    </AuthProvider>
  );
}

export default App;
