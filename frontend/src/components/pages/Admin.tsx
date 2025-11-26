import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function Admin() {
  const [activeTab, setActiveTab] = useState("challenges");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const challenges = [
    { id: 1, title: "Fibonacci Recursivo", category: "Recursão", difficulty: "Médio", xp: 150, status: "Ativo" },
    { id: 2, title: "Binary Search Tree", category: "Árvores", difficulty: "Difícil", xp: 250, status: "Ativo" },
    { id: 3, title: "Array Rotation", category: "Arrays", difficulty: "Fácil", xp: 50, status: "Ativo" },
    { id: 4, title: "Merge Sort", category: "Ordenação", difficulty: "Médio", xp: 120, status: "Ativo" },
    { id: 5, title: "Graph Traversal", category: "Grafos", difficulty: "Difícil", xp: 300, status: "Rascunho" },
  ];

  const users = [
    { id: 1, name: "DevMaster_99", email: "devmaster", xp: 3450, role: "Usuário", status: "Ativo" },
    { id: 2, name: "CodeNinja", email: "codeninja", xp: 3200, role: "Usuário", status: "Ativo" },
    { id: 3, name: "AbelDev", email: "abel", xp: 2980, role: "Admin", status: "Ativo" },
    { id: 4, name: "PyMaster", email: "pymaster", xp: 2850, role: "Usuário", status: "Ativo" },
    { id: 5, name: "JSGenius", email: "jsgenius", xp: 2740, role: "Usuário", status: "Inativo" },
  ];

  const scores = [
    { id: 1, user: "DevMaster_99", challenge: "Fibonacci Recursivo", score: 150, date: "2025-10-20" },
    { id: 2, user: "CodeNinja", challenge: "Binary Search Tree", score: 250, date: "2025-10-21" },
    { id: 3, user: "AbelDev", challenge: "Array Rotation", score: 50, date: "2025-10-22" },
    { id: 4, user: "PyMaster", challenge: "Merge Sort", score: 120, date: "2025-10-22" },
    { id: 5, user: "JSGenius", challenge: "Valid Parentheses", score: 75, date: "2025-10-23" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Médio": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Difícil": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Inativo": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "Rascunho": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Painel Administrativo ⚙️</h1>
        <p className="text-muted-foreground">
          Gerencie desafios, usuários e pontuações da plataforma
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges">Desafios</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="scores">Pontuações</TabsTrigger>
        </TabsList>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Gerenciar Desafios</CardTitle>
                  <CardDescription>Crie e edite desafios de programação</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Desafio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-card">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Desafio</DialogTitle>
                      <DialogDescription>
                        Preencha os detalhes do novo desafio
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Título do Desafio</Label>
                          <Input placeholder="Ex: Fibonacci Recursivo" className="bg-secondary border-border" />
                        </div>
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select>
                            <SelectTrigger className="bg-secondary border-border">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="recursao">Recursão</SelectItem>
                              <SelectItem value="arrays">Arrays</SelectItem>
                              <SelectItem value="arvores">Árvores</SelectItem>
                              <SelectItem value="grafos">Grafos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Dificuldade</Label>
                          <Select>
                            <SelectTrigger className="bg-secondary border-border">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="facil">Fácil</SelectItem>
                              <SelectItem value="medio">Médio</SelectItem>
                              <SelectItem value="dificil">Difícil</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>XP</Label>
                          <Input type="number" placeholder="150" className="bg-secondary border-border" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea placeholder="Descreva o desafio..." className="bg-secondary border-border h-24" />
                      </div>
                      <div className="space-y-2">
                        <Label>Código Inicial</Label>
                        <Textarea placeholder="// Código inicial..." className="font-code bg-secondary border-border h-32" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button className="bg-primary hover:bg-primary/90">Criar Desafio</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar desafios..."
                    className="pl-10 bg-secondary border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead>ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Dificuldade</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challenges.map((challenge) => (
                      <TableRow key={challenge.id} className="hover:bg-secondary/30">
                        <TableCell className="font-code">{challenge.id}</TableCell>
                        <TableCell className="font-medium">{challenge.title}</TableCell>
                        <TableCell>{challenge.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-accent">{challenge.xp}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(challenge.status)}>
                            {challenge.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="hover:bg-primary/20">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-destructive/20">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>Visualize e modere usuários da plataforma</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuários..."
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>XP Total</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-secondary/30">
                        <TableCell className="font-code">{user.id}</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="font-semibold text-accent">{user.xp.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={user.role === "Admin" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="hover:bg-primary/20">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-destructive/20">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scores Tab */}
        <TabsContent value="scores" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div>
                <CardTitle>Histórico de Pontuações</CardTitle>
                <CardDescription>Acompanhe as pontuações dos usuários</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pontuações..."
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead>ID</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Desafio</TableHead>
                      <TableHead>Pontuação</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scores.map((score) => (
                      <TableRow key={score.id} className="hover:bg-secondary/30">
                        <TableCell className="font-code">{score.id}</TableCell>
                        <TableCell className="font-medium">{score.user}</TableCell>
                        <TableCell>{score.challenge}</TableCell>
                        <TableCell className="font-semibold text-accent">{score.score} XP</TableCell>
                        <TableCell className="text-muted-foreground">{score.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="hover:bg-destructive/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total de Desafios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{challenges.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{users.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Pontuações Registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-400">{scores.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
