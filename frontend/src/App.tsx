import { useState } from "react";
import { LoginScreen } from "./components/pages/LoginScreen";
import { MainLayout } from "./components/pages/MainLayout";
import { Dashboard } from "./components/pages/Dashboard";
import { Challenges } from "./components/pages/Challenges";
import { Ranking } from "./components/pages/Ranking";
import { Rooms } from "./components/pages/Room";
import { Chat } from "./components/pages/Chat";
import { Profile } from "./components/pages/Profile";
import { Admin } from "./components/pages/Admin";

type Page = 'login' | 'dashboard' | 'challenges' | 'ranking' | 'rooms' | 'chat' | 'profile' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
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
        return <Rooms onNavigate={handleNavigate} />;
      case 'chat':
        return <Chat onNavigate={handleNavigate} />;
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
        onLogout={handleLogout}
      >
        {renderPage()}
      </MainLayout>
    </div>
  );
}
