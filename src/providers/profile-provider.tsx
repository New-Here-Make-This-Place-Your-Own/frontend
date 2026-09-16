import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/profile';
import { useAuth } from './auth-provider';

type ProfileState = { userId: string | null; profile: Profile | null; error: string };
async function readProfile(userId: string | null): Promise<ProfileState> {
  if (!userId) return { userId, profile: null, error: '' };
  try {
    const { data, error } = await supabase.from('user_profiles')
      .select('first_name,last_name,date_of_birth,city_id,interests,timezone').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return { userId, profile: data, error: '' };
  } catch {
    return { userId, profile: null, error: 'Unable to load your profile. Check your connection and try again.' };
  }
}
const ProfileContext = createContext<{ profile: Profile | null; loading: boolean; error: string; reload: () => Promise<void> }>({ profile: null, loading: true, error: '', reload: async () => {} });
export function ProfileProvider({ children }: PropsWithChildren) {
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user.id ?? null;
  const [state, setState] = useState<ProfileState | null>(null);
  const revision = useRef(0);
  const reload = useCallback(async () => {
    const request = ++revision.current;
    const next = await readProfile(userId);
    if (revision.current === request) setState(next);
  }, [userId]);
  useEffect(() => {
    let active = true;
    const request = ++revision.current;
    void readProfile(userId).then(next => {
      if (active && revision.current === request) setState(next);
    });
    return () => { active = false; };
  }, [userId]);
  const current = state?.userId === userId ? state : null;
  return <ProfileContext.Provider value={{ profile: current?.profile ?? null, loading: authLoading || !current, error: current?.error ?? '', reload }}>{children}</ProfileContext.Provider>;
}
export function useProfile() { return useContext(ProfileContext); }
