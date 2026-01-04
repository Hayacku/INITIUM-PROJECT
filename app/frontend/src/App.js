import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { TourProvider } from './contexts/TourContext';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
// Critical imports (Static for performance on initial load)
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
// Components
import CookieConsent from './components/CookieConsent';
import { applyTheme, getCurrentTheme } from './lib/themes';
import './App.css';
import { Loader2 } from 'lucide-react';

// Lazy Imports for heavy/secondary pages (Code Splitting)
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Quests = lazy(() => import('./pages/Quests'));
const Habits = lazy(() => import('./pages/Habits'));
const Agenda = lazy(() => import('./pages/Agenda'));
const Projects = lazy(() => import('./pages/Projects'));
const Notes = lazy(() => import('./pages/Notes'));
const Training = lazy(() => import('./pages/Training'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const Pomodoro = lazy(() => import('./pages/Pomodoro'));
const Help = lazy(() => import('./pages/Help'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        </div>
      </div>
      <p className="text-muted-foreground animate-pulse text-sm font-medium tracking-widest">CHARGEMENT...</p>
    </div>
  </div>
);

function App() {
  React.useEffect(() => {
    applyTheme(getCurrentTheme());
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <TourProvider>
            <Suspense fallback={<Layout><PageLoader /></Layout>}>
              <Routes>
                {/* Public */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<Auth />} />

                {/* Protected */}
                <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />

                <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

                <Route path="/quests" element={<PrivateRoute><Layout><Quests /></Layout></PrivateRoute>} />
                <Route path="/habits" element={<PrivateRoute><Layout><Habits /></Layout></PrivateRoute>} />
                <Route path="/agenda" element={<PrivateRoute><Layout><Agenda /></Layout></PrivateRoute>} />
                <Route path="/projects" element={<PrivateRoute><Layout><Projects /></Layout></PrivateRoute>} />
                <Route path="/notes" element={<PrivateRoute><Layout><Notes /></Layout></PrivateRoute>} />
                <Route path="/training" element={<PrivateRoute><Layout><Training /></Layout></PrivateRoute>} />
                <Route path="/analytics" element={<PrivateRoute><Layout><Analytics /></Layout></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
                <Route path="/pomodoro" element={<PrivateRoute><Layout><Pomodoro /></Layout></PrivateRoute>} />
                <Route path="/help" element={<PrivateRoute><Layout><Help /></Layout></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <CookieConsent />
            <Toaster position="top-right" richColors />
          </TourProvider>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
