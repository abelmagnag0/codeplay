import { useEffect, useMemo, useRef, useState } from "react";
import { Send, MonitorUp, MonitorOff, Users, Settings, ChevronLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { io, type Socket } from "socket.io-client";
import type { Message as MessageType, RoomDetail, RoomPresenceState } from "../../types/api";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../lib/api";
import { config } from "../../config";

interface ChatProps {
  room: RoomDetail;
  onLeave: () => void;
}

type JoinAck = { status: 'ok' } | { status: 'error'; message?: string };
type SendAck = { status: 'ok'; message: MessageType } | { status: 'error'; message: string };

export function Chat({ room, onLeave }: ChatProps) {
  const { user, accessToken } = useAuth();
  const [message, setMessage] = useState("");
  const [isSharing, setIsSharing] = useState(
    room.screenShare.isActive && room.screenShare.ownerUserId === user?.id,
  );
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [socketReady, setSocketReady] = useState(false);
  const [presence, setPresence] = useState<RoomPresenceState>(room.presence);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSharing(room.screenShare.isActive && room.screenShare.ownerUserId === user?.id);
    setPresence(room.presence);
  }, [room, user]);

  useEffect(() => {
    let active = true;

    const loadMessages = async () => {
      if (!accessToken) {
        setMessages([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const history = await apiFetch<MessageType[]>(`/api/rooms/${room.id}/messages`, {
          authToken: accessToken,
        });
        if (active) {
          setMessages(history);
        }
      } catch (err) {
        if (active) {
          const messageText = err instanceof Error ? err.message : 'Não foi possível carregar o histórico';
          setError(messageText);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      active = false;
    };
  }, [room.id, accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = io(config.socketUrl, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socketRef.current = socket;
    setSocketReady(false);

    const handleConnectError = (err: Error) => {
      setError(err.message || 'Falha ao conectar ao chat em tempo real');
    };

    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', () => {
      setSocketReady(false);
      setPresence({ roomId: room.id, participants: [] });
    });

    socket.on('message:new', (incoming: MessageType) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === incoming.id);
        if (exists) {
          return prev.map((msg) => (msg.id === incoming.id ? incoming : msg));
        }
        return [...prev, incoming];
      });
    });

    socket.on('room:presence:update', (state: RoomPresenceState) => {
      if (state?.roomId === room.id) {
        setPresence(state);
      }
    });

    const handleForceLeave = (payload: { roomId: string; reason?: string }) => {
      if (payload?.roomId === room.id) {
        setError(payload.reason === 'exclusive-membership'
          ? 'Você foi movido para outra sala em outra aba e saiu desta conversa.'
          : 'Você foi removido desta sala.');
        onLeave();
      }
    };

    socket.on('room:force-leave', handleForceLeave);

    socket.emit('room:join', room.id, (response: JoinAck) => {
      if (!response || response.status !== 'ok') {
        setError(response?.message || 'Não foi possível entrar na sala');
        setSocketReady(false);
      } else {
        setSocketReady(true);
      }
    });

    return () => {
      if (socket.connected) {
        socket.emit('room:leave', room.id, () => {
          // Acknowledgement callback intentionally left blank
        });
      }
      socket.off('connect_error', handleConnectError);
      socket.off('message:new');
      socket.off('room:presence:update');
      socket.off('room:force-leave', handleForceLeave);
      socket.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, [room.id, accessToken, onLeave]);

  const participants = useMemo(() => {
    if (presence.participants.length > 0) {
      return presence.participants.map((participant) => ({
        id: participant.userId,
        name: participant.name,
        avatar: participant.avatar ?? null,
        email: participant.email ?? undefined,
      }));
    }

    const fallbackRecord = new Map<string, { id: string; name: string; avatar?: string | null }>();

    messages.forEach((msg) => {
      if (!msg.userId) {
        return;
      }
      const derivedName = msg.user?.name
        || (msg.userId === user?.id ? user.name : `Participante ${msg.userId.slice(-4)}`);
      fallbackRecord.set(msg.userId, {
        id: msg.userId,
        name: derivedName,
        avatar: msg.user?.avatar ?? null,
      });
    });

    room.participants.forEach((participantId) => {
      if (!participantId) return;
      if (fallbackRecord.has(participantId)) {
        return;
      }
      const fallbackName = participantId === user?.id ? user.name : `Participante ${participantId.slice(-4)}`;
      fallbackRecord.set(participantId, {
        id: participantId,
        name: fallbackName,
        avatar: null,
      });
    });

    return Array.from(fallbackRecord.values());
  }, [presence.participants, messages, room.participants, user]);

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    if (!socketRef.current || !socketReady) {
      setError('Conexão com o chat não está pronta. Tente novamente.');
      return;
    }

    setIsSending(true);
    setError(null);

    const payload = { roomId: room.id, content: message.trim() };

    socketRef.current.emit('message:send', payload, (response: SendAck) => {
      if (response?.status === 'ok') {
        const delivered = response.message;
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === delivered.id);
          if (exists) {
            return prev.map((msg) => (msg.id === delivered.id ? delivered : msg));
          }
          return [...prev, delivered];
        });
        setMessage('');
      } else if (response?.status === 'error') {
        setError(response.message || 'Não foi possível enviar a mensagem');
      } else {
        setError('Não foi possível enviar a mensagem');
      }

      setIsSending(false);
    });
  };

  const toggleScreenShare = () => {
    setIsSharing((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLeave}
            className="hover:bg-secondary"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl">{room.name}</h1>
            <p className="text-sm text-muted-foreground">
              {room.isPrivate ? 'Sala privada' : 'Sala pública'}
            </p>
          </div>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            {presence.participants.length} online
          </Badge>
        </div>
        <Button variant="outline" size="icon" className="border-border hover:border-primary/50">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Screen Share Area */}
          {isSharing && (
            <Card className="bg-card border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MonitorUp className="w-4 h-4 text-primary" />
                    Você está compartilhando sua tela
                  </CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={toggleScreenShare}
                  >
                    <MonitorOff className="w-4 h-4 mr-2" />
                    Encerrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-secondary rounded-lg border border-border flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MonitorUp className="w-12 h-12 mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Sua tela está sendo compartilhada
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] p-4">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Carregando mensagens...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.userId === user?.id;
                      const displayName = msg.user?.name || (isOwn ? user.name : `Participante ${msg.userId.slice(-4)}`);
                      const avatarUrl = msg.user?.avatar;

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                            <AvatarFallback className={isOwn ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}>
                              {displayName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex-1 space-y-1 ${isOwn ? 'text-right' : ''}`}>
                            <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                              <span className="text-sm font-semibold">{displayName}</span>
                              <span className="text-xs text-muted-foreground">{formatTimestamp(msg.createdAt)}</span>
                            </div>
                            <div
                              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary border border-border'
                              }`}
                            >
                              <p className="text-sm break-words">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="p-4 border-t border-border bg-secondary/30">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-background border-border"
                    disabled={isSending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className={`border-border ${isSharing ? 'bg-primary/20 border-primary/50' : ''}`}
                    onClick={toggleScreenShare}
                  >
                    {isSharing ? <MonitorOff className="w-4 h-4" /> : <MonitorUp className="w-4 h-4" />}
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSending}>
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="bg-destructive/10 border-destructive/40">
              <CardContent className="py-3 text-sm text-destructive">
                {error}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="bg-card border-border h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Participantes ({presence.participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      {participant.avatar ? <AvatarImage src={participant.avatar} alt={participant.name} /> : null}
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {participant.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">{participant.id === user?.id ? 'Você' : 'Participante'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <MonitorUp className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm">
              <span className="font-semibold">Dica:</span> Clique no ícone de monitor para compartilhar sua tela com outros participantes.
              Perfeito para demonstrar código ou explicar conceitos!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
