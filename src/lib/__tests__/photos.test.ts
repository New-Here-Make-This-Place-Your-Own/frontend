import { jest, test, expect, beforeEach } from '@jest/globals';
import { supabase } from '../supabase';
import { uploadQuestPhoto } from '../photos';
jest.mock('../supabase', () => ({ supabase: { auth: { getSession: jest.fn() }, storage: { from: jest.fn() } } }));
const upload = jest.fn<(...args: unknown[]) => Promise<{ error: Error | null }>>();
const target = { id: 'assignment', kind: 'daily' as const, prompt: 'Explore' };
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: { user: { id: 'user-id' } } }, error: null } as never);
  jest.mocked(supabase.storage.from).mockReturnValue({ upload } as never);
  upload.mockResolvedValue({ error: null });
});
test('uploads bytes under the authenticated user and returns a storage path', async () => {
  const path = await uploadQuestPhoto('aGVsbG8=', target);
  expect(path).toMatch(/^user-id\/daily-assignment-\d+\.jpg$/);
  expect(supabase.storage.from).toHaveBeenCalledWith('quest-photos');
  expect(upload).toHaveBeenCalledWith(path, expect.any(ArrayBuffer), { contentType: 'image/jpeg', upsert: false });
});
test('does not upload without a session', async () => {
  jest.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
  await expect(uploadQuestPhoto('aGVsbG8=', target)).rejects.toThrow('sign in');
  expect(upload).not.toHaveBeenCalled();
});
test('propagates storage errors instead of returning a nonexistent photo path', async () => {
  upload.mockResolvedValue({ error: new Error('Upload failed') });
  await expect(uploadQuestPhoto('aGVsbG8=', target)).rejects.toThrow('Upload failed');
});
