import type { Song } from '../types/Song';
interface NowPlayingProps { song: Song | null; }
export default function NowPlaying({ song }: NowPlayingProps) { return <section className="panel mini-panel"><span className="concept-label">Conditional Rendering</span><h2>Now Playing</h2>{song ? <div className="now-playing"><div className="record">♪</div><div><h3>{song.title}</h3><p>{song.artist}</p><small>{song.album} · {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</small></div></div> : <p className="status">No song selected</p>}</section>; }
