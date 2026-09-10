import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { supabase } from '../lib/supabase';

type AuthContextValue = { session: Session | null; loading: boolean };
const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    let authChanged = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      authChanged = true;
      if (mounted) { setSession(session); setLoading(false); }
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted && !authChanged) setSession(data.session);
    }).catch(() => {
      if (mounted && !authChanged) setSession(null);
    }).finally(() => { if (mounted) setLoading(false); });
    const refresh = (state: string) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    };
    if (Platform.OS !== 'web') refresh(AppState.currentState);
    const appState = Platform.OS !== 'web' ? AppState.addEventListener('change', refresh) : undefined;
    return () => {
      mounted = false;
      subscription.unsubscribe();
      appState?.remove();
      if (Platform.OS !== 'web') supabase.auth.stopAutoRefresh();
    };
  }, []);
  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
