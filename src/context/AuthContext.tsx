import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'patient' | 'therapist' | 'caregiver' | 'admin';

export interface UserSession {
  name: string;
  role: UserRole;
  onboardingCompleted: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  login: (name: string, role: UserRole) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('kinova_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing session data', e);
      }
    }
    return null;
  });

  const login = (name: string, role: UserRole) => {
    const session: UserSession = {
      name,
      role,
      onboardingCompleted: false,
    };
    // If it's not a patient, onboarding is implicitly completed
    if (role !== 'patient') {
      session.onboardingCompleted = true;
    } else {
      // Check if patient onboarding was already done in the past
      const wasOnboarded = localStorage.getItem(`kinova_onboarded_${name}`);
      if (wasOnboarded === 'true') {
        session.onboardingCompleted = true;
      }
    }
    setUser(session);
    localStorage.setItem('kinova_user_session', JSON.stringify(session));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kinova_user_session');
  };

  const completeOnboarding = () => {
    if (user && user.role === 'patient') {
      const updated = { ...user, onboardingCompleted: true };
      setUser(updated);
      localStorage.setItem('kinova_user_session', JSON.stringify(updated));
      localStorage.setItem(`kinova_onboarded_${user.name}`, 'true');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
