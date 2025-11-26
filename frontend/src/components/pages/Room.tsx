import { useState } from "react";
import { Users, Lock, Globe, Search, Plus, Video, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

interface RoomsProps {
  onNavigate: (page: string) => void;
}

export function Rooms({ onNavigate }: RoomsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomTopic, setNewRoomTopic] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const rooms = [
    {
      id: 1,
      name: "Frontend Masters",
      topic: "React & TypeScript",
      members: 24,
      maxMembers: 50,
      isPrivate: false,
      language: "JavaScript",
      active: true
    },
    {
      id: 2,
      name: "Python Gang",
      topic: "Data Structures",
      members: 18,
      maxMembers: 30,
      isPrivate: false,
      language: "Python",
      active: true
    },
    {
      id: 3,
      name: "Algoritmos Avançados",
      topic: "Competitive Programming",
      members: 12,
      maxMembers: 25,
      isPrivate: false,
      language: "C++",
      active: true
    },
    {
      id: 4,
      name: "Web3 Developers",
      topic: "Blockchain & Smart Contracts",
      members: 15,
      maxMembers: 40,
      isPrivate: true,
      language: "Solidity",
      active: true
    },
    {
      id: 5,
      name: "Machine Learning",
      topic: "Neural Networks & AI",
      members: 32,
      maxMembers: 60,
      isPrivate: false,
      language: "Python",
      active: true
    },
    {
      id: 6,
      name: "DevOps & Cloud",
      topic: "AWS, Docker, Kubernetes",
      members: 21,
      maxMembers: 35,
      isPrivate: false,
      language: "Various",
      active: true
    },
    {
      id: 7,
      name: "Mobile Dev",
      topic: "React Native & Flutter",
      members: 17,
      maxMembers: 30,
      isPrivate: false,
      language: "JavaScript",
      active: true
    },
    {
      id: 8,
      name: "Game Development",
      topic: "Unity & Unreal Engine",
      members: 14,
      maxMembers: 25,
      isPrivate: true,
      language: "C#",
      active: true
    },
  ];

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRoom = () => {
    setDialogOpen(false);
    setNewRoomName("");
    setNewRoomTopic("");
    setIsPrivate(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl mb-2">Salas de Estudo 👥</h1>
          <p className="text-muted-foreground">
            Conecte-se com outros desenvolvedores e aprenda em grupo
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Criar Sala
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Criar Nova Sala</DialogTitle>
              <DialogDescription>
                Crie uma sala para estudar com outros desenvolvedores
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Nome da Sala</Label>
                <Input
                  id="room-name"
                  placeholder="Ex: Frontend Masters"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-topic">Tema/Tópico</Label>
                <Input
                  id="room-topic"
                  placeholder="Ex: React & TypeScript"
                  value={newRoomTopic}
                  onChange={(e) => setNewRoomTopic(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="private-room">Sala Privada</Label>
                  <p className="text-sm text-muted-foreground">
                    Apenas membros convidados podem entrar
                  </p>
                </div>
                <Switch
                  id="private-room"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
              </div>
              <Button onClick={handleCreateRoom} className="w-full bg-primary hover:bg-primary/90">
                Criar Sala
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar salas..."
              className="pl-10 bg-secondary border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card
            key={room.id}
            className="bg-gradient-to-br from-card to-secondary border-border hover:border-primary/50 transition-all group cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge
                  variant="outline"
                  className={room.isPrivate ? 
                    "bg-purple-500/20 text-purple-400 border-purple-500/30" : 
                    "bg-green-500/20 text-green-400 border-green-500/30"
                  }
                >
                  {room.isPrivate ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Privada
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3 mr-1" />
                      Pública
                    </>
                  )}
                </Badge>
                <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
                  {room.language}
                </Badge>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                {room.name}
              </CardTitle>
              <CardDescription>{room.topic}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-semibold text-foreground">{room.members}</span>
                    <span className="text-muted-foreground">/{room.maxMembers}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Ativa</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => onNavigate('chat')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-border hover:border-primary/50"
                >
                  <Video className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg mb-2">Nenhuma sala encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Tente outro termo de busca ou crie uma nova sala
            </p>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Criar Nova Sala
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sobre as Salas de Estudo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Colabore em tempo real com outros desenvolvedores</p>
          <p>• Compartilhe sua tela para mostrar código e conceitos</p>
          <p>• Chat em tempo real para discussões técnicas</p>
          <p>• Crie salas públicas ou privadas para seu grupo</p>
        </CardContent>
      </Card>
    </div>
  );
}
