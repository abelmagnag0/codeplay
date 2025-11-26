import { useState } from "react";
import { Search, Filter, Zap, Clock, Code2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Textarea } from "../ui/textarea";

export function Challenges() {
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const challenges = [
    {
      id: 1,
      title: "Fibonacci Recursivo",
      description: "Implemente a sequência de Fibonacci usando recursão",
      difficulty: "Médio",
      xp: 150,
      language: "Python",
      avgTime: "15 min",
      solved: 342
    },
    {
      id: 2,
      title: "Binary Search Tree",
      description: "Crie uma árvore binária de busca com operações básicas",
      difficulty: "Difícil",
      xp: 250,
      language: "JavaScript",
      avgTime: "30 min",
      solved: 156
    },
    {
      id: 3,
      title: "Array Rotation",
      description: "Rotacione um array N posições para a direita",
      difficulty: "Fácil",
      xp: 50,
      language: "C++",
      avgTime: "10 min",
      solved: 567
    },
    {
      id: 4,
      title: "Merge Sort",
      description: "Implemente o algoritmo Merge Sort",
      difficulty: "Médio",
      xp: 120,
      language: "Python",
      avgTime: "20 min",
      solved: 289
    },
    {
      id: 5,
      title: "Valid Parentheses",
      description: "Valide se uma string de parênteses está balanceada",
      difficulty: "Fácil",
      xp: 75,
      language: "JavaScript",
      avgTime: "12 min",
      solved: 423
    },
    {
      id: 6,
      title: "Graph Traversal",
      description: "Implemente BFS e DFS em um grafo",
      difficulty: "Difícil",
      xp: 300,
      language: "C++",
      avgTime: "40 min",
      solved: 98
    },
    {
      id: 7,
      title: "Hash Table",
      description: "Crie uma hash table com tratamento de colisões",
      difficulty: "Médio",
      xp: 180,
      language: "Python",
      avgTime: "25 min",
      solved: 234
    },
    {
      id: 8,
      title: "Linked List Reverse",
      description: "Inverta uma lista ligada in-place",
      difficulty: "Fácil",
      xp: 60,
      language: "JavaScript",
      avgTime: "8 min",
      solved: 512
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Médio": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Difícil": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesLanguage = selectedLanguage === "all" || challenge.language === selectedLanguage;
    const matchesDifficulty = selectedDifficulty === "all" || challenge.difficulty === selectedDifficulty;
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLanguage && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Desafios de Código 🎯</h1>
        <p className="text-muted-foreground">
          Resolva desafios, ganhe XP e suba no ranking!
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar desafios..."
                className="pl-10 bg-secondary border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border">
                <SelectValue placeholder="Linguagem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
                <SelectItem value="C++">C++</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Fácil">Fácil</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Difícil">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredChallenges.map((challenge) => (
          <Card key={challenge.id} className="bg-card border-border hover:border-primary/50 transition-all group cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {challenge.title}
                  </CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </div>
                <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Code2 className="w-4 h-4" />
                      <span className="font-code">{challenge.language}</span>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {challenge.avgTime}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-accent font-semibold">
                    <Zap className="w-4 h-4" />
                    {challenge.xp} XP
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {challenge.solved} pessoas resolveram
                  </span>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        Resolver
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
                      <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                          {challenge.title}
                          <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </DialogTitle>
                        <DialogDescription>{challenge.description}</DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-secondary rounded-lg border border-border">
                          <h4 className="font-semibold mb-2">Detalhes do Desafio</h4>
                          <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                              Implemente uma solução eficiente para este problema.
                              Considere a complexidade de tempo e espaço.
                            </p>
                            <div className="flex gap-4 mt-3">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Code2 className="w-4 h-4" />
                                {challenge.language}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                Tempo médio: {challenge.avgTime}
                              </span>
                              <span className="flex items-center gap-1 text-accent">
                                <Zap className="w-4 h-4" />
                                {challenge.xp} XP
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Seu Código</h4>
                          <Textarea
                            placeholder={`// Escreva seu código em ${challenge.language} aqui...\n\nfunction solution() {\n  // Sua solução\n}`}
                            className="font-code h-64 bg-secondary border-border"
                          />
                        </div>

                        <div className="flex justify-end gap-3">
                          <Button variant="outline">Testar Código</Button>
                          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                            Enviar Solução
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg mb-2">Nenhum desafio encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou a busca
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
