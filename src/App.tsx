import { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SongList from './components/SongList';
import NowPlaying from './components/NowPlaying';
import PlayTimer from './components/PlayTimer';
import SearchHistory from './components/SearchHistory';
import type { Song } from './types/Song';

export default function App() {
  // LIFTING STATE UP: App owns values needed by several child components.
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  function handleSearchSubmit() {
    const cleanTerm = searchTerm.trim();
    if (cleanTerm) setSearchHistory((previous) => [cleanTerm, ...previous]);
  }
  return <div className="app-shell"><Header /><main>
    <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} onSearchSubmit={handleSearchSubmit} />
    <SongList searchTerm={searchTerm} onSelectSong={setSelectedSong} />
    <div className="dashboard-grid"><NowPlaying song={selectedSong} /><PlayTimer /><SearchHistory history={searchHistory} onClear={() => setSearchHistory([])} /></div>
  </main></div>;
}
