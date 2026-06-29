import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dashboard } from '@/views/Dashboard';
import { WorkoutArena } from '@/views/WorkoutArena';
import { TherapistHub } from '@/views/TherapistHub';
import { Settings } from '@/views/Settings';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Dashboard Layout Route Wrapper */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="workout" element={<WorkoutArena />} />
              <Route path="therapist" element={<TherapistHub />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
