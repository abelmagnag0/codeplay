import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import type {
  RoomDetail,
  RoomPresenceState,
  RoomSummary,
  ScreenShareState,
} from '../types/api';
import { config } from '../config';

export type RoomWithState = RoomDetail;

const buildScreenShareFallback = (roomId: string): ScreenShareState => ({
  roomId,
  isActive: false,
  ownerUserId: null,
  viewers: [],
});

const buildPresenceFallback = (roomId: string): RoomPresenceState => ({
  roomId,
  participants: [],
});

const detachUserFromRooms = (
  rooms: RoomWithState[],
  userId: string | undefined,
  exceptRoomId?: string,
): RoomWithState[] => {
  if (!userId) {
    return rooms;
  }

  return rooms.map((room) => {
    if (room.id === exceptRoomId) {
      return room;
    }

    const nextParticipants = room.participants.filter((participantId) => participantId !== userId);
    const nextPresence = {
      ...room.presence,
      participants: room.presence.participants.filter((participant) => participant.userId !== userId),
    };

    return {
      ...room,
      participants: nextParticipants,
      presence: nextPresence,
    };
  });
};

export function useRooms() {
  const { accessToken, user } = useAuth();
  const [rooms, setRooms] = useState<RoomWithState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const normalizeRoom = useCallback(
    (room: RoomSummary & { screenShare?: ScreenShareState; presence?: RoomPresenceState }): RoomWithState => {
      const roomId = room.id;
      return {
        ...room,
        screenShare: room.screenShare ?? buildScreenShareFallback(roomId),
        presence: room.presence ?? buildPresenceFallback(roomId),
      };
    },
    [],
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!accessToken) {
        setRooms([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFetch<
          Array<RoomSummary & { screenShare?: ScreenShareState; presence?: RoomPresenceState }>
        >('/api/rooms', {
          authToken: accessToken,
        });

        if (active) {
          setRooms(response.map(normalizeRoom));
        }
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : 'Não foi possível carregar as salas';
          setError(message);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [accessToken, normalizeRoom]);

  useEffect(() => {
    if (!accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(config.socketUrl, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    const handleConnectError = (err: Error) => {
      setError(err.message || 'Não foi possível conectar ao servidor de salas');
    };

    socket.on('connect_error', handleConnectError);

    socket.on('room:presence:update', (state: RoomPresenceState) => {
      if (!state?.roomId) {
        return;
      }

      setRooms((prev) => {
        const exists = prev.some((room) => room.id === state.roomId);
        if (!exists) {
          return prev;
        }

        return prev.map((room) => {
          if (room.id !== state.roomId) {
            return room;
          }

          return {
            ...room,
            presence: state,
            participants: state.participants.map((participant) => participant.userId),
          };
        });
      });
    });

    socket.on('room:closed', (payload: { roomId: string }) => {
      if (!payload?.roomId) {
        return;
      }

      setRooms((prev) => prev.filter((room) => room.id !== payload.roomId));
    });

    socket.on('room:created', (room: RoomSummary & { screenShare?: ScreenShareState; presence?: RoomPresenceState }) => {
      if (!room?.id) {
        return;
      }

      const normalized = normalizeRoom(room);
      setRooms((prev) => {
        const filtered = prev.filter((entry) => entry.id !== normalized.id);
        return [...filtered, normalized];
      });
    });

    return () => {
      socket.off('connect_error', handleConnectError);
      socket.off('room:presence:update');
      socket.off('room:closed');
      socket.off('room:created');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, normalizeRoom]);

  const createRoom = useCallback(
    async (payload: { name: string; isPrivate?: boolean }) => {
      if (!accessToken) {
        throw new Error('Usuário não autenticado');
      }

      const response = await apiFetch<
        RoomSummary & { screenShare?: ScreenShareState; presence?: RoomPresenceState }
      >('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(payload),
        authToken: accessToken,
      });

      const normalized = normalizeRoom(response);
      setRooms((prev) => {
        const cleaned = detachUserFromRooms(prev, user?.id, normalized.id);
        const withoutDuplicate = cleaned.filter((room) => room.id !== normalized.id);
        return [...withoutDuplicate, normalized];
      });
      return normalized;
    },
    [accessToken, normalizeRoom, user?.id],
  );

  const joinRoom = useCallback(
    async (roomId: string) => {
      if (!accessToken) {
        throw new Error('Usuário não autenticado');
      }

      const response = await apiFetch<RoomDetail>(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        authToken: accessToken,
      });

      const normalized = normalizeRoom(response);

      setRooms((prev) => {
        const cleaned = detachUserFromRooms(prev, user?.id, normalized.id);
        let found = false;

        const next = cleaned.map((room) => {
          if (room.id === normalized.id) {
            found = true;
            return normalized;
          }
          return room;
        });

        if (!found) {
          next.push(normalized);
        }

        return next;
      });

      return response;
    },
    [accessToken, normalizeRoom, user?.id],
  );

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setRooms([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<
        Array<RoomSummary & { screenShare?: ScreenShareState; presence?: RoomPresenceState }>
      >('/api/rooms', {
        authToken: accessToken,
      });
      setRooms(response.map(normalizeRoom));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível carregar as salas';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, normalizeRoom]);

  return useMemo(
    () => ({
      rooms,
      isLoading,
      error,
      refresh,
      createRoom,
      joinRoom,
    }),
    [rooms, isLoading, error, refresh, createRoom, joinRoom],
  );
}
