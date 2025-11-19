import React, { useState, useCallback, useEffect } from 'react';
import LoginContainer from './components/LoginContainer';
import PredictorScreen from './components/PredictorScreen';
import { User } from './types';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = useCallback((playerId: string, initialPredictions: number) => {
    setUser({ playerId, predictionsLeft: initialPredictions });
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen font-sans bg-[#0c4a6e]">
        {user ? (
          <PredictorScreen 
            user={user} 
            onLogout={handleLogout} 
          />
        ) : (
          <LoginContainer 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}
      </div>
    </LanguageProvider>
  );
};

export default App;