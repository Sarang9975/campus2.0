import { Plan, User, NotificationItem, MatchCandidate, PlanMessage } from '../types/index.js';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('campus_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('campus_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('campus_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.statusText}`);
  }

  return data;
}

export const api = {
  // Auth
  async login(email: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setAuthToken(res.token);
    return res;
  },

  async switchUser(email: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/auth/switch', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  // Users
  async getAllUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/users');
  },

  async getUserProfile(id: string): Promise<{ user: User; privateHistory: any }> {
    return request<{ user: User; privateHistory: any }>(`/users/${id}`);
  },

  // Plans
  async getPlans(params: Record<string, string> = {}): Promise<{ plans: Plan[] }> {
    const query = new URLSearchParams(params).toString();
    return request<{ plans: Plan[] }>(`/plans${query ? `?${query}` : ''}`);
  },

  async getPlanById(id: string): Promise<{ plan: Plan; healthAssessment: any }> {
    return request<{ plan: Plan; healthAssessment: any }>(`/plans/${id}`);
  },

  async createPlan(planData: Partial<Plan>): Promise<{ plan: Plan }> {
    return request<{ plan: Plan }>('/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },

  async commitSpot(planId: string, role?: string): Promise<{ plan: Plan }> {
    return request<{ plan: Plan }>(`/plans/${planId}/commit`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  async joinBench(planId: string, role?: string): Promise<{ plan: Plan; message: string }> {
    return request<{ plan: Plan; message: string }>(`/plans/${planId}/bench`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  async releaseSpot(planId: string): Promise<{ plan: Plan; message: string }> {
    return request<{ plan: Plan; message: string }>(`/plans/${planId}/release`, {
      method: 'POST',
    });
  },

  async reconfirmSpot(planId: string): Promise<{ plan: Plan; message: string }> {
    return request<{ plan: Plan; message: string }>(`/plans/${planId}/reconfirm`, {
      method: 'POST',
    });
  },

  // Self-Healing
  async getRecoveryStatus(planId: string): Promise<any> {
    return request<any>(`/plans/${planId}/recovery`);
  },

  async offerBackupSlot(planId: string, candidateUserId?: string): Promise<any> {
    return request<any>(`/plans/${planId}/recovery/offer`, {
      method: 'POST',
      body: JSON.stringify({ candidateUserId }),
    });
  },

  async acceptBackupSlot(planId: string, candidateUserId: string): Promise<{ plan: Plan; message: string }> {
    return request<{ plan: Plan; message: string }>(`/plans/${planId}/recovery/accept`, {
      method: 'POST',
      body: JSON.stringify({ candidateUserId }),
    });
  },

  // Real world completion & check-in
  async checkIn(planId: string, code: string): Promise<{ plan: Plan; message: string }> {
    return request<{ plan: Plan; message: string }>(`/plans/${planId}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async createRepeatCrew(planId: string): Promise<{ repeatPlan: Plan; message: string }> {
    return request<{ repeatPlan: Plan; message: string }>(`/plans/${planId}/repeat`, {
      method: 'POST',
    });
  },

  // Matching
  async getMatches(planId: string): Promise<{ matches: MatchCandidate[] }> {
    return request<{ matches: MatchCandidate[] }>(`/matches?planId=${planId}`);
  },

  // Plan Messages
  async getMessages(planId: string): Promise<{ messages: PlanMessage[] }> {
    return request<{ messages: PlanMessage[] }>(`/plans/${planId}/messages`);
  },

  async sendMessage(planId: string, text: string): Promise<{ message: PlanMessage }> {
    return request<{ message: PlanMessage }>(`/plans/${planId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Notifications
  async getNotifications(userId?: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    return request<{ notifications: NotificationItem[]; unreadCount: number }>(
      `/notifications${userId ? `?userId=${userId}` : ''}`
    );
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  // Demo Actions
  async resetDemo(): Promise<any> {
    return request<any>('/demo/reset', { method: 'POST' });
  },

  async triggerDemoRelease(): Promise<any> {
    return request<any>('/demo/trigger-release', { method: 'POST' });
  },
};
