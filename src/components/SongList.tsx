import { useContext, useEffect, useState } from 'react';
import { songs } from '../data/songs';
import type { Song } from '../types/Song';
import { ThemeContext } from '../context/ThemeContext';
import SongCard from './SongCard';
interface SongListProps { searchTerm: string; onSelectSong: (song: Song) => void; }
function fetchSongs(searchTerm: string): Promise<Song[]> { return new Promise((resolve) => setTimeout(() => { const query = searchTerm.trim().toLowerCase(); resolve(songs.filter((song) => [song.title, song.artist, song.genre].some((value) => value.toLowerCase().includes(query)))); }, 500)); }
export default function SongList({ searchTerm, onSelectSong }: SongListProps) {
  const [results, setResults] = useState<Song[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const context = useContext(ThemeContext); if (!context) throw new Error('SongList must be inside ThemeProvider');
  useEffect(() => {
    let ignore = false;
    // EFFECT: do not write useEffect(async () => ...). Put async work inside.
    async function loadSongs() { setLoading(true); setError(''); try { const found = await fetchSongs(searchTerm); if (!ignore) setResults(found); } catch { if (!ignore) setError('Could not load songs. Please try again.'); } finally { if (!ignore) setLoading(false); } }
    void loadSongs(); return () => { ignore = true; };
    // [] runs once; [searchTerm] runs when it changes; no array runs after every render.
  }, [searchTerm]);
  return <section className={`panel results-panel ${context.theme}-card`}><span className="concept-label">useEffect + Dependency</span><h2>Song results</h2>{loading ? <p className="status">Loading songs...</p> : error ? <p className="status error">{error}</p> : results.length === 0 ? <p className="status">No songs found.</p> : <div className="song-list">{results.map((song) => <SongCard key={song.id} song={song} onPlay={onSelectSong} />)}</div>}</section>;
}
