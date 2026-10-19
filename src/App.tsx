import React, { useState, useEffect } from 'react';
import { UserSession, DatabaseStatus } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentManager } from './components/StudentManager';
import { GoogleIntegrationModal } from './components/GoogleIntegrationModal';
import { StudentDashboard } from './components/StudentDashboard';
import { LearningMaterialsView } from './components/LearningMaterialsView';
import { AssignmentsView } from './components/AssignmentsView';
import { CbtSimulationModal } from './components/CbtSimulationModal';
import { LogsView } from './components/LogsView';
import { Loader2 } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Check existing session on load
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.warn('Sesi belum terdeteksi:', e);
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/admin/database-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      // Ignored if unauthenticated
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchDbStatus();
    }
  }, [user]);

  const handleLoginSuccess = (loggedInUser: UserSession) => {
    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setActiveTab('dashboard');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-9 h-9 animate-spin text-[#116B3A]" />
        <span className="text-xs font-semibold text-neutral-600">
          Memuat Sistem LMS MIN 1 Paser...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F6] flex flex-col text-neutral-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbStatus={dbStatus || undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!user ? (
          <LoginModal onSuccess={handleLoginSuccess} />
        ) : user.role === 'superadmin' ? (
          // Admin View Switcher
          <>
            {activeTab === 'dashboard' && (
              <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
            )}
            {activeTab === 'students' && <StudentManager />}
            {activeTab === 'materials' && <LearningMaterialsView />}
            {activeTab === 'google' && (
              <GoogleIntegrationModal dbStatus={dbStatus} />
            )}
            {activeTab === 'logs' && <LogsView />}
          </>
        ) : (
          // Student View Switcher
          <>
            {activeTab === 'dashboard' && (
              <StudentDashboard user={user} onNavigateTab={(tab) => setActiveTab(tab)} />
            )}
            {activeTab === 'materials' && <LearningMaterialsView />}
            {activeTab === 'assignments' && <AssignmentsView user={user} />}
            {activeTab === 'cbt' && <CbtSimulationModal user={user} />}
          </>
        )}
      </main>

      {/* Official Footer */}
      <Footer />
    </div>
  );
}

export default App;
