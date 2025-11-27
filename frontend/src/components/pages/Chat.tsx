import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, MonitorUp, MonitorOff, Users, Settings, ChevronLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { io, type Socket } from "socket.io-client";
import type { Message as MessageType, RoomDetail, RoomPresenceState, ScreenShareState } from "../../types/api";
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
  const [screenState, setScreenState] = useState<ScreenShareState>(room.screenShare);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTogglingShare, setIsTogglingShare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [socketReady, setSocketReady] = useState(false);
  const [presence, setPresence] = useState<RoomPresenceState>(room.presence);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] = useState<MediaStream | null>(null);
  const [isRequestingShare, setIsRequestingShare] = useState(false);

  const localScreenVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteScreenVideoRef = useRef<HTMLVideoElement | null>(null);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localScreenStreamRef = useRef<MediaStream | null>(null);
  const remoteScreenStreamRef = useRef<MediaStream | null>(null);
  const screenStateRef = useRef<ScreenShareState>(room.screenShare);
  const userIdRef = useRef<string | null>(user?.id ?? null);
  const pendingViewerRequestRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScreenState(room.screenShare);
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
    screenStateRef.current = screenState;
  }, [screenState]);

  useEffect(() => {
    userIdRef.current = user?.id ?? null;
  }, [user?.id]);

  useEffect(() => {
    localScreenStreamRef.current = localScreenStream;
    if (localScreenVideoRef.current) {
      localScreenVideoRef.current.srcObject = localScreenStream;
    }
  }, [localScreenStream]);

  useEffect(() => {
    remoteScreenStreamRef.current = remoteScreenStream;
    if (remoteScreenVideoRef.current) {
      remoteScreenVideoRef.current.srcObject = remoteScreenStream;
    }
  }, [remoteScreenStream]);

  const closePeerConnection = useCallback((peerUserId: string) => {
    const connection = peerConnections.current.get(peerUserId);
    if (!connection) {
      return;
    }
    connection.onicecandidate = null;
    connection.ontrack = null;
    connection.onconnectionstatechange = null;
    connection.close();
    peerConnections.current.delete(peerUserId);
  }, []);

  const stopAllPeerConnections = useCallback(() => {
    peerConnections.current.forEach((connection) => {
      connection.onicecandidate = null;
      connection.ontrack = null;
      connection.onconnectionstatechange = null;
      connection.close();
    });
    peerConnections.current.clear();
  }, []);

  const stopRemotePlayback = useCallback((notifyServer: boolean) => {
    const currentStream = remoteScreenStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
    }
    remoteScreenStreamRef.current = null;
    setRemoteScreenStream(null);

    const presenterId = screenStateRef.current?.ownerUserId;
    if (presenterId) {
      closePeerConnection(presenterId);
    }

    pendingViewerRequestRef.current = false;
    setIsRequestingShare(false);

    if (notifyServer) {
      socketRef.current?.emit('screen:end', { roomId: room.id }, () => {
        // Acknowledgement intentionally ignored for cleanup path
      });
    }
  }, [closePeerConnection, room.id]);

  const endPresenting = useCallback(async (notifyServer = true) => {
    const currentStream = localScreenStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
    }
    localScreenStreamRef.current = null;
    setLocalScreenStream(null);

    stopAllPeerConnections();

    if (socketRef.current && notifyServer) {
      await new Promise<void>((resolve) => {
        socketRef.current?.emit('screen:availability', { roomId: room.id, isAvailable: false }, (response: { status: 'ok'; state: ScreenShareState } | { status: 'error'; message?: string }) => {
          if (response?.status === 'ok' && response.state) {
            setScreenState(response.state);
          } else if (response?.status === 'error') {
            setError(response.message || 'Não foi possível encerrar o compartilhamento de tela');
          }
          resolve();
        });
      });
    }
  }, [room.id, stopAllPeerConnections]);

  const createPeerConnection = useCallback((peerUserId: string, role: 'presenter' | 'viewer') => {
    const existingConnection = peerConnections.current.get(peerUserId);
    if (existingConnection) {
      existingConnection.close();
      peerConnections.current.delete(peerUserId);
    }

    const connection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    connection.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      const targetUserId = role === 'presenter' ? peerUserId : screenStateRef.current?.ownerUserId;
      if (!targetUserId) {
        return;
      }

      socketRef.current?.emit('screen:ice-candidate', {
        roomId: room.id,
        targetUserId,
        candidate: event.candidate,
      }, (response: { status: 'ok' } | { status: 'error'; message?: string }) => {
        if (response?.status === 'error') {
          setError(response.message || 'Não foi possível enviar informações de rede');
        }
      });
    };

    if (role === 'viewer') {
      connection.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) {
          remoteScreenStreamRef.current = stream;
          setRemoteScreenStream(stream);
          setIsRequestingShare(false);
          pendingViewerRequestRef.current = false;
        }
      };
    }

    connection.onconnectionstatechange = () => {
      if (connection.connectionState === 'failed' || connection.connectionState === 'disconnected') {
        if (role === 'viewer') {
          stopRemotePlayback(false);
        } else {
          closePeerConnection(peerUserId);
        }
      }
    };

    peerConnections.current.set(peerUserId, connection);
    return connection;
  }, [closePeerConnection, room.id, stopRemotePlayback]);

  const startPresenting = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Seu navegador não suporta compartilhamento de tela.');
    }

    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      });
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'AbortError') {
          throw new Error('Captura de tela cancelada.');
        }
        if (err.name === 'NotAllowedError') {
          throw new Error('Permissão de captura de tela negada.');
        }
      }
      throw new Error('Não foi possível iniciar a captura de tela.');
    }

    localScreenStreamRef.current = stream;
    setLocalScreenStream(stream);

    const [videoTrack] = stream.getVideoTracks();
    if (videoTrack) {
      videoTrack.addEventListener('ended', () => {
        void endPresenting();
      });
    }

    const response = await new Promise<{ status: 'ok'; state: ScreenShareState } | { status: 'error'; message?: string }>((resolve) => {
      socketRef.current?.emit('screen:availability', { roomId: room.id, isAvailable: true }, resolve);
    });

    if (response?.status === 'ok' && response.state) {
      setScreenState(response.state);
      return;
    }

    stream.getTracks().forEach((track) => track.stop());
    localScreenStreamRef.current = null;
    setLocalScreenStream(null);

    const errorMessage = response?.status === 'error' ? response.message : undefined;
    throw new Error(errorMessage || 'Não foi possível habilitar o compartilhamento de tela.');
  }, [endPresenting, room.id]);

  const handleScreenRequestEvent = useCallback(async (payload: { roomId: string; fromUserId: string; targetUserId: string }) => {
    if (!payload || payload.roomId !== room.id) {
      return;
    }

    if (payload.targetUserId !== userIdRef.current) {
      return;
    }

    const stream = localScreenStreamRef.current;
    if (!stream) {
      socketRef.current?.emit('screen:end', { roomId: room.id }, () => {});
      return;
    }

    try {
      const viewerId = payload.fromUserId;
      const connection = createPeerConnection(viewerId, 'presenter');
      stream.getTracks().forEach((track) => {
        connection.addTrack(track, stream as MediaStream);
      });

      const offer = await connection.createOffer({ offerToReceiveVideo: true });
      await connection.setLocalDescription(offer);

      socketRef.current?.emit('screen:offer', {
        roomId: room.id,
        targetUserId: viewerId,
        description: offer,
      }, (response: { status: 'ok' } | { status: 'error'; message?: string }) => {
        if (response?.status === 'error') {
          setError(response.message || 'Não foi possível preparar a transmissão de tela');
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na negociação de compartilhamento de tela');
    }
  }, [createPeerConnection, room.id]);

  const handleScreenOfferEvent = useCallback(async (payload: { roomId: string; fromUserId: string; targetUserId: string; description: RTCSessionDescriptionInit }) => {
    if (!payload || payload.roomId !== room.id) {
      return;
    }

    if (payload.targetUserId !== userIdRef.current) {
      return;
    }

    try {
      const presenterId = payload.fromUserId;
      const connection = createPeerConnection(presenterId, 'viewer');
      await connection.setRemoteDescription(new RTCSessionDescription(payload.description));

      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      socketRef.current?.emit('screen:answer', {
        roomId: room.id,
        targetUserId: presenterId,
        description: answer,
      }, (response: { status: 'ok'; state?: ScreenShareState } | { status: 'error'; message?: string }) => {
        if (response?.status === 'error') {
          setError(response.message || 'Não foi possível confirmar a recepção da tela');
        } else if (response?.status === 'ok' && response.state) {
          setScreenState(response.state);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao aceitar a transmissão de tela');
      setIsRequestingShare(false);
      pendingViewerRequestRef.current = false;
    }
  }, [createPeerConnection, room.id]);

  const handleScreenAnswerEvent = useCallback(async (payload: { roomId: string; fromUserId: string; targetUserId: string; description: RTCSessionDescriptionInit }) => {
    if (!payload || payload.roomId !== room.id) {
      return;
    }

    if (payload.targetUserId !== userIdRef.current) {
      return;
    }

    const connection = peerConnections.current.get(payload.fromUserId);
    if (!connection) {
      return;
    }

    try {
      await connection.setRemoteDescription(new RTCSessionDescription(payload.description));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar a negociação de tela');
    }
  }, [room.id]);

  const handleIceCandidateEvent = useCallback(async (payload: { roomId: string; fromUserId: string; targetUserId: string; candidate: RTCIceCandidateInit }) => {
    if (!payload || payload.roomId !== room.id) {
      return;
    }

    if (payload.targetUserId !== userIdRef.current) {
      return;
    }

    const connection = peerConnections.current.get(payload.fromUserId);
    if (!connection) {
      return;
    }

    try {
      await connection.addIceCandidate(new RTCIceCandidate(payload.candidate));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível processar informações de rede');
    }
  }, [room.id]);

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
      setScreenState({ roomId: room.id, isActive: false, ownerUserId: null, viewers: [] });
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

    const handleScreenState = (state: ScreenShareState) => {
      if (state?.roomId === room.id) {
        setScreenState(state);
      }
    };

    socket.on('screen:state', handleScreenState);
    socket.on('screen:request', handleScreenRequestEvent);
    socket.on('screen:offer', handleScreenOfferEvent);
    socket.on('screen:answer', handleScreenAnswerEvent);
    socket.on('screen:ice-candidate', handleIceCandidateEvent);

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
        socket.emit('screen:state:request', room.id, (response?: { status: 'ok'; state: ScreenShareState } | { status: 'error'; message?: string }) => {
          if (response?.status === 'ok' && response.state) {
            setScreenState(response.state);
          }
        });
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
      socket.off('screen:state', handleScreenState);
      socket.off('screen:request', handleScreenRequestEvent);
      socket.off('screen:offer', handleScreenOfferEvent);
      socket.off('screen:answer', handleScreenAnswerEvent);
      socket.off('screen:ice-candidate', handleIceCandidateEvent);
      socket.off('room:force-leave', handleForceLeave);
      stopRemotePlayback(true);
      void endPresenting(false);
      socket.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, [room.id, accessToken, onLeave, handleScreenAnswerEvent, handleScreenOfferEvent, handleScreenRequestEvent, handleIceCandidateEvent, endPresenting, stopRemotePlayback]);

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

  const presenterName = useMemo(() => {
    const ownerId = screenState.ownerUserId;
    if (!ownerId) {
      return null;
    }
    if (ownerId === user?.id) {
      return 'Você';
    }
    const participant = participants.find((person) => person.id === ownerId);
    if (participant) {
      return participant.name;
    }
    return `Participante ${ownerId.slice(-4)}`;
  }, [participants, screenState.ownerUserId, user?.id]);

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


  const isPresenter = screenState.isActive && screenState.ownerUserId === user?.id;
  const isScreenShareActive = screenState.isActive;
  const isViewer = screenState.isActive && !!screenState.ownerUserId && screenState.ownerUserId !== user?.id;

  const toggleScreenShare = async () => {
    if (!socketRef.current || !socketReady) {
      setError('Conexão com o chat não está pronta. Tente novamente.');
      return;
    }

    if (!user?.id) {
      setError('Usuário não autenticado.');
      return;
    }

    if (localScreenStreamRef.current || isPresenter) {
      setIsTogglingShare(true);
      try {
        await endPresenting();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível encerrar o compartilhamento de tela');
      } finally {
        setIsTogglingShare(false);
      }
      return;
    }

    if (screenState.isActive && !isPresenter) {
      setError('Outra pessoa já está compartilhando a tela desta sala.');
      return;
    }

    setIsTogglingShare(true);
    setError(null);

    try {
      await startPresenting();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível iniciar o compartilhamento de tela');
    } finally {
      setIsTogglingShare(false);
    }
  };

  useEffect(() => {
    if (!screenState.isActive) {
      if (localScreenStreamRef.current) {
        void endPresenting(false);
      }
      if (remoteScreenStreamRef.current) {
        stopRemotePlayback(false);
      }
    }
  }, [screenState.isActive, endPresenting, stopRemotePlayback]);

  useEffect(() => {
    if (!socketReady || !socketRef.current) {
      return;
    }

    const ownerId = screenState.ownerUserId;
    const shouldView = screenState.isActive && ownerId && ownerId !== user?.id;

    if (shouldView) {
      if (!remoteScreenStreamRef.current && !pendingViewerRequestRef.current) {
        pendingViewerRequestRef.current = true;
        setIsRequestingShare(true);
        socketRef.current.emit('screen:request', { roomId: room.id }, (response: { status: 'ok' } | { status: 'error'; message?: string }) => {
          if (response?.status === 'error') {
            setError(response.message || 'Não foi possível ingressar na transmissão');
            setIsRequestingShare(false);
            pendingViewerRequestRef.current = false;
          }
        });
      }
    } else {
      if (pendingViewerRequestRef.current) {
        pendingViewerRequestRef.current = false;
      }
      if (remoteScreenStreamRef.current) {
        stopRemotePlayback(false);
      }
      setIsRequestingShare(false);
    }
  }, [room.id, screenState, socketReady, stopRemotePlayback, user?.id]);

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
          {isPresenter && (
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
                    disabled={isTogglingShare}
                  >
                    <MonitorOff className="w-4 h-4 mr-2" />
                    Encerrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-lg border border-border bg-black/80 overflow-hidden">
                  {localScreenStream ? (
                    <video
                      ref={localScreenVideoRef}
                      className="h-full w-full object-contain bg-black"
                      autoPlay
                      playsInline
                      muted
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <p className="text-sm text-center px-4">
                        Preparando a captura de tela...
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isViewer && (
            <Card className="bg-card border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MonitorUp className="w-4 h-4 text-primary" />
                  {presenterName ? `${presenterName} está compartilhando a tela` : 'Compartilhamento de tela ativo'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-lg border border-border bg-black/80 overflow-hidden">
                  {remoteScreenStream ? (
                    <video
                      ref={remoteScreenVideoRef}
                      className="h-full w-full object-contain bg-black"
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                      {isRequestingShare ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <p className="text-sm text-center px-4">
                            Aguardando a transmissão começar...
                          </p>
                        </>
                      ) : (
                        <>
                          <MonitorOff className="h-6 w-6" />
                          <p className="text-sm text-center px-4">
                            A transmissão foi encerrada ou não está disponível.
                          </p>
                        </>
                      )}
                    </div>
                  )}
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
                    className={`border-border ${isPresenter ? 'bg-primary/20 border-primary/50' : ''}`}
                    onClick={toggleScreenShare}
                    disabled={isTogglingShare || !socketReady || (isScreenShareActive && !isPresenter)}
                    title={
                      isScreenShareActive && !isPresenter
                        ? 'Outra pessoa já está compartilhando'
                        : undefined
                    }
                  >
                    {isPresenter ? <MonitorOff className="w-4 h-4" /> : <MonitorUp className="w-4 h-4" />}
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
