import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

// A persisted token can outlive an account deleted from the dashboard.
export async function validateSession(session: Session | null): Promise<Session | null> {
  if (!session) return null;
  const { data, error } = await supabase.auth.getUser(session.access_token);
  if (error && error.status !== 401 && error.status !== 403 && error.status !== 404) throw error;
  if (error || !data.user || data.user.id !== session.user.id) {
    await clearSessionIfCurrent(session.access_token);
    return null;
  }
  return { ...session, user: data.user };
}

export async function clearSessionIfCurrent(accessToken: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token === accessToken) await supabase.auth.signOut({ scope: 'local' });
}
