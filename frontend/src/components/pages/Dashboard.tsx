import { Trophy, Users, Zap, Star, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const featuredChallenges = [
    { id: 1, title: "Fibonacci Recursivo", difficulty: "Médio", xp: 150, language: "Python" },
    { id: 2, title: "Binary Search Tree", difficulty: "Difícil", xp: 250, language: "JavaScript" },
    { id: 3, title: "Array Rotation", difficulty: "Fácil", xp: 50, language: "C++" },
  ];

  const popularRooms = [
    { id: 1, name: "Frontend Masters", members: 24, topic: "React & TypeScript" },
    { id: 2, name: "Python Gang", members: 18, topic: "Data Structures" },
    { id: 3, name: "Algoritmos Avançados", members: 12, topic: "Competitive Programming" },
  ];

  const topRanking = [
    { rank: 1, name: "DevMaster_99", avatar: "", score: 3450 },
    { rank: 2, name: "CodeNinja", avatar: "", score: 3200 },
    { rank: 3, name: "AbelDev", avatar: "", score: 2980 },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Médio": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Difícil": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl mb-2">Bem-vindo de volta, AbelDev! 👋</h1>
          <p className="text-muted-foreground">
            Continue sua jornada de aprendizado. Você está no caminho certo!
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Seu XP Total</p>
            <p className="text-2xl font-semibold text-accent flex items-center gap-2">
              <Zap className="w-5 h-5" /> 2,980
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Desafios Resolvidos</CardTitle>
            <Trophy className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +12 esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Ranking Atual</CardTitle>
            <Star className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#3</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Subiu 2 posições
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Horas de Estudo</CardTitle>
            <Clock className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23h</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              Esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Challenges */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Desafios em Destaque
              <Button variant="ghost" size="sm" onClick={() => onNavigate('challenges')}>
                Ver todos
              </Button>
            </CardTitle>
            <CardDescription>
              Novos desafios para você conquistar XP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuredChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="space-y-1 flex-1">
                  <h4 className="group-hover:text-primary transition-colors">{challenge.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-code">
                      {challenge.language}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-accent font-semibold flex items-center gap-1">
                      <Zap className="w-4 h-4" /> {challenge.xp} XP
                    </p>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Resolver
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mini Ranking */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Top 3 Ranking
              <Button variant="ghost" size="sm" onClick={() => onNavigate('ranking')}>
                Ver ranking
              </Button>
            </CardTitle>
            <CardDescription>
              Os melhores desta semana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topRanking.map((user) => (
              <div
                key={user.rank}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-all"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  user.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                  user.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {user.rank}
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.score} XP</p>
                </div>
                <Trophy className="w-5 h-5 text-accent" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Popular Rooms */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Salas Populares
            <Button onClick={() => onNavigate('rooms')} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Criar Sala
            </Button>
          </CardTitle>
          <CardDescription>
            Junte-se a outros desenvolvedores e aprenda junto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularRooms.map((room) => (
              <div
                key={room.id}
                className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary border border-border hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold group-hover:text-primary transition-colors">
                      {room.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{room.topic}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{room.members} membros</span>
                    </div>
                    <Button size="sm" variant="secondary">
                      Entrar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
