import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { PoseProvider } from '@/context/PoseContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Public Views
import { Landing } from '@/views/Landing';
import { Auth } from '@/views/Auth';

// Protected Patient Views
import { PatientOnboarding } from '@/views/PatientOnboarding';
import { PatientDashboard } from '@/views/PatientDashboard';
import { ExerciseLibrary } from '@/views/ExerciseLibrary';
import { WorkoutArena } from '@/views/WorkoutArena';
import { ProgressAnalytics } from '@/views/ProgressAnalytics';
import { AICoach } from '@/views/AICoach';
import { DigitalTwin } from '@/views/DigitalTwin';
import { Reports } from '@/views/Reports';
import { Messages } from '@/views/Messages';

// Protected Therapist Views
import { TherapistHub } from '@/views/TherapistHub';
import { ProtocolBuilder } from '@/views/ProtocolBuilder';

// Settings View
import { Settings } from '@/views/Settings';

const MainRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'patient') {
      return <Navigate to={user.onboardingCompleted ? '/patient/dashboard' : '/patient/onboarding'} replace />;
    }
    if (user.role === 'therapist') {
      return <Navigate to="/therapist/dashboard" replace />;
    }
  }
  return <Landing />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainRedirect />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/patient/onboarding" element={<PoseProvider><PatientOnboarding /></PoseProvider>} />

              {/* Protected Dashboard Layout Routes */}
              <Route element={<DashboardLayout />}>
                {/* Patient Routes */}
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/exercises" element={<ExerciseLibrary />} />
                <Route path="/patient/workout" element={<WorkoutArena />} />
                <Route path="/patient/progress" element={<ProgressAnalytics />} />
                <Route path="/patient/twin" element={<DigitalTwin />} />
                <Route path="/patient/coach" element={<AICoach />} />
                <Route path="/patient/reports" element={<Reports />} />
                <Route path="/patient/messages" element={<Messages />} />

                {/* Therapist Routes */}
                <Route path="/therapist/dashboard" element={<TherapistHub />} />
                <Route path="/therapist/protocol" element={<ProtocolBuilder />} />
                <Route path="/therapist/messages" element={<Messages />} />



                {/* Settings Route */}
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Fallback Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
