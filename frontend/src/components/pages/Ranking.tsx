import { useState } from "react";
import { Trophy, Medal, TrendingUp, TrendingDown, Zap, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export function Ranking() {
  const [period, setPeriod] = useState("global");

  const rankingData = [
    { rank: 1, name: "DevMaster_99", avatar: "", score: 3450, change: 2, streak: 15, solved: 89 },
    { rank: 2, name: "CodeNinja", avatar: "", score: 3200, change: 1, streak: 12, solved: 76 },
    { rank: 3, name: "AbelDev", avatar: "", score: 2980, change: -1, streak: 8, solved: 47 },
    { rank: 4, name: "PyMaster", avatar: "", score: 2850, change: 3, streak: 10, solved: 63 },
    { rank: 5, name: "JSGenius", avatar: "", score: 2740, change: 0, streak: 6, solved: 58 },
    { rank: 6, name: "AlgoQueen", avatar: "", score: 2650, change: 2, streak: 14, solved: 71 },
    { rank: 7, name: "BinaryBoss", avatar: "", score: 2540, change: -2, streak: 5, solved: 52 },
    { rank: 8, name: "RecurseKing", avatar: "", score: 2430, change: 1, streak: 9, solved: 49 },
    { rank: 9, name: "DataDiva", avatar: "", score: 2320, change: 0, streak: 7, solved: 45 },
    { rank: 10, name: "LoopLegend", avatar: "", score: 2210, change: -1, streak: 4, solved: 41 },
  ];

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-br from-yellow-400 to-yellow-600";
      case 2: return "bg-gradient-to-br from-gray-300 to-gray-500";
      case 3: return "bg-gradient-to-br from-orange-400 to-orange-600";
      default: return "bg-primary/20";
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className="w-5 h-5" />;
    }
    return <span className="font-bold">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Ranking Global 🏆</h1>
        <p className="text-muted-foreground">
          Veja quem são os melhores programadores da plataforma
        </p>
      </div>

      {/* Period Selector */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="friends">Amigos</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rankingData.slice(0, 3).map((user) => (
          <Card
            key={user.rank}
            className={`relative overflow-hidden border-2 ${
              user.rank === 1 ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5' :
              user.rank === 2 ? 'border-gray-400/50 bg-gradient-to-br from-gray-400/10 to-gray-500/5' :
              'border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-orange-600/5'
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
              <Trophy className="w-full h-full" />
            </div>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-background">
                    <AvatarFallback className={getMedalColor(user.rank)}>
                      <span className="text-2xl text-white">
                        {user.name.substring(0, 2).toUpperCase()}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center ${getMedalColor(user.rank)} border-2 border-background`}>
                    {getMedalIcon(user.rank)}
                  </div>
                </div>
              </div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-accent mt-2">
                <Zap className="w-6 h-6" />
                {user.score.toLocaleString()}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desafios resolvidos:</span>
                <span className="font-semibold">{user.solved}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sequência atual:</span>
                <span className="font-semibold flex items-center gap-1">
                  <Award className="w-4 h-4 text-accent" />
                  {user.streak} dias
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Ranking Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Ranking Completo</CardTitle>
          <CardDescription>
            Acompanhe sua posição e evolução
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rankingData.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  user.rank === 3 ? 'bg-primary/10 border-primary/30' : 'bg-secondary/30 border-border hover:border-primary/30'
                }`}
              >
                {/* Rank */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getMedalColor(user.rank)} ${user.rank > 3 ? 'text-foreground' : 'text-white'}`}>
                  {getMedalIcon(user.rank)}
                </div>

                {/* Avatar */}
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name and Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{user.name}</p>
                    {user.rank === 3 && (
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                        Você
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{user.solved} desafios</span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {user.streak} dias
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-accent flex items-center gap-1 justify-end">
                    <Zap className="w-5 h-5" />
                    {user.score.toLocaleString()}
                  </p>
                  {user.change !== 0 && (
                    <p className={`text-sm flex items-center gap-1 justify-end ${
                      user.change > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {user.change > 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          +{user.change}
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3" />
                          {user.change}
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your Stats */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/30">
        <CardHeader>
          <CardTitle>Suas Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">3º</p>
              <p className="text-sm text-muted-foreground">Posição Atual</p>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-accent">2,980</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-green-400">+2</p>
              <p className="text-sm text-muted-foreground">Mudança</p>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">8</p>
              <p className="text-sm text-muted-foreground">Sequência</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
