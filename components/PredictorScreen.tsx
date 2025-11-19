
import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

// --- Icons ---

const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
  </svg>
);

const GuideIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.539 1.35 1.539 3.6 0 4.95l-.26.227c-.64.56-1.115 1.27-1.115 2.118v.5a.75.75 0 01-1.5 0v-.5c0-1.253.702-2.306 1.647-3.134l.26-.228c.89-.777.89-2.036 0-2.804zM12 15.75a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd" />
  </svg>
);

const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="url(#starGradient)" className="w-8 h-8 drop-shadow-md">
    <defs>
      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const MineIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-600 drop-shadow-md">
    <circle cx="12" cy="12" r="10" fill="#222" />
    <circle cx="12" cy="12" r="4" fill="#ff0000" />
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" stroke="#ff0000" strokeWidth="2" />
  </svg>
);


// --- Sub-components ---

const LimitReachedView = React.memo(({ handleDepositRedirect }: { handleDepositRedirect: () => void; }) => {
  const { t } = useLanguage();
  const imgUrl = "https://i.postimg.cc/3N7cr754/Picsart-25-11-18-12-04-40-325.png";

  return (
     <div 
        className="w-full h-screen text-white flex flex-col font-poppins relative overflow-hidden items-center justify-center p-4"
        style={{ background: 'linear-gradient(to bottom, #007bff, #001f3f)' }}
      >
        <main className="flex flex-col items-center justify-center w-full max-w-sm text-center z-20">
          <div className="w-full bg-black/40 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10">
              <h1 className="text-3xl font-russo uppercase text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  {t('reDepositMessageTitle')}
              </h1>
              <p className="mt-4 max-w-sm text-white/80 font-poppins text-sm">{t('limitReachedText')}</p>
              
              <div className="w-full mt-8">
                  <button 
                      onClick={handleDepositRedirect}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-poppins font-bold text-lg uppercase rounded-xl transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-black/30"
                  >
                      {t('depositNow')}
                  </button>
              </div>
          </div>
        </main>
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
    isSignalActive: boolean;
    onGetSignal: () => void;
    onRefresh: () => void;
    confidence: number | null;
    isLoading: boolean;
}) => {
    // The Mines Grid
    const renderGrid = () => {
        return (
            <div className="grid grid-cols-5 gap-2 p-4 bg-[#0b2138]/50 rounded-xl border border-white/5 shadow-inner max-w-[340px] mx-auto">
                {props.gridState.map((item, index) => (
                    <div 
                        key={index}
                        className={`
                            aspect-square rounded-lg flex items-center justify-center relative overflow-hidden shadow-lg transition-all duration-300
                            ${item === 'empty' 
                                ? 'bg-[#0d3b5e] hover:bg-[#114872] border-b-4 border-[#06253d]' 
                                : 'bg-[#092c47] border border-white/10'}
                        `}
                    >
                        {item === 'empty' && (
                            <div className="w-3 h-3 rounded-full bg-[#1e5c8a] shadow-inner" />
                        )}
                        
                        {/* Revealed Icons with animation */}
                        {item === 'star' && (
                            <div className="animate-pop-in">
                                <StarIcon />
                            </div>
                        )}
                        {item === 'mine' && (
                            <div className="animate-pop-in">
                                <MineIcon />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen text-white flex flex-col font-poppins relative overflow-hidden"
             style={{ background: 'linear-gradient(180deg, #2b8cff 0%, #0052cc 50%, #001f3f 100%)' }}
        >
            {/* Top Bar */}
            <header className="w-full flex justify-between items-center p-4 z-20">
                <div className="w-10"></div> {/* Spacer */}
                <h1 className="text-3xl font-black text-center tracking-wider uppercase text-[#0b2138] opacity-40 absolute left-1/2 -translate-x-1/2 pointer-events-none">
                    MINES
                </h1>
                <div className="flex items-center gap-3">
                    <button onClick={props.onOpenGuide} className="p-2 rounded-full bg-black/20 hover:bg-black/30 transition">
                        <GuideIcon className="w-6 h-6" />
                    </button>
                    <button onClick={props.onOpenSidebar} className="p-2 rounded-full bg-black/20 hover:bg-black/30 transition">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center px-4 pb-6 space-y-6 z-10">
                
                {/* Animated Title */}
                <div className="text-center mb-2">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#0b2138] tracking-tighter leading-none animate-pulse-slow opacity-90">
                        MINES
                        <span className="block text-2xl md:text-3xl text-white drop-shadow-lg mt-[-5px]">
                             PREDICTOR PRO
                        </span>
                    </h2>
                </div>

                {/* 5x5 Grid */}
                {renderGrid()}

                {/* Trap Selection Pills */}
                <div className="flex gap-3 justify-center w-full max-w-xs">
                    {[1, 3, 5].map(traps => (
                        <button
                            key={traps}
                            onClick={() => !props.isSignalActive && props.setSelectedTraps(traps)}
                            disabled={props.isSignalActive}
                            className={`
                                flex-1 py-2 px-4 rounded-full font-bold text-sm transition-all duration-200 border-2
                                ${props.selectedTraps === traps 
                                    ? 'bg-[#007bff] border-white text-white shadow-[0_0_15px_rgba(0,123,255,0.6)] scale-105' 
                                    : 'bg-[#002a4d] border-[#004080] text-gray-400 hover:bg-[#003366]'}
                                ${props.isSignalActive ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {traps} TRAPS
                        </button>
                    ))}
                </div>

                {/* Controls Area */}
                <div className="w-full max-w-xs space-y-4">
                    
                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-3">
                        {/* Refresh Button - Only active when signal is active */}
                        <button 
                            onClick={props.onRefresh}
                            disabled={!props.isSignalActive}
                            className={`
                                p-4 rounded-2xl border-b-4 transition-all active:scale-95 flex items-center justify-center aspect-square h-[60px]
                                ${props.isSignalActive 
                                    ? 'bg-[#1a5cff] border-[#003cc5] text-white shadow-lg cursor-pointer hover:brightness-110' 
                                    : 'bg-[#0a1f33] border-[#05101a] text-gray-600 cursor-not-allowed'}
                            `}
                        >
                            <RefreshIcon className={`w-7 h-7 ${props.isSignalActive ? 'animate-spin-once' : ''}`} />
                        </button>

                        {/* Get Signal Button - Only active when signal is NOT active */}
                        <button 
                            onClick={props.onGetSignal}
                            disabled={props.isSignalActive || props.isLoading}
                            className={`
                                flex-1 h-[60px] rounded-2xl border-b-4 font-black text-xl tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg uppercase
                                ${!props.isSignalActive && !props.isLoading
                                    ? 'bg-gradient-to-r from-[#4caf50] to-[#2e7d32] border-[#1b5e20] text-white hover:brightness-110' 
                                    : 'bg-[#1a2e3b] border-[#0f1b24] text-gray-500 cursor-not-allowed'}
                            `}
                        >
                            {props.isLoading ? (
                                <span className="animate-pulse">...</span>
                            ) : (
                                <>
                                    <PlayIcon className="w-6 h-6 fill-current" />
                                    GET SIGNAL
                                </>
                            )}
                        </button>
                    </div>

                    {/* Confidence Bar */}
                    <div className="w-full py-3 bg-[#004e92] rounded-full border border-[#007bff]/30 shadow-lg text-center">
                        <p className="text-white font-bold text-lg tracking-wider drop-shadow-sm">
                            CONFIDENCE: <span className="text-[#4fffa6]">{props.confidence ? `${props.confidence}%` : '--%'}</span>
                        </p>
                    </div>
                </div>
            </main>
            
            <style>{`
                @keyframes pop-in {
                    0% { transform: scale(0); opacity: 0; }
                    80% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); }
                }
                .animate-pop-in {
                    animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(0.98); }
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
  const [selectedTraps, setSelectedTraps] = useState(3);
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
      // We need to place N mines (where N = selectedTraps)
      // The rest are stars.
      // Create an array of indices [0...24]
      const allIndices = Array.from({ length: 25 }, (_, i) => i);
      
      // Shuffle indices to pick random spots for mines
      for (let i = allIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
      }

      const mineIndices = allIndices.slice(0, selectedTraps);
      
      // Construct the new grid
      const newGrid: GridItemType[] = Array(25).fill('empty').map((_, index) => {
        if (mineIndices.includes(index)) return 'mine';
        return 'star';
      });

      // 3. Generate Confidence
      const randomConfidence = Math.floor(Math.random() * (99 - 70 + 1)) + 70;

      // Simulate a short delay for effect
      setTimeout(() => {
          setGridState(newGrid);
          setConfidence(randomConfidence);
          setIsSignalActive(true); // Locks Get Signal, Unlocks Refresh
          setIsLoading(false);
      }, 800); // 0.8s delay

    } catch (error) {
       console.error("Failed to get signal:", error);
       alert(t('unexpectedErrorSignal'));
       setIsLoading(false);
    }
  }, [user.playerId, isSignalActive, predictionsLeft, isLoading, t, selectedTraps]);
  
  // Logic to reset the grid (Refresh button)
  const handleRefresh = useCallback(() => {
    setGridState(Array(25).fill('empty'));
    setIsSignalActive(false);
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
  const handleNavigate = useCallback((view) => { setCurrentView(view); setIsSidebarOpen(false); }, []);
  const handleTestPostbackClick = useCallback(() => { setIsSidebarOpen(false); setShowAdminModal(true); }, []);
  const handleAdminSuccess = useCallback(() => { setShowAdminModal(false); setCurrentView('testPostback'); }, []);
  const handleAdminClose = useCallback(() => setShowAdminModal(false), []);
  const handleBackToPredictor = useCallback(() => setCurrentView('predictor'), []);

  if (predictionsLeft <= 0 && !isLoading) {
    return <LimitReachedView handleDepositRedirect={handleDepositRedirect} />;
  }
  
  return (
    <div className="w-full min-h-screen">
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
