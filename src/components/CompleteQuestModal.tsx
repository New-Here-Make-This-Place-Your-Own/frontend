import { useRef, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { uploadQuestPhoto } from '@/lib/photos';
import { completeQuest, CompletionTarget } from '@/lib/backend';
import { PrimaryButton } from './PrimaryButton';
import { colors, spacing } from '@/theme/tokens';

export function CompleteQuestModal({ target, onClose, onCompleted }: { target: CompletionTarget; onClose: () => void; onCompleted: () => void }) {
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState('');
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const uploadedPath = useRef<string | null>(null);
  const submitting = useRef(false);

  async function choosePhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], base64: true, quality: 0.8 });
      if (!result.canceled) { setPhoto(result.assets[0]); uploadedPath.current = null; setError(''); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to select a photo.'); }
  }
  async function locate() {
    setBusy(true); setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('Allow location access to drop your completion pin.');
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setPin({ latitude: coords.latitude, longitude: coords.longitude });
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to get your location.'); }
    finally { setBusy(false); }
  }
  async function submit() {
    if (!photo || !pin || submitting.current) return;
    submitting.current = true; setBusy(true); setError('');
    try {
      if (!uploadedPath.current) {
        if (!photo.base64) throw new Error('Unable to read this photo. Please select another.');
        uploadedPath.current = await uploadQuestPhoto(photo.base64, target);
      }
      await completeQuest(target.kind, target.id, { photo_path: uploadedPath.current, caption: caption.trim() || undefined, ...pin });
      onCompleted();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save your memory. Please retry.'); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <Modal visible animationType="slide" onRequestClose={() => { if (!busy) onClose(); }}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Save your discovery</Text>
      <Text>{target.prompt}</Text>
      {photo && <Image source={{ uri: photo.uri }} style={styles.photo} />}
      <PrimaryButton label={photo ? 'Change photo' : 'Choose photo'} onPress={choosePhoto} disabled={busy} />
      <PrimaryButton label={pin ? 'Update location pin' : 'Use my current location'} onPress={locate} disabled={busy} />
      {pin && <Text>Pin: {pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}</Text>}
      <TextInput accessibilityLabel="Caption" placeholder="Add a caption (optional)" value={caption} onChangeText={setCaption} editable={!busy} multiline style={styles.input} />
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      <PrimaryButton label="Save memory" onPress={submit} loading={busy} disabled={!photo || !pin || busy} />
      <PrimaryButton label="Cancel" onPress={onClose} disabled={busy} />
    </ScrollView>
  </Modal>;
}
const styles = StyleSheet.create({
  content: { padding: spacing.xxl, paddingTop: 60, gap: spacing.lg, backgroundColor: colors.background, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  photo: { width: '100%', height: 220, borderRadius: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, minHeight: 80 },
});
