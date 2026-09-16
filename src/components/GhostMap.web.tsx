import { GhostNote } from '@/lib/backend';
export function GhostMap({ notes }: { notes: GhostNote[] }) {
  const lat = notes[0]?.latitude ?? -20.01816, lon = notes[0]?.longitude ?? 57.58015;
  return <iframe title="Ghost note location" style={{ width: '100%', height: 360, border: 0 }} src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.05},${lat-0.05},${lon+0.05},${lat+0.05}&layer=mapnik&marker=${lat},${lon}`} />;
}
