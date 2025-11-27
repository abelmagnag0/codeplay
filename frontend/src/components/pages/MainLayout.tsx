import { ReactNode, useMemo } from "react";
import { Home, Trophy, Target, Users, User, Shield, Bell, Zap, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Logo } from "./Logo";
import type { User as UserType } from "../../types/api";

interface MainLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  user: UserType | null;
}

export function MainLayout({ children, currentPage, onNavigate, onLogout, user }: MainLayoutProps) {
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

  const computed = useMemo(() => {
    const safeName = user?.name?.trim() || 'Convidado';
    const safeXp = typeof user?.xp === 'number' && Number.isFinite(user.xp) ? user.xp : 0;
    const initials = safeName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || safeName.substring(0, 2).toUpperCase();

    return {
      initials,
      name: safeName,
      xp: safeXp,
      avatar: user?.avatar ?? null,
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Logo size="md" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === item.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-border">
            {adminMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <Avatar className="w-10 h-10">
              {computed.avatar ? <AvatarImage src={computed.avatar} alt={computed.name} /> : null}
              <AvatarFallback className="bg-primary/20 text-primary">
                {computed.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{computed.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {computed.xp.toLocaleString('pt-BR')} XP
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {menuItems.find(item => item.id === currentPage)?.label || 
               adminMenuItems.find(item => item.id === currentPage)?.label ||
               'Chat'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg">
              <Zap className="w-5 h-5 text-accent" />
              <span className="font-semibold text-accent">{computed.xp.toLocaleString('pt-BR')} XP</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </Button>
            <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => onNavigate('profile')}>
              {computed.avatar ? <AvatarImage src={computed.avatar} alt={computed.name} /> : null}
              <AvatarFallback className="bg-primary/20 text-primary">
                {computed.initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
