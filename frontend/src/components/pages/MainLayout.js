import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Home, Trophy, Target, Users, User, Shield, Bell, Zap, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Logo } from "./Logo";
export function MainLayout({ children, currentPage, onNavigate, onLogout }) {
    const menuItems = [
        { id: 'dashboard', icon: Home, label: 'Home' },
        { id: 'challenges', icon: Target, label: 'Desafios' },
        { id: 'ranking', icon: Trophy, label: 'Ranking' },
        { id: 'rooms', icon: Users, label: 'Salas' },
        { id: 'profile', icon: User, label: 'Perfil' },
    ];
    const adminMenuItems = [
        { id: 'admin', icon: Shield, label: 'Admin' },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-background flex", children: [_jsxs("aside", { className: "w-64 bg-card border-r border-border flex flex-col fixed h-screen", children: [_jsx("div", { className: "p-6 border-b border-border", children: _jsx(Logo, { size: "md" }) }), _jsxs("nav", { className: "flex-1 p-4 space-y-2 overflow-y-auto", children: [menuItems.map((item) => (_jsxs("button", { onClick: () => onNavigate(item.id), className: `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.id
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`, children: [_jsx(item.icon, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: item.label })] }, item.id))), _jsx("div", { className: "pt-4 mt-4 border-t border-border", children: adminMenuItems.map((item) => (_jsxs("button", { onClick: () => onNavigate(item.id), className: `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.id
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`, children: [_jsx(item.icon, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: item.label })] }, item.id))) })] }), _jsx("div", { className: "p-4 border-t border-border", children: _jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg bg-secondary/50", children: [_jsx(Avatar, { className: "w-10 h-10", children: _jsx(AvatarFallback, { className: "bg-primary/20 text-primary", children: "AD" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium truncate", children: "AbelDev" }), _jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [_jsx(Zap, { className: "w-3 h-3" }), "2,980 XP"] })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onLogout, className: "hover:bg-destructive/20 hover:text-destructive flex-shrink-0", children: _jsx(LogOut, { className: "w-4 h-4" }) })] }) })] }), _jsxs("main", { className: "flex-1 ml-64", children: [_jsxs("header", { className: "h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-10", children: [_jsx("div", { className: "flex items-center gap-4", children: _jsx("h2", { className: "text-xl font-semibold", children: menuItems.find(item => item.id === currentPage)?.label ||
                                        adminMenuItems.find(item => item.id === currentPage)?.label ||
                                        'Chat' }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg", children: [_jsx(Zap, { className: "w-5 h-5 text-accent" }), _jsx("span", { className: "font-semibold text-accent", children: "2,980 XP" })] }), _jsxs(Button, { variant: "ghost", size: "icon", className: "relative", children: [_jsx(Bell, { className: "w-5 h-5" }), _jsx("span", { className: "absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" })] }), _jsx(Avatar, { className: "w-9 h-9 cursor-pointer hover:ring-2 hover:ring-primary transition-all", onClick: () => onNavigate('profile'), children: _jsx(AvatarFallback, { className: "bg-primary/20 text-primary", children: "AD" }) })] })] }), _jsx("div", { className: "p-8", children: children })] })] }));
}
