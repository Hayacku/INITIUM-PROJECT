import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { AiProvider } from './contexts/AiContext';
import { TourProvider } from './contexts/TourContext';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
// Critical imports (Static for performance on initial load)
import Auth from './pages/Auth';
import Dashboard from './pages/DashboardV2'; // Updated to V2
// Components
import CookieConsent from './components/CookieConsent';
import { applyTheme, getCurrentTheme } from './lib/themes';
import './App.css';
import { useAutoSync } from './hooks/useAutoSync';

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
const AxiomTest = lazy(() => import('./pages/AxiomTest'));

// Skeletons & Suspense Wrapper
import SuspensePage from './components/SuspensePage';
import DashboardSkeleton from './components/skeletons/DashboardSkeleton';
import QuestsSkeleton from './components/skeletons/QuestsSkeleton';
import ProjectsSkeleton from './components/skeletons/ProjectsSkeleton';



// This component is wrapped by providers so it can use hooks
function AppContent() {
  useAutoSync();

  React.useEffect(() => {
    applyTheme(getCurrentTheme());
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<Auth />} />

      {/* Protected */}
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />

      <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

      <Route path="/quests" element={<PrivateRoute><Layout><SuspensePage component={Quests} skeleton={QuestsSkeleton} /></Layout></PrivateRoute>} />
      <Route path="/habits" element={<PrivateRoute><Layout><SuspensePage component={Habits} skeleton={QuestsSkeleton} /></Layout></PrivateRoute>} />
      <Route path="/agenda" element={<PrivateRoute><Layout><SuspensePage component={Agenda} /></Layout></PrivateRoute>} />
      <Route path="/projects" element={<PrivateRoute><Layout><SuspensePage component={Projects} skeleton={ProjectsSkeleton} /></Layout></PrivateRoute>} />
      <Route path="/notes" element={<PrivateRoute><Layout><SuspensePage component={Notes} /></Layout></PrivateRoute>} />
      <Route path="/training" element={<PrivateRoute><Layout><SuspensePage component={Training} /></Layout></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Layout><SuspensePage component={Analytics} skeleton={DashboardSkeleton} /></Layout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Layout><SuspensePage component={Settings} /></Layout></PrivateRoute>} />
      <Route path="/pomodoro" element={<PrivateRoute><Layout><SuspensePage component={Pomodoro} /></Layout></PrivateRoute>} />
      <Route path="/help" element={<PrivateRoute><Layout><SuspensePage component={Help} /></Layout></PrivateRoute>} />
      <Route path="/axiom-test" element={<PrivateRoute><Layout><SuspensePage component={AxiomTest} /></Layout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ... imports
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AiProvider>
            <BrowserRouter>
              <TourProvider>
                <Suspense fallback={null}>
                  <AppContent />
                </Suspense>
                <CookieConsent />
                <Toaster position="top-right" richColors />
              </TourProvider>
            </BrowserRouter>
          </AiProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
