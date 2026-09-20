import { supabase } from './supabase';
import { validateSession } from './session';
export async function apiRequest<T>(path: string, init: RequestInit = {}, timeoutMs = 20000): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!base) throw new Error('The server address is missing. Configure EXPO_PUBLIC_API_BASE_URL.');
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('Your session has expired. Please sign in again.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}${path}`, {
      ...init, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...init.headers, Authorization: `Bearer ${session.access_token}` },
    }).catch((err: unknown) => {
      if (controller.signal.aborted) throw new Error('The request timed out. Please try again.');
      if (err instanceof Error && err.name === 'AbortError') throw err;
      throw new Error('Cannot connect to the server. Check your connection and try again.');
    });
    const body = await response.json().catch(() => null);
    if (response.status === 401) {
      const verified = await validateSession(session);
      if (!verified) throw new Error('Your session is no longer valid. Please sign in again.');
      throw new Error('The server could not verify your sign-in. Please retry.');
    }
    if (!response.ok) {
      const detail = body?.detail;
      throw new Error(typeof detail === 'string' ? detail : Array.isArray(detail)
        ? detail.map((item: { msg?: string }) => item.msg ?? 'Invalid input').join('. ')
        : 'Unable to reach the server. Please try again.');
    }
    return body as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw new Error('The request timed out. Please try again.');
    throw err;
  } finally { clearTimeout(timer); }
}
