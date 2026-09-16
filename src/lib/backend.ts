import { apiRequest } from './api';

export type QuestStatus = 'assigned' | 'completed';
export type DailyQuest = { id: string; prompt: string; category: string; status: QuestStatus; expires_at: string };
export type CuratorQuest = { id: string; riddle: string; status: QuestStatus; issued_at: string; expires_at: string };
export type CuratorResponse = { quest: CuratorQuest | null; reason: 'no_city' | 'city_not_ready' | 'no_eligible_places' | 'not_yet' | null; next_available_at: string | null };
export type PastQuest = { id: string; kind: 'daily' | 'curator'; prompt: string; status: QuestStatus; issued_at: string; expires_at: string };
export type Completion = { is_ghost?: boolean; photo_path: string; caption?: string; latitude: number; longitude: number };
export type Onboarding = { first_name: string; last_name: string; date_of_birth: string; latitude: number; longitude: number; place_name?: string; place_country?: string; interests: string[]; timezone: string };
export type City = { id: string; name: string; status: 'initializing' | 'ready' | 'failed' };
export type CompletionTarget = { id: string; kind: 'daily' | 'curator'; prompt: string };

export const getDailyQuests = () => apiRequest<{ quests: DailyQuest[]; quest_date: string }>('/api/v1/quests/daily', {}, 60000);
export const getCuratorQuest = () => apiRequest<CuratorResponse>('/api/v1/quests/curator', {}, 60000);
export const getCity = (id: string) => apiRequest<City>(`/api/v1/cities/${encodeURIComponent(id)}`);
export const getPastQuests = (offset = 0, limit = 50) => apiRequest<{ quests: PastQuest[] }>(`/api/v1/quests/past?limit=${limit}&offset=${offset}`);
export const completeQuest = (kind: CompletionTarget['kind'], id: string, body: Completion) => apiRequest<{ memory_id: string; status: 'completed'; distance_meters?: number }>(`/api/v1/quests/${kind}/${encodeURIComponent(id)}/complete`, { method: 'POST', body: JSON.stringify(body) });
export const submitOnboarding = (body: Onboarding) => apiRequest<{ city_id: string; city_name: string; city_status: City['status'] }>('/api/v1/users/onboarding', { method: 'POST', body: JSON.stringify(body) });
export function deviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export const retryCityDiscovery = (id: string) => apiRequest<City>(`/api/v1/cities/${encodeURIComponent(id)}/retry-discovery`, { method: 'POST' });

export type GhostNote = { id: string; caption: string | null; latitude: number; longitude: number; created_at: string };
export type Memory = GhostNote & { photo_path: string; is_ghost: boolean };
export const getMemories = (offset = 0) => apiRequest<{ memories: Memory[] }>(`/api/v1/memories?offset=${offset}`);
export const getGhostNotes = (offset = 0) => apiRequest<{ notes: GhostNote[] }>(`/api/v1/ghost-notes?offset=${offset}`);
