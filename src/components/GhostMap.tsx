import MapView, { Marker } from 'react-native-maps';
import { GhostNote } from '@/lib/backend';
export function GhostMap({ notes }: { notes: GhostNote[] }) {
  return <MapView style={{ height: 360, width: '100%' }} initialRegion={{ latitude: notes[0]?.latitude ?? -20.01816, longitude: notes[0]?.longitude ?? 57.58015, latitudeDelta: 0.2, longitudeDelta: 0.2 }}>
    {notes.map(note => <Marker key={note.id} coordinate={{ latitude: note.latitude, longitude: note.longitude }} title="Anonymous ghost note" description={note.caption || 'A moment of exploration'} />)}
  </MapView>;
}
