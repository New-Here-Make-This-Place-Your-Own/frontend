import { supabase } from './supabase';
import { CompletionTarget } from './backend';

export async function uploadQuestPhoto(base64: string, target: CompletionTarget): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Please sign in again.');
  // ImagePicker returns JPEG base64; Supabase needs bytes on React Native.
  const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
  if (!bytes.byteLength) throw new Error('Unable to read this photo. Please select another.');
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error('Choose a photo smaller than 10 MB.');
  const path = `${session.user.id}/${target.kind}-${target.id}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('quest-photos').upload(path, bytes.buffer, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return path;
}
