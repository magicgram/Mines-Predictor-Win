
import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { usePrediction } from '../services/authService';
import Sidebar from './Sidebar';
import TestPostbackScreen from './TestPostbackScreen';
import GuideModal from './GuideModal';
import AdminAuthModal from './AdminAuthModal';
import { useLanguage } from '../contexts/LanguageContext';

interface PredictorScreenProps {
  user: User;
  onLogout: () => void;
}

// --- Icons ---

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const GuideIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
  </svg>
);

const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l13.96 7.376c1.268.67 1.268 2.514 0 3.184l-13.96 7.376c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

// Custom Star Icon - Updated to remove padding so container controls size
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-sm">
    <path 
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
        fill="#ffffff" 
        stroke="none"
    />
  </svg>
);

// --- Limit Reached View ---

const LimitReachedView = React.memo(({ handleDepositRedirect }: { handleDepositRedirect: () => void; }) => {
  const { t } = useLanguage();

  return (
     <div 
        className="w-full h-screen flex flex-col font-poppins relative overflow-hidden items-center justify-center p-4 bg-[#0088ff]"
      >
        {/* Gradient Background matching reference */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9] via-[#0284c7] to-[#0c4a6e] z-0"></div>

        <div className="w-full max-w-sm bg-[#082f49]/40 backdrop-blur-md rounded-2xl p-8 border border-[#38bdf8]/20 text-center shadow-2xl z-10">
            <h1 className="text-3xl font-russo uppercase text-white mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {t('reDepositMessageTitle')}
            </h1>
            <p className="text-white/90 font-poppins text-sm leading-relaxed mb-8">{t('limitReachedText')}</p>
            
            <button 
                onClick={handleDepositRedirect}
                className="w-full py-4 bg-gradient-to-r from-[#4ade80] to-[#16a34a] text-[#064e3b] font-russo text-xl uppercase rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-green-900/30 border-b-4 border-[#14532d] active:border-b-0 active:translate-y-1"
            >
                {t('depositNow')}
            </button>
        </div>
    </div>
  );
});

type GridItemType = 'empty' | 'star' | 'mine';

const PredictorView = React.memo((props: {
    onOpenSidebar: () => void;
    onOpenGuide: () => void;
    gridState: GridItemType[];
    selectedTraps: number;
    setSelectedTraps: (val: number) => void;
    isSignalActive: boolean; // True means signal is shown (Get Signal LOCKED, Refresh UNLOCKED)
    onGetSignal: () => void;
    onRefresh: () => void;
    confidence: number | null;
    isLoading: boolean;
}) => {
    return (
        <div className="w-full min-h-screen flex flex-col relative font-poppins overflow-hidden bg-[#0088ff]">
            {/* Gradient Background matching reference */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9] via-[#0284c7] to-[#0c4a6e] z-0"></div>

            {/* Top Bar */}
            <header className="w-full flex justify-between items-start p-5 z-10">
                 {/* Menu Button (Left in some designs, but keeping consistent with user request 'top right') */}
                <div className="flex-1"></div>
                
                {/* Guide and Menu (Top Right as requested) */}
                <div className="flex items-center gap-3">
                    <button onClick={props.onOpenGuide} className="p-2 rounded-full bg-black/20 text-white hover:bg-black/30 transition active:scale-90">
                        <GuideIcon className="w-7 h-7 drop-shadow-md" />
                    </button>
                    <button onClick={props.onOpenSidebar} className="p-2 rounded-full bg-black/20 text-white hover:bg-black/30 transition active:scale-90">
                        <MenuIcon className="w-7 h-7 drop-shadow-md" />
                    </button>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center w-full max-w-md mx-auto px-4 z-10 relative -mt-8">
                
                {/* Title Area with Animation */}
                <div className="mb-6 text-center">
                    <h2 className="font-black text-4xl md:text-5xl text-[#0c4a6e] opacity-30 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 select-none blur-[1px]">
                        MINES
                    </h2>
                    <h1 className="relative font-russo text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#cceeff] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] tracking-wide animate-pulse-slow text-center leading-tight">
                        MINES<br/>
                        <span className="text-3xl md:text-4xl">PREDICTOR PRO</span>
                    </h1>
                </div>

                {/* 5x5 Grid */}
                <div className="bg-[#082f49]/40 p-3 rounded-2xl border border-[#bae6fd]/20 shadow-2xl backdrop-blur-sm w-full aspect-square max-w-[360px] mb-6">
                    <div className="grid grid-cols-5 grid-rows-5 gap-2 w-full h-full">
                        {props.gridState.map((item, index) => (
                            <div 
                                key={index}
                                className={`
                                    relative w-full h-full rounded-lg flex items-center justify-center overflow-hidden
                                    border-t border-l border-r border-b-[4px]
                                    ${item === 'star' 
                                        ? 'bg-gradient-to-b from-[#fbbf24] to-[#f59e0b] border-t-[#ffffff]/50 border-l-[#fcd34d] border-r-[#fcd34d] border-b-[#b45309]' 
                                        : 'bg-[#0c4a6e] border-t-[#38bdf8]/30 border-l-[#38bdf8]/10 border-r-[#38bdf8]/10 border-b-[#062c44]'
                                    }
                                `}
                            >
                                {(item === 'empty' || item === 'mine') && (
                                    <div className="w-3 h-3 rounded-full bg-[#0ea5e9]/40 shadow-inner"></div>
                                )}
                                
                                {item === 'star' && (
                                    <div className="w-[65%] h-[65%] flex items-center justify-center animate-pop-in">
                                        <StarIcon />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trap Selection Buttons */}
                <div className="flex justify-between w-full max-w-[360px] gap-3 mb-5">
                    {[1, 3, 5].map((traps) => (
                        <button
                            key={traps}
                            onClick={() => !props.isSignalActive && props.setSelectedTraps(traps)}
                            disabled={props.isSignalActive}
                            className={`
                                flex-1 py-2.5 rounded-full font-russo text-sm md:text-base tracking-wider transition-all duration-200 border
                                ${props.selectedTraps === traps 
                                    ? 'bg-[#0ea5e9] border-white/50 text-white shadow-[0_0_15px_rgba(14,165,233,0.6)] scale-105' 
                                    : 'bg-[#0c4a6e] border-[#075985] text-gray-400 hover:bg-[#0f5c85]'}
                                ${props.isSignalActive ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                            `}
                        >
                            {traps} TRAPS
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="w-full max-w-[360px] flex gap-3 mb-5 h-[64px]">
                    {/* Refresh Button */}
                    <button
                        onClick={props.onRefresh}
                        disabled={!props.isSignalActive} // Only enabled when signal is showing
                        className={`
                            h-full aspect-square rounded-2xl flex items-center justify-center border-b-4 transition-all
                            ${props.isSignalActive 
                                ? 'bg-[#3b82f6] border-[#1d4ed8] text-white shadow-lg active:border-b-0 active:translate-y-1 hover:brightness-110 cursor-pointer' 
                                : 'bg-[#1e293b] border-[#0f172a] text-gray-600 cursor-not-allowed'}
                        `}
                    >
                        <RefreshIcon className={`w-8 h-8 ${props.isSignalActive ? 'animate-spin-once' : ''}`} />
                    </button>

                    {/* Get Signal Button */}
                    <button
                        onClick={props.onGetSignal}
                        disabled={props.isSignalActive || props.isLoading} // Locked when signal is active or loading
                        className={`
                            flex-1 h-full rounded-2xl flex items-center justify-center gap-2 font-russo text-2xl tracking-wide border-b-4 transition-all shadow-xl
                            ${!props.isSignalActive && !props.isLoading
                                ? 'bg-gradient-to-r from-[#4ade80] to-[#16a34a] border-[#14532d] text-[#064e3b] hover:brightness-110 active:border-b-0 active:translate-y-1'
                                : 'bg-[#1e293b] border-[#0f172a] text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        {props.isLoading ? (
                            <div className="flex space-x-1">
                                <div className="w-3 h-3 bg-current rounded-full animate-bounce delay-0"></div>
                                <div className="w-3 h-3 bg-current rounded-full animate-bounce delay-150"></div>
                                <div className="w-3 h-3 bg-current rounded-full animate-bounce delay-300"></div>
                            </div>
                        ) : (
                            <>
                                <PlayIcon className="w-8 h-8" />
                                GET SIGNAL
                            </>
                        )}
                    </button>
                </div>

                {/* Confidence Meter */}
                <div className="w-full max-w-[360px] bg-[#0c4a6e]/80 backdrop-blur rounded-xl border border-[#38bdf8]/30 py-3 px-6 text-center shadow-lg">
                    <p className="font-russo text-lg text-white tracking-widest">
                        CONFIDENCE:- <span className="text-[#4ade80] text-xl filter drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                            {props.confidence ? `${props.confidence}%` : '--%'}
                        </span>
                    </p>
                </div>

            </main>
            
            <style>{`
                @keyframes pop-in {
                    0% { transform: scale(0); opacity: 0; }
                    60% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); }
                }
                .animate-pop-in {
                    animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.02); filter: brightness(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s infinite ease-in-out;
                }
                @keyframes spin-once {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-once {
                    animation: spin-once 0.5s ease-out;
                }
            `}</style>
        </div>
    );
});

const PredictorScreen: React.FC<PredictorScreenProps> = ({ user, onLogout }) => {
  const [predictionsLeft, setPredictionsLeft] = useState(user.predictionsLeft);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('predictor'); // 'predictor' or 'testPostback'
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { t } = useLanguage();

  // Mines Specific State
  const [selectedTraps, setSelectedTraps] = useState<number>(1); // Default to 1 trap
  const [gridState, setGridState] = useState<GridItemType[]>(Array(25).fill('empty'));
  const [isSignalActive, setIsSignalActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const storedPic = localStorage.getItem(`profile_pic_${user.playerId}`);
    if (storedPic) {
      setProfilePic(storedPic);
    } else {
      setProfilePic(null);
    }
  }, [user.playerId]);
  
  const handleProfilePictureChange = useCallback((newPicUrl: string) => {
    setProfilePic(newPicUrl);
  }, []);

  // Logic to generate Mines signal
  const handleGetSignal = useCallback(async () => {
    if (isSignalActive || predictionsLeft <= 0 || isLoading) return;

    setIsLoading(true);

    try {
      // 1. Consume Prediction via API
      const result = await usePrediction(user.playerId);
      if (!result.success) {
        alert(`${t('errorLabel')}: ${result.message || t('couldNotUsePrediction')}`);
        setIsLoading(false);
        return;
      }
      
      setPredictionsLeft(prev => prev - 1);

      // 2. Generate Grid Logic
      // Random 70-99% confidence
      const randomConfidence = Math.floor(Math.random() * (99 - 70 + 1)) + 70;
      const totalCells = 25;
      let newGrid: GridItemType[] = Array(totalCells).fill('empty');

      if (selectedTraps === 1) {
        // Special logic for 1 Trap: Randomly reveal 5 cells
        const allIndices = Array.from({ length: totalCells }, (_, i) => i);
        
        // Shuffle indices
        for (let i = allIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
        }

        const selectedIndices = allIndices.slice(0, 5);
        
        newGrid = newGrid.map((_, index) => {
          if (selectedIndices.includes(index)) return 'star';
          return 'empty';
        });

      } else {
        // Existing logic for other trap counts (3, 5, etc.)
        const numberOfMines = selectedTraps;
        const allIndices = Array.from({ length: totalCells }, (_, i) => i);
        
        // Shuffle indices securely
        for (let i = allIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
        }

        const mineIndices = allIndices.slice(0, numberOfMines);
        
        newGrid = newGrid.map((_, index) => {
          if (mineIndices.includes(index)) return 'mine'; // Boom
          return 'star'; // Rest are stars
        });
      }

      // Simulate network delay for realism
      setTimeout(() => {
          setGridState(newGrid);
          setConfidence(randomConfidence);
          setIsSignalActive(true); // This locks Get Signal and unlocks Refresh
          setIsLoading(false);
      }, 600);

    } catch (error) {
       console.error("Failed to get signal:", error);
       alert(t('unexpectedErrorSignal'));
       setIsLoading(false);
    }
  }, [user.playerId, isSignalActive, predictionsLeft, isLoading, t, selectedTraps]);
  
  // Logic to reset the grid (Refresh button)
  const handleRefresh = useCallback(() => {
    setGridState(Array(25).fill('empty'));
    setIsSignalActive(false); // This unlocks Get Signal and locks Refresh
    setConfidence(null);
  }, []);

  const handleDepositRedirect = useCallback(async () => {
    try {
        const response = await fetch('/api/get-affiliate-link');
        const data = await response.json();
        if (response.ok && data.success) {
            if (window.top) {
                window.top.location.href = data.link;
            } else {
                window.location.href = data.link;
            }
        } else {
            alert(data.message || t('depositLinkNotAvailable'));
        }
    } catch (error) {
        console.error('Failed to fetch deposit link:', error);
        alert(t('unexpectedErrorOccurred'));
    }
  }, [t]);
  
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const handleNavigate = useCallback((view: string) => { setCurrentView(view); setIsSidebarOpen(false); }, []);
  const handleTestPostbackClick = useCallback(() => { setIsSidebarOpen(false); setShowAdminModal(true); }, []);
  const handleAdminSuccess = useCallback(() => { setShowAdminModal(false); setCurrentView('testPostback'); }, []);
  const handleAdminClose = useCallback(() => setShowAdminModal(false), []);
  const handleBackToPredictor = useCallback(() => setCurrentView('predictor'), []);

  if (predictionsLeft <= 0 && !isLoading) {
    return <LimitReachedView handleDepositRedirect={handleDepositRedirect} />;
  }
  
  return (
    <div className="w-full min-h-screen bg-gray-900">
      {isGuideOpen && <GuideModal onClose={() => setIsGuideOpen(false)} />}
      {showAdminModal && <AdminAuthModal onSuccess={handleAdminSuccess} onClose={handleAdminClose} />}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        isLoggedIn={true}
        playerId={user.playerId}
        onProfilePictureChange={handleProfilePictureChange}
        onTestPostbackClick={handleTestPostbackClick}
      />
      {currentView === 'predictor' && (
        <PredictorView 
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            gridState={gridState}
            selectedTraps={selectedTraps}
            setSelectedTraps={setSelectedTraps}
            isSignalActive={isSignalActive}
            onGetSignal={handleGetSignal}
            onRefresh={handleRefresh}
            confidence={confidence}
            isLoading={isLoading}
        />
      )}
      {currentView === 'testPostback' && 
        <TestPostbackScreen onBack={handleBackToPredictor} />
      }
    </div>
  );
};

export default React.memo(PredictorScreen);
