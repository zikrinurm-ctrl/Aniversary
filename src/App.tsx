import React, { useEffect, useState } from 'react';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';
import { CoupleProvider, useCouple } from './contexts/CoupleContext';
import { GlobalMusicProvider } from './contexts/GlobalMusicContext';
import { FloatingHearts } from './components/FloatingHearts';
import { WelcomeView } from './components/WelcomeView';
import { MidnightSurpriseModal } from './components/MidnightSurpriseModal';
import { NavigationShell } from './components/NavigationShell';
import { GlobalMusicPlayer } from './components/GlobalMusicPlayer';
import { DashboardPage } from './pages/DashboardPage';
import { OurConnectionPage } from './pages/OurConnectionPage';
import { PrivateChatPage } from './pages/PrivateChatPage';
import { CandleSurprisePage } from './pages/CandleSurprisePage';
import { TruthOrDarePage } from './pages/TruthOrDarePage';
import { GuessPicturePage } from './pages/GuessPicturePage';
import { LoveQuizPage } from './pages/LoveQuizPage';
import { MusicRoomPage } from './pages/MusicRoomPage';
import { MemoriesPage } from './pages/MemoriesPage';
import { LoveLetterPage } from './pages/LoveLetterPage';
import { JourneyPage } from './pages/JourneyPage';
import { MiniGamesPage } from './pages/MiniGamesPage';
import { SecretMessagePage } from './pages/SecretMessagePage';
import { VirtualHugPage } from './pages/VirtualHugPage';
import { OurPromisePage } from './pages/OurPromisePage';
import { FinalSurprisePage } from './pages/FinalSurprisePage';
import { AdminPage } from './pages/AdminPage';
import { getCountdownBreakdown } from './lib/time';
import { PageId } from './types';

const SURPRISE_SEEN_KEY = 'anniversary_surprise_seen_2026_v1';

const AppInner: React.FC<{
  activePage: PageId;
  setActivePage: React.Dispatch<React.SetStateAction<PageId>>;
}> = ({ activePage, setActivePage }) => {
  const { siteConfig } = useAppData();
  const { coupleSpace, markSharedAnniversaryOpened } = useCouple();
  const [entered, setEntered] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [showMidnightModal, setShowMidnightModal] = useState(false);

  // Real-time 1-second WIT clock & countdown interval (cleanly disposed on unmount)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = getCountdownBreakdown(nowMs);

  // Automatically trigger Midnight Surprise once when 20 Nov 2026 00:00 WIT is reached
  useEffect(() => {
    if (!countdown.isAnniversaryReached) return;
    if (coupleSpace?.anniversaryOpened) return;
    try {
      const alreadySeen = window.localStorage.getItem(SURPRISE_SEEN_KEY) === 'true';
      if (!alreadySeen) {
        setShowMidnightModal(true);
      }
    } catch {
      setShowMidnightModal(true);
    }
  }, [countdown.isAnniversaryReached, coupleSpace?.anniversaryOpened]);

  const dismissMidnightModal = () => {
    try {
      window.localStorage.setItem(SURPRISE_SEEN_KEY, 'true');
    } catch {
      // Ignore storage restriction
    }
    if (coupleSpace) {
      void markSharedAnniversaryOpened();
    }
    setShowMidnightModal(false);
    setEntered(true);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            nowMs={nowMs}
            countdown={countdown}
            onNavigate={setActivePage}
            onReplayMidnightSurprise={() => setShowMidnightModal(true)}
          />
        );
      case 'connection':
        return <OurConnectionPage onNavigate={setActivePage} />;
      case 'chat':
        return <PrivateChatPage onNavigate={setActivePage} />;
      case 'countdown':
        return (
          <DashboardPage
            nowMs={nowMs}
            countdown={countdown}
            onNavigate={setActivePage}
            onReplayMidnightSurprise={() => setShowMidnightModal(true)}
            focusCountdownOnly
          />
        );
      case 'candle':
        return <CandleSurprisePage />;
      case 'truth-or-dare':
        return <TruthOrDarePage />;
      case 'guess-picture':
        return <GuessPicturePage />;
      case 'love-quiz':
        return <LoveQuizPage />;
      case 'music':
        return <MusicRoomPage />;
      case 'memories':
        return <MemoriesPage />;
      case 'love-letter':
        return <LoveLetterPage />;
      case 'journey':
        return <JourneyPage />;
      case 'mini-games':
        return <MiniGamesPage onNavigate={setActivePage} />;
      case 'secret-message':
        return <SecretMessagePage />;
      case 'virtual-hug':
        return <VirtualHugPage />;
      case 'our-promise':
        return <OurPromisePage />;
      case 'final-surprise':
        return <FinalSurprisePage onNavigate={setActivePage} />;
      case 'admin':
        return <AdminPage />;
      default:
        return (
          <DashboardPage
            nowMs={nowMs}
            countdown={countdown}
            onNavigate={setActivePage}
            onReplayMidnightSurprise={() => setShowMidnightModal(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7fa] via-[#fdf4f8] to-[#f7f1ff] text-[#3d2532] relative">
      <FloatingHearts intense={activePage === 'final-surprise' || showMidnightModal} />

      {!entered ? (
        <WelcomeView
          coupleNames={siteConfig.coupleNames}
          countdown={countdown}
          nowMs={nowMs}
          onEnter={() => setEntered(true)}
        />
      ) : (
        <NavigationShell
          activePage={activePage}
          onNavigate={setActivePage}
          coupleNames={siteConfig.coupleNames}
        >
          {renderPage()}
        </NavigationShell>
      )}

      {entered && <GlobalMusicPlayer onNavigate={setActivePage} />}

      {showMidnightModal && (
        <MidnightSurpriseModal
          coupleNames={siteConfig.coupleNames}
          onDismiss={dismissMidnightModal}
        />
      )}
    </div>
  );
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');

  return (
    <AppDataProvider>
      <CoupleProvider activePage={activePage}>
        <GlobalMusicProvider>
          <AppInner activePage={activePage} setActivePage={setActivePage} />
        </GlobalMusicProvider>
      </CoupleProvider>
    </AppDataProvider>
  );
}
