import { useMemo, useState } from "react";
import { Users, Lock, Globe, Search, Plus, MessageSquare, MonitorUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useRooms } from "../../hooks/useRooms";
import type { RoomDetail } from "../../types/api";

interface RoomsProps {
  onNavigate: (page: string) => void;
  onRoomSelected?: (room: RoomDetail) => void;
}

export function Rooms({ onNavigate, onRoomSelected }: RoomsProps) {
  const { rooms, isLoading, error, createRoom, joinRoom } = useRooms();
  const [searchQuery, setSearchQuery] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [joinLoadingId, setJoinLoadingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) =>
        room.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      ),
    [rooms, searchQuery],
  );

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      setFormError('Informe um nome para a sala');
      return;
    }

    setIsCreating(true);
    setFormError(null);

    try {
      const created = await createRoom({ name: newRoomName.trim(), isPrivate });
      setNewRoomName("");
      setIsPrivate(false);
      setDialogOpen(false);
      if (onRoomSelected) {
        onRoomSelected(created);
      }
      onNavigate('chat');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível criar a sala';
      setFormError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    setJoinLoadingId(roomId);
    try {
      const detail = await joinRoom(roomId);
      if (onRoomSelected) {
        onRoomSelected(detail);
      }
      onNavigate('chat');
    } catch (err) {
      // TODO: surface join errors once we have a toast system
      console.error(err);
    } finally {
      setJoinLoadingId(null);
    }
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
                  onCheckedChange={(value) => setIsPrivate(value)}
                />
              </div>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <Button
                onClick={handleCreateRoom}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isCreating}
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando...
                  </span>
                ) : (
                  'Criar Sala'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/40">
          <CardContent className="py-4 text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

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
      {isLoading ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Carregando salas...
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className="bg-gradient-to-br from-card to-secondary border-border hover:border-primary/50 transition-all group"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    variant="outline"
                    className={
                      room.isPrivate
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-green-500/20 text-green-400 border-green-500/30'
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
                  <Badge
                    variant="outline"
                    className={
                      room.screenShare.isActive
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-accent/20 text-accent border-accent/30'
                    }
                  >
                    {room.screenShare.isActive ? (
                      <>
                        <MonitorUp className="w-3 h-3 mr-1" />
                        Apresentação ao vivo
                      </>
                    ) : (
                      'Sem transmissão'
                    )}
                  </Badge>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {room.name}
                </CardTitle>
                <CardDescription>
                  {room.presence.participants.length} participante{room.presence.participants.length === 1 ? '' : 's'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{room.presence.participants.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div
                      className={`w-2 h-2 rounded-full ${room.screenShare.isActive ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}
                    />
                    <span>{room.screenShare.isActive ? 'Tela ativa' : 'Disponível'}</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={joinLoadingId === room.id}
                >
                  {joinLoadingId === room.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Entrando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Entrar
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredRooms.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg mb-2">Nenhuma sala encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Tente outro termo de busca ou crie uma nova sala
            </p>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => setDialogOpen(true)}
            >
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
