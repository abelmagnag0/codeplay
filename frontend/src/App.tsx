import { useCallback, useState } from "react";
import { LoginScreen } from "./components/pages/LoginScreen";
import { MainLayout } from "./components/pages/MainLayout";
import { Dashboard } from "./components/pages/Dashboard";
import { Challenges } from "./components/pages/Challenges";
import { Ranking } from "./components/pages/Ranking";
import { Rooms } from "./components/pages/Room";
import { Chat } from "./components/pages/Chat";
import { Profile } from "./components/pages/Profile";
import { Admin } from "./components/pages/Admin";
import { useAuth } from "./contexts/AuthContext";
import type { RoomDetail } from "./types/api";

type Page = 'login' | 'dashboard' | 'challenges' | 'ranking' | 'rooms' | 'chat' | 'profile' | 'admin';

export default function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [activeRoom, setActiveRoom] = useState<RoomDetail | null>(null);

  const handleNavigate = useCallback((page: string) => {
    if (page !== 'chat') {
      setActiveRoom(null);
    }
    setCurrentPage(page as Page);
  }, []);

  const handleRoomSelected = useCallback((room: RoomDetail) => {
    setActiveRoom(room);
    setCurrentPage('chat');
  }, []);

  const handleLeaveRoom = useCallback(() => {
    setActiveRoom(null);
    setCurrentPage('rooms');
  }, []);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'challenges':
        return <Challenges />;
      case 'ranking':
        return <Ranking />;
      case 'rooms':
        return <Rooms onNavigate={handleNavigate} onRoomSelected={handleRoomSelected} />;
      case 'chat':
        return activeRoom ? (
          <Chat room={activeRoom} onLeave={handleLeaveRoom} />
        ) : (
          <Rooms onNavigate={handleNavigate} onRoomSelected={handleRoomSelected} />
        );
      case 'profile':
        return <Profile />;
      case 'admin':
        return <Admin />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="dark">
      <MainLayout 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        onLogout={logout}
        user={user}
      >
        {renderPage()}
      </MainLayout>
    </div>
  );
}
