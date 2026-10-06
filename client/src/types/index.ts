export interface UserAvailability {
  day: string;
  times: string[];
}

export interface ParticipationHistory {
  completedCount: number;
  earlyReleaseCount: number;
  lateReleaseCount: number;
  noShowCount: number;
  benchStepInCount: number;
  streak: number;
  summaryText: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  branch: string;
  year: string;
  roles: string[];
  interests: string[];
  availability: UserAvailability[];
  campusZone: string;
  verified: boolean;
  participationHistory: ParticipationHistory;
}

export interface PlanMember {
  userId: User | string;
  role: string;
  committedAt: string;
  reconfirmed: boolean;
  reconfirmedAt?: string;
}

export interface PlanBench {
  userId: User | string;
  role: string;
  joinedAt: string;
  offeredAt?: string;
  status: 'waiting' | 'offered' | 'accepted' | 'declined' | 'expired';
}

export interface PlanCheckIn {
  userId: User | string;
  checkedInAt: string;
}

export type PlanStatus =
  | 'OPEN'
  | 'MATCHING'
  | 'FILLING'
  | 'CONFIRMED'
  | 'AT_RISK'
  | 'RECOVERING'
  | 'HAPPENED'
  | 'REPEAT';

export type PlanHealthStatus = 'HIGH' | 'WATCH' | 'AT_RISK';

export interface Plan {
  _id: string;
  creatorId: User | string;
  activity: string;
  category: 'competitions' | 'sports' | 'clubs' | 'creative' | 'study';
  role: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  campusZone: string;
  requiredSpots: number;
  members: PlanMember[];
  bench: PlanBench[];
  status: PlanStatus;
  healthStatus: PlanHealthStatus;
  healthReason: string;
  reconfirmationDeadline: string;
  checkInCode: string;
  checkIns: PlanCheckIn[];
  completedAt?: string;
  repeatCrewCreated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MatchFactor {
  label: string;
  matched: boolean;
  detail: string;
}

export interface MatchCandidate {
  user: User;
  score: number;
  matchedFactors: MatchFactor[];
  summaryHeadline: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  planId?: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface PlanMessage {
  _id: string;
  planId: string;
  senderId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  isSystemAnnouncement?: boolean;
  createdAt: string;
}
