import type { Song } from '../types/Song';
interface SongCardProps { song: Song; onPlay: (song: Song) => void; }
const duration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
export default function SongCard({ song, onPlay }: SongCardProps) {
  return <article className="song-card"><div className={`album-block colour-${song.id % 5}`} aria-hidden="true">♫</div><div className="song-info"><h3>{song.title}</h3><p className="artist">{song.artist}</p><p>{song.album} · {song.year}</p><div className="song-meta"><span>{song.genre}</span><span>★ {song.rating}</span><span>{duration(song.duration)}</span></div></div>
    {/* Parent passes a function down; child calls it to change parent state. */}<button onClick={() => onPlay(song)}>Play Song</button></article>;
}
