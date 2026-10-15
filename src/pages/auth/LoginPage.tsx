import React, { useState } from 'react';
import { AthleteLoginPage } from './AthleteLoginPage.tsx';
import { CoachLoginPage } from './CoachLoginPage.tsx';
import { AdminLoginPage } from './AdminLoginPage.tsx';

export type LoginPortalType = 'USER' | 'COACH' | 'ADMIN';

interface LoginPageProps {
  initialPortal?: LoginPortalType;
  onSwitchToRegister: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialPortal = 'USER',
  onSwitchToRegister,
  onBackToHome,
}) => {
  const [activePortal, setActivePortal] = useState<LoginPortalType>(initialPortal);

  if (activePortal === 'COACH') {
    return (
      <CoachLoginPage
        onSwitchToAthlete={() => setActivePortal('USER')}
        onSwitchToAdmin={() => setActivePortal('ADMIN')}
        onBackToHome={onBackToHome}
      />
    );
  }

  if (activePortal === 'ADMIN') {
    return (
      <AdminLoginPage
        onSwitchToAthlete={() => setActivePortal('USER')}
        onSwitchToCoach={() => setActivePortal('COACH')}
        onBackToHome={onBackToHome}
      />
    );
  }

  return (
    <AthleteLoginPage
      onSwitchToCoach={() => setActivePortal('COACH')}
      onSwitchToAdmin={() => setActivePortal('ADMIN')}
      onSwitchToRegister={onSwitchToRegister}
      onBackToHome={onBackToHome}
    />
  );
};
