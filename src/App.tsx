import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './components/Toast.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { RegisterPage } from './pages/auth/RegisterPage.tsx';

// Athlete pages
import { UserDashboard } from './pages/user/UserDashboard.tsx';
import { WorkoutPlansPage } from './pages/user/WorkoutPlansPage.tsx';
import { ActiveWorkoutSession } from './pages/user/ActiveWorkoutSession.tsx';
import { WorkoutHistoryPage } from './pages/user/WorkoutHistoryPage.tsx';
import { ProgressTrackerPage } from './pages/user/ProgressTrackerPage.tsx';
import { NutritionalAnalyticsPage } from './pages/user/NutritionalAnalyticsPage.tsx';
import { BmiTrackerPage } from './pages/user/BmiTrackerPage.tsx';
import { UserMessagingPage } from './pages/user/UserMessagingPage.tsx';
import { UserProfilePage } from './pages/user/UserProfilePage.tsx';
import { AiWorkoutVideosPage } from './pages/user/AiWorkoutVideosPage.tsx';

// Coach pages
import { CoachDashboard } from './pages/coach/CoachDashboard.tsx';
import { CoachClientsPage } from './pages/coach/CoachClientsPage.tsx';
import { WorkoutPlanBuilder } from './pages/coach/WorkoutPlanBuilder.tsx';
import { CoachMessagingPage } from './pages/coach/CoachMessagingPage.tsx';
import { CoachAnalyticsPage } from './pages/coach/CoachAnalyticsPage.tsx';
import { CoachProfilePage } from './pages/coach/CoachProfilePage.tsx';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.tsx';
import { AdminModerationPage } from './pages/admin/AdminModerationPage.tsx';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage.tsx';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.tsx';

function MainApp() {
  const { user, isLoading, quickLogin } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');
  const [selectedPortal, setSelectedPortal] = useState<'USER' | 'COACH' | 'ADMIN'>('USER');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeRoutineId, setActiveRoutineId] = useState<string | undefined>(undefined);

  // Sync default tab when user or role changes
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setCurrentTab('admin-dashboard');
      } else if (user.role === 'COACH') {
        setCurrentTab('coach-dashboard');
      } else {
        setCurrentTab('dashboard');
      }
    }
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold animate-pulse">
            PF
          </div>
          <span className="text-xs font-mono tracking-wider">INITIALIZING PULSEFIT...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Public Landing, Login, or Register
  if (!user) {
    if (authView === 'login') {
      return (
        <LoginPage
          initialPortal={selectedPortal}
          onSwitchToRegister={() => setAuthView('register')}
          onBackToHome={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterPage
          onSwitchToLogin={() => setAuthView('login')}
          onBackToHome={() => setAuthView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onOpenLogin={(portal = 'USER') => {
          setSelectedPortal(portal);
          setAuthView('login');
        }}
        onOpenRegister={() => setAuthView('register')}
        onQuickDemo={async (role) => {
          if (role === 'COACH' || role === 'ADMIN') {
            setSelectedPortal(role);
            setAuthView('login');
          } else {
            await quickLogin(role);
          }
        }}
      />
    );
  }

  // Handlers
  const handleStartRoutine = (routineId: string) => {
    setActiveRoutineId(routineId);
    setCurrentTab('active-session');
  };

  const handleFinishRoutineSession = () => {
    setActiveRoutineId(undefined);
    setCurrentTab('history');
  };

  // Render current portal view based on role and tab
  const renderPortalContent = () => {
    // ATHLETE (USER) VIEWS
    if (user.role === 'USER') {
      switch (currentTab) {
        case 'dashboard':
          return <UserDashboard onNavigateTab={setCurrentTab} onStartRoutine={handleStartRoutine} />;
        case 'workout-plans':
          return <WorkoutPlansPage onStartRoutine={handleStartRoutine} />;
        case 'ai-videos':
          return <AiWorkoutVideosPage />;
        case 'active-session':
          return (
            <ActiveWorkoutSession
              routineId={activeRoutineId}
              onFinishSession={handleFinishRoutineSession}
              onCancel={() => setCurrentTab('dashboard')}
            />
          );
        case 'history':
          return <WorkoutHistoryPage />;
        case 'progress':
          return <ProgressTrackerPage />;
        case 'nutrition':
          return <NutritionalAnalyticsPage />;
        case 'bmi':
          return <BmiTrackerPage />;
        case 'messages':
          return <UserMessagingPage />;
        case 'profile':
          return <UserProfilePage />;
        default:
          return <UserDashboard onNavigateTab={setCurrentTab} onStartRoutine={handleStartRoutine} />;
      }
    }

    // COACH VIEWS
    if (user.role === 'COACH') {
      switch (currentTab) {
        case 'coach-dashboard':
          return <CoachDashboard onNavigateTab={setCurrentTab} />;
        case 'coach-clients':
          return <CoachClientsPage />;
        case 'plan-builder':
          return <WorkoutPlanBuilder onPlanSaved={() => setCurrentTab('coach-dashboard')} />;
        case 'ai-videos':
          return <AiWorkoutVideosPage />;
        case 'coach-messages':
          return <CoachMessagingPage />;
        case 'coach-analytics':
          return <CoachAnalyticsPage />;
        case 'coach-profile':
          return <CoachProfilePage />;
        default:
          return <CoachDashboard onNavigateTab={setCurrentTab} />;
      }
    }

    // ADMIN VIEWS
    if (user.role === 'ADMIN') {
      switch (currentTab) {
        case 'admin-dashboard':
          return <AdminDashboard onNavigateTab={setCurrentTab} />;
        case 'admin-users':
          return <AdminUsersPage />;
        case 'ai-videos':
          return <AiWorkoutVideosPage />;
        case 'admin-moderation':
          return <AdminModerationPage />;
        case 'admin-feedback':
          return <AdminFeedbackPage />;
        case 'admin-settings':
          return <AdminSettingsPage />;
        default:
          return <AdminDashboard onNavigateTab={setCurrentTab} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 lg:pl-64 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {renderPortalContent()}
        </main>
      </div>

      {/* Mobile Sticky Thumb Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
