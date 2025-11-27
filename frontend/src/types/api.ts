export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: 'user' | 'admin';
  xp: number;
  level: number;
  badges: string[];
  bio?: string | null;
  status?: 'active' | 'blocked';
  emailVerified: boolean;
}

export interface RoomSummary {
  id: string;
  name: string;
  isPrivate: boolean;
  ownerId: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScreenShareState {
  roomId: string;
  isActive: boolean;
  ownerUserId: string | null;
  viewers: string[];
}

export interface RoomDetail extends RoomSummary {
  screenShare: ScreenShareState;
  presence: RoomPresenceState;
}

export interface RoomPresenceParticipant {
  userId: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
  joinedAt: string;
}

export interface RoomPresenceState {
  roomId: string;
  participants: RoomPresenceParticipant[];
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string | null;
    level?: number;
    xp?: number;
    badges?: string[];
  };
}
