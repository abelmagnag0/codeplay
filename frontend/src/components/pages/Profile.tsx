import { Award, Zap, Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

export function Profile() {
  const achievements = [
    { id: 1, name: "Primeira Vitória", description: "Resolva seu primeiro desafio", icon: "🏆", earned: true },
    { id: 2, name: "Streak Master", description: "Mantenha uma sequência de 7 dias", icon: "🔥", earned: true },
    { id: 3, name: "Top 10", description: "Entre no top 10 do ranking", icon: "⭐", earned: true },
    { id: 4, name: "Social Butterfly", description: "Entre em 5 salas diferentes", icon: "🦋", earned: true },
    { id: 5, name: "Code Master", description: "Resolva 50 desafios", icon: "💻", earned: false },
    { id: 6, name: "Speed Demon", description: "Resolva um desafio em menos de 5min", icon: "⚡", earned: false },
  ];

  const recentActivity = [
    { action: "Resolveu", challenge: "Array Rotation", xp: 50, date: "Hoje, 14:30" },
    { action: "Entrou na sala", challenge: "Frontend Masters", xp: 0, date: "Hoje, 13:15" },
    { action: "Resolveu", challenge: "Valid Parentheses", xp: 75, date: "Ontem, 18:45" },
    { action: "Subiu para", challenge: "#3 no Ranking", xp: 0, date: "Ontem, 17:20" },
  ];

  const languages = [
    { name: "JavaScript", problems: 18, percentage: 40 },
    { name: "Python", problems: 15, percentage: 33 },
    { name: "C++", problems: 12, percentage: 27 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e conquistas
        </p>
      </div>

      {/* Profile Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/5 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-4xl">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h2 className="text-3xl font-bold mb-1">AbelDev</h2>
                <p className="text-muted-foreground">Membro desde Outubro 2025</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5">
                  <Trophy className="w-4 h-4 mr-2" />
                  Rank #3
                </Badge>
                <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 px-4 py-1.5">
                  <Zap className="w-4 h-4 mr-2" />
                  2,980 XP
                </Badge>
                <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-4 py-1.5">
                  <Award className="w-4 h-4 mr-2" />
                  4 Conquistas
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
            <CardDescription>Seu desempenho na plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
                <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">47</p>
                <p className="text-sm text-muted-foreground">Desafios</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">#3</p>
                <p className="text-sm text-muted-foreground">Ranking</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
                <Award className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Sequência</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <p className="text-2xl font-bold">+2</p>
                <p className="text-sm text-muted-foreground">Posições</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Progresso para próximo nível</span>
                  <span className="text-sm text-muted-foreground">2,980 / 3,500 XP</span>
                </div>
                <Progress value={85} className="h-3" />
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold mb-3">Linguagens Mais Utilizadas</h4>
                <div className="space-y-3">
                  {languages.map((lang) => (
                    <div key={lang.name}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-code">{lang.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {lang.problems} problemas ({lang.percentage}%)
                        </span>
                      </div>
                      <Progress value={lang.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Conquistas</CardTitle>
            <CardDescription>4 de 6 desbloqueadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center text-3xl cursor-pointer transition-all ${
                    achievement.earned
                      ? 'bg-gradient-to-br from-primary/20 to-accent/10 border-primary/50 hover:scale-110'
                      : 'bg-secondary/30 border-border opacity-40 grayscale'
                  }`}
                  title={`${achievement.name} - ${achievement.description}`}
                >
                  {achievement.icon}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>Seu histórico das últimas ações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {activity.action} <span className="text-primary">{activity.challenge}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </div>
                {activity.xp > 0 && (
                  <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
                    +{activity.xp} XP
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
