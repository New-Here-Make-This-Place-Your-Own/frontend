import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { validateSession } from '../lib/session';

type AuthContextValue = { session: Session | null; loading: boolean };
const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    let revision = 0;
    const validate = async (candidate: Session | null, request: number) => {
      try {
        const verified = await validateSession(candidate);
        if (mounted && revision === request) setSession(verified);
      } catch {
        // A failed validation never grants access to onboarding.
        if (mounted && revision === request) setSession(null);
      } finally {
        if (mounted && revision === request) setLoading(false);
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, candidate) => {
      const request = ++revision;
      if (!mounted) return;
      setLoading(Boolean(candidate));
      if (!candidate) { setSession(null); return; }
      // Leave the Supabase auth callback before making another auth request.
      setTimeout(() => { if (mounted && revision === request) void validate(candidate, request); }, 0);
    });
    const initialRevision = revision;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted && revision === initialRevision) void validate(data.session, initialRevision);
    }).catch(() => {
      if (mounted && revision === initialRevision) { setSession(null); setLoading(false); }
    });
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
