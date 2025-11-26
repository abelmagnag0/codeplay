import { jsx as _jsx } from "react/jsx-runtime";
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
export default function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const handleLogin = () => {
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
    };
    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentPage('login');
    };
    const handleNavigate = (page) => {
        setCurrentPage(page);
    };
    if (!isAuthenticated) {
        return _jsx(LoginScreen, { onLogin: handleLogin });
    }
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return _jsx(Dashboard, { onNavigate: handleNavigate });
            case 'challenges':
                return _jsx(Challenges, {});
            case 'ranking':
                return _jsx(Ranking, {});
            case 'rooms':
                return _jsx(Rooms, { onNavigate: handleNavigate });
            case 'chat':
                return _jsx(Chat, { onNavigate: handleNavigate });
            case 'profile':
                return _jsx(Profile, {});
            case 'admin':
                return _jsx(Admin, {});
            default:
                return _jsx(Dashboard, { onNavigate: handleNavigate });
        }
    };
    return (_jsx("div", { className: "dark", children: _jsx(MainLayout, { currentPage: currentPage, onNavigate: handleNavigate, onLogout: handleLogout, children: renderPage() }) }));
}
