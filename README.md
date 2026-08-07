# QHO540 Web Application Development

## Week 7 Seminar: React Hooks in Practice

## 1. Previous week recap

React builds interfaces from reusable **components**. JSX describes their UI. An Amazon `ProductCard` might receive `title`, `price`, and `rating` as typed **props**; a TypeScript **interface** defines that contract. **State** stores changing component data, such as a basket quantity, and `useState` updates it. **Events** such as clicks and typing call functions. A **controlled input**, like a search bar, gets its value from state. **Conditional rendering** chooses which UI to show. `map()` turns an array into elements—for example, many Spotify song cards—and each needs a stable `key`.

## 2. Week 7 core theory

### `useEffect`

**What?** Runs side-effect code after React renders. **Why?** To synchronise with something outside rendering, such as an API, timer, document title, or subscription.

```tsx
useEffect(() => { document.title = searchTerm; }, [searchTerm]);
```

A real search page fetches whenever its query changes. Do not use an effect for a value you can calculate during rendering, or for a click action that belongs in its event handler.

### `useRef`

**What?** A persistent container whose `.current` value can change without causing a render. **Why?** Store a timer handle, DOM element, Leaflet map instance, or previous value.

```tsx
const timerRef = useRef<number | null>(null);
```

Do not use a ref for visible data: visible data belongs in state.

### `useContext`

**What?** Reads a value shared by a Provider. **Why?** Avoid passing the same prop through unrelated layers.

```tsx
const theme = useContext(ThemeContext);
```

Real uses include theme, logged-in user, language, currency, and permissions. Do not put every local value in context; props and local state remain clearer for nearby data.

## 3. `useEffect` dependencies

```tsx
useEffect(() => { });              // after every render
useEffect(() => { }, []);          // once after initial render
useEffect(() => { }, [searchTerm]); // whenever searchTerm changes
```

```text
Search changes
      ↓
useEffect runs
      ↓
data fetched
      ↓
state updated
      ↓
React re-renders
```

The effect callback should not normally be `async`, because React expects either nothing or a cleanup function. Put the async function inside:

```tsx
useEffect(() => {
  async function loadData() { /* await data here */ }
  void loadData();
}, []);
```

## 4. `useRef`: state compared with ref

`timerRef.current` reads or replaces the stored value.

| Hook | Does changing it render? | Use when |
|---|---|---|
| `useState` | Yes | The value affects the UI |
| `useRef` | No | A value must survive renders but does not control UI |

Examples of refs: timer handles, DOM elements, Leaflet map instances, and previous values.

## 5. `useContext` and prop drilling

Without context, a theme may be passed through components that do not use it: `App → Dashboard → SongList → SongCard`. This is **prop drilling**.

```text
ThemeProvider
├── Header
├── SongList
│   └── SongCard
└── NowPlaying
```

`createContext` creates the channel, the `Provider` supplies a value, and `useContext` reads it. Any descendant can read the shared value.

## 6. Project architecture

```text
App
├── Header          theme switch
├── SearchBar       controlled input and callbacks
├── SongList        async effect, loading, filtering
│   └── SongCard    song props and Play callback
├── NowPlaying      conditional rendering
├── PlayTimer       state, ref, and cleanup
└── SearchHistory   array state and map
```

`App` lifts up search, selected-song, and history state so its children can communicate.

## 7. Run the project

```bash
npm install
npm run dev
```

Use `npm run build` to type-check and create a production build.

## 8. Explore the finished app

### What to do

No code changes are needed. Start the app with `npm run dev`, open the local URL shown in the terminal, and then:

1. Type `Oasis`. Notice that results change while you type.
2. Click **Search**. The term is added to Search History.
3. Replace the text with `Rock`, then click **Play Song** on a result.
4. Start, stop, and reset the timer.
5. Switch to dark mode and back to light mode.
6. Clear the search history.

### Solution / Answer

You should observe the following:

| Action | Expected result | React concept |
|---|---|---|
| Type in search | Matching cards appear after “Loading songs...” | Controlled input, state, `useEffect` |
| Click Search | A new history item appears | Event handling, lifted array state |
| Click Play Song | Now Playing displays that song | Callback prop, parent-child communication |
| Start timer | The displayed number increases | `useState` |
| Stop/reset timer | The interval stops or returns to `00:00` | `useRef`, event handling |
| Switch theme | Several parts of the page change together | `useContext` |

Answers to the exploration questions:

- `App`, `SongList`, `PlayTimer`, and `ThemeProvider` use `useState`.
- `SongList` uses an effect for loading songs. `PlayTimer` uses an effect for cleanup.
- `searchTerm` is a dependency because changing it must run the search effect again.
- The timer handle is a ref because it must survive renders but is not displayed.
- Theme is read from context to avoid passing it through every component as a prop.
- `SongList` renders when its props, state, or consumed context change. In this app, typing changes its `searchTerm` prop; loading and results update its state; toggling the theme updates its context.

Why it works: React re-renders components after state or context updates. Props carry data down, while callback props allow children to request an update in their parent.

## 9. Student task 1: missing dependency

> The coding tasks below are independent exercises based on the original finished project. If you complete more than one, restore the original project first or carefully combine the changes with your tutor. A later full-file solution may otherwise replace an earlier task's changes.

### What to do

Open `src/components/SongList.tsx`. Find the final line of the `useEffect`:

```tsx
}, [searchTerm]);
```

Temporarily replace it with `}, []);`, save, and search first for `Rock` and then `Pop`. Then restore the correct dependency.

### Solution / Answer

Replace this:

```tsx
}, []);
```

with this:

```tsx
}, [searchTerm]);
```

Paste it at the end of the `useEffect`, immediately before the component's `return` statement.

Complete effect:

```tsx
useEffect(() => {
  let ignore = false;

  async function loadSongs() {
    setLoading(true);
    setError('');

    try {
      const found = await fetchSongs(searchTerm);
      if (!ignore) setResults(found);
    } catch {
      if (!ignore) setError('Could not load songs. Please try again.');
    } finally {
      if (!ignore) setLoading(false);
    }
  }

  void loadSongs();

  return () => {
    ignore = true;
  };
}, [searchTerm]);
```

After saving, searching `Rock` and then `Pop` should load the correct results each time.

Why it works: React compares dependencies after each render. When `searchTerm` changes, React runs the effect again and fetches using the new text. With `[]`, the effect only runs after the first render and keeps the initial search results.

Common mistakes:

- Writing `["searchTerm"]`: this is a fixed string, not the variable.
- Omitting the array: the effect then runs after every render and can repeatedly update state.
- Writing `useEffect(async () => ...)`: put the async function inside the effect instead.

## 10. Student task 2: genre filter

### What to do

Add a controlled genre selector. The genre state belongs in `App` because `App` displays the selector and passes the selected value to `SongList`.

You will replace two complete files:

1. `src/App.tsx`
2. `src/components/SongList.tsx`

### Solution / Answer

Open `src/App.tsx`, select all its contents, and replace them with:

```tsx
import { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SongList from './components/SongList';
import NowPlaying from './components/NowPlaying';
import PlayTimer from './components/PlayTimer';
import SearchHistory from './components/SearchHistory';
import type { Song } from './types/Song';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [genre, setGenre] = useState('All');

  function handleSearchSubmit() {
    const cleanTerm = searchTerm.trim();
    if (cleanTerm) {
      setSearchHistory((previous) => [cleanTerm, ...previous]);
    }
  }

  return (
    <div className="app-shell">
      <Header />
      <main>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
        />

        <section className="panel">
          <label htmlFor="genre">Filter by genre: </label>
          <select
            id="genre"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          >
            <option>All</option>
            <option>Rock</option>
            <option>Pop</option>
            <option>Jazz</option>
            <option>Electronic</option>
            <option>Hip-Hop</option>
          </select>
        </section>

        <SongList
          searchTerm={searchTerm}
          genre={genre}
          onSelectSong={setSelectedSong}
        />

        <div className="dashboard-grid">
          <NowPlaying song={selectedSong} />
          <PlayTimer />
          <SearchHistory
            history={searchHistory}
            onClear={() => setSearchHistory([])}
          />
        </div>
      </main>
    </div>
  );
}
```

Next, open `src/components/SongList.tsx`, select all its contents, and replace them with:

```tsx
import { useContext, useEffect, useState } from 'react';
import { songs } from '../data/songs';
import type { Song } from '../types/Song';
import { ThemeContext } from '../context/ThemeContext';
import SongCard from './SongCard';

interface SongListProps {
  searchTerm: string;
  genre: string;
  onSelectSong: (song: Song) => void;
}

function fetchSongs(searchTerm: string, genre: string): Promise<Song[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const query = searchTerm.trim().toLowerCase();

      const filteredSongs = songs.filter((song) => {
        const matchesSearch = [song.title, song.artist, song.genre].some(
          (value) => value.toLowerCase().includes(query),
        );
        const matchesGenre = genre === 'All' || song.genre === genre;

        return matchesSearch && matchesGenre;
      });

      resolve(filteredSongs);
    }, 500);
  });
}

export default function SongList({
  searchTerm,
  genre,
  onSelectSong,
}: SongListProps) {
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('SongList must be inside ThemeProvider');
  }

  useEffect(() => {
    let ignore = false;

    async function loadSongs() {
      setLoading(true);
      setError('');

      try {
        const found = await fetchSongs(searchTerm, genre);
        if (!ignore) setResults(found);
      } catch {
        if (!ignore) setError('Could not load songs. Please try again.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadSongs();
    return () => {
      ignore = true;
    };
  }, [searchTerm, genre]);

  return (
    <section className={`panel results-panel ${context.theme}-card`}>
      <span className="concept-label">useEffect + Dependency</span>
      <h2>Song results</h2>

      {loading ? (
        <p className="status">Loading songs...</p>
      ) : error ? (
        <p className="status error">{error}</p>
      ) : results.length === 0 ? (
        <p className="status">No songs found.</p>
      ) : (
        <div className="song-list">
          {results.map((song) => (
            <SongCard key={song.id} song={song} onPlay={onSelectSong} />
          ))}
        </div>
      )}
    </section>
  );
}
```

After saving, leave the search empty and choose a genre. Only songs from that genre should appear. Search text and genre should also work together.

Why it works: both controls store their current values in state. `SongList` receives both as props. Because the effect uses both values to fetch results, both appear in `[searchTerm, genre]`.

Common mistakes:

- Adding `genre` to `App` but not to `SongListProps`.
- Filtering with OR (`matchesSearch || matchesGenre`) instead of AND.
- Forgetting `genre` in the dependency array, which makes the selector appear unresponsive.
- Using `selected` on an `<option>` instead of controlling the `<select>` with `value`.

## 11. Student task 3: Reset

### What to do

Open `src/components/PlayTimer.tsx`. Add a Reset function that both stops the interval and returns the displayed time to zero. Then connect it to a button.

### Solution / Answer

Replace the complete contents of `src/components/PlayTimer.tsx` with:

```tsx
import { useEffect, useRef, useState } from 'react';

export default function PlayTimer() {
  // State affects the UI, so changing it causes a re-render.
  const [seconds, setSeconds] = useState(0);

  // The interval handle must survive renders but is not displayed.
  const timerRef = useRef<number | null>(null);

  function startTimer() {
    // Prevent a second interval when Start is clicked repeatedly.
    if (timerRef.current === null) {
      timerRef.current = window.setInterval(() => {
        setSeconds((previous) => previous + 1);
      }, 1000);
    }
  }

  function stopTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetTimer() {
    stopTimer();
    setSeconds(0);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <section className="panel mini-panel">
      <span className="concept-label">useRef + useState</span>
      <h2>Play Timer</h2>
      <div className="timer">
        {String(Math.floor(seconds / 60)).padStart(2, '0')}:
        {String(seconds % 60).padStart(2, '0')}
      </div>
      <div className="button-row">
        <button onClick={startTimer}>Start</button>
        <button className="secondary" onClick={stopTimer}>Stop</button>
        <button className="secondary" onClick={resetTimer}>Reset</button>
      </div>
    </section>
  );
}
```

After saving, start the timer, wait several seconds, and click Reset. It should stop and display `00:00`. Clicking Start repeatedly should not make it count faster.

Why it works: `seconds` is state because it controls visible text. `timerRef` stores the interval ID across renders without causing another render. Reset first clears the interval and then updates the visible state.

Common mistakes:

- Only calling `setSeconds(0)`: the old interval continues running.
- Forgetting to set `timerRef.current = null`: Start can no longer create a new interval.
- Calling `setInterval` without checking the ref: multiple timers run together.

## 12. Student task 4: favourites

### What to do

Store favourites in `App`, pass a callback through `SongList`, and call it from `SongCard`. This task changes three files:

1. Replace `src/App.tsx`.
2. Replace `src/components/SongList.tsx`.
3. Replace `src/components/SongCard.tsx`.

### Solution / Answer

Replace all of `src/App.tsx` with:

```tsx
import { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SongList from './components/SongList';
import NowPlaying from './components/NowPlaying';
import PlayTimer from './components/PlayTimer';
import SearchHistory from './components/SearchHistory';
import type { Song } from './types/Song';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<Song[]>([]);

  function handleSearchSubmit() {
    const cleanTerm = searchTerm.trim();
    if (cleanTerm) setSearchHistory((previous) => [cleanTerm, ...previous]);
  }

  function addFavourite(song: Song) {
    setFavourites((previous) => {
      const alreadyAdded = previous.some((favourite) => favourite.id === song.id);
      return alreadyAdded ? previous : [...previous, song];
    });
  }

  return (
    <div className="app-shell">
      <Header />
      <main>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
        />
        <section className="panel">
          <strong>Favourite songs: {favourites.length}</strong>
        </section>
        <SongList
          searchTerm={searchTerm}
          onSelectSong={setSelectedSong}
          onAddFavourite={addFavourite}
        />
        <div className="dashboard-grid">
          <NowPlaying song={selectedSong} />
          <PlayTimer />
          <SearchHistory
            history={searchHistory}
            onClear={() => setSearchHistory([])}
          />
        </div>
      </main>
    </div>
  );
}
```

Replace all of `src/components/SongList.tsx` with:

```tsx
import { useContext, useEffect, useState } from 'react';
import { songs } from '../data/songs';
import type { Song } from '../types/Song';
import { ThemeContext } from '../context/ThemeContext';
import SongCard from './SongCard';

interface SongListProps {
  searchTerm: string;
  onSelectSong: (song: Song) => void;
  onAddFavourite: (song: Song) => void;
}

function fetchSongs(searchTerm: string): Promise<Song[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const query = searchTerm.trim().toLowerCase();
      resolve(
        songs.filter((song) =>
          [song.title, song.artist, song.genre].some((value) =>
            value.toLowerCase().includes(query),
          ),
        ),
      );
    }, 500);
  });
}

export default function SongList({
  searchTerm,
  onSelectSong,
  onAddFavourite,
}: SongListProps) {
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const context = useContext(ThemeContext);

  if (!context) throw new Error('SongList must be inside ThemeProvider');

  useEffect(() => {
    let ignore = false;

    async function loadSongs() {
      setLoading(true);
      setError('');
      try {
        const found = await fetchSongs(searchTerm);
        if (!ignore) setResults(found);
      } catch {
        if (!ignore) setError('Could not load songs. Please try again.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadSongs();
    return () => {
      ignore = true;
    };
  }, [searchTerm]);

  return (
    <section className={`panel results-panel ${context.theme}-card`}>
      <span className="concept-label">useEffect + Dependency</span>
      <h2>Song results</h2>
      {loading ? (
        <p className="status">Loading songs...</p>
      ) : error ? (
        <p className="status error">{error}</p>
      ) : results.length === 0 ? (
        <p className="status">No songs found.</p>
      ) : (
        <div className="song-list">
          {results.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onPlay={onSelectSong}
              onAddFavourite={onAddFavourite}
            />
          ))}
        </div>
      )}
    </section>
  );
}
```

Replace all of `src/components/SongCard.tsx` with:

```tsx
import type { Song } from '../types/Song';

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  onAddFavourite: (song: Song) => void;
}

const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function SongCard({
  song,
  onPlay,
  onAddFavourite,
}: SongCardProps) {
  return (
    <article className="song-card">
      <div className={`album-block colour-${song.id % 5}`} aria-hidden="true">
        ♫
      </div>
      <div className="song-info">
        <h3>{song.title}</h3>
        <p className="artist">{song.artist}</p>
        <p>{song.album} · {song.year}</p>
        <div className="song-meta">
          <span>{song.genre}</span>
          <span>★ {song.rating}</span>
          <span>{duration(song.duration)}</span>
        </div>
      </div>
      <div className="button-row">
        <button onClick={() => onPlay(song)}>Play Song</button>
        <button className="secondary" onClick={() => onAddFavourite(song)}>
          Add to Favourites
        </button>
      </div>
    </article>
  );
}
```

After saving, each song has an Add to Favourites button. The count increases for a new song but not when the same song is added twice.

Why it works: `App` owns the shared array. Its callback travels `App → SongList → SongCard`. `SongCard` sends the chosen song upward by calling it. The functional state update receives the latest array, while `some()` prevents duplicate IDs.

Common mistakes:

- Mutating state with `previous.push(song)`. Return a new array instead.
- Checking object equality with `favourite === song`; comparing IDs is clearer and safer.
- Updating the `SongCard` props but forgetting the `SongList` props in the middle.

## 13. Student task 5: extend context

### What to do

Extend the existing theme context with a shared accent colour. Replace three component/context files, then append three CSS rules.

### Solution / Answer

Replace all of `src/context/ThemeContext.tsx` with:

```tsx
import { createContext, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type AccentColour = 'blue' | 'purple' | 'green';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  accentColour: AccentColour;
  setAccentColour: (colour: AccentColour) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [accentColour, setAccentColour] = useState<AccentColour>('purple');

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, accentColour, setAccentColour }}
    >
      <div className={`theme ${theme}`}>{children}</div>
    </ThemeContext.Provider>
  );
}
```

Replace all of `src/components/Header.tsx` with:

```tsx
import { useContext, type ChangeEvent } from 'react';
import {
  ThemeContext,
  type AccentColour,
} from '../context/ThemeContext';

export default function Header() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('Header must be inside ThemeProvider');
  }

  function handleAccentChange(event: ChangeEvent<HTMLSelectElement>) {
    context!.setAccentColour(event.target.value as AccentColour);
  }

  return (
    <header className="site-header">
      <div>
        <span className="eyebrow">Week 7 · useContext</span>
        <h1>QHO540 Music Discovery</h1>
        <p>Find a new soundtrack for your day.</p>
      </div>
      <div className="button-row">
        <select
          aria-label="Accent colour"
          value={context.accentColour}
          onChange={handleAccentChange}
        >
          <option value="blue">Blue</option>
          <option value="purple">Purple</option>
          <option value="green">Green</option>
        </select>
        <button className="theme-button" onClick={context.toggleTheme}>
          Switch to {context.theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
    </header>
  );
}
```

Replace all of `src/components/SongCard.tsx` with:

```tsx
import { useContext } from 'react';
import type { Song } from '../types/Song';
import { ThemeContext } from '../context/ThemeContext';

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
}

const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function SongCard({ song, onPlay }: SongCardProps) {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('SongCard must be inside ThemeProvider');
  }

  return (
    <article className={`song-card accent-${context.accentColour}`}>
      <div className={`album-block colour-${song.id % 5}`} aria-hidden="true">
        ♫
      </div>
      <div className="song-info">
        <h3>{song.title}</h3>
        <p className="artist">{song.artist}</p>
        <p>{song.album} · {song.year}</p>
        <div className="song-meta">
          <span>{song.genre}</span>
          <span>★ {song.rating}</span>
          <span>{duration(song.duration)}</span>
        </div>
      </div>
      <button onClick={() => onPlay(song)}>Play Song</button>
    </article>
  );
}
```

Finally, open `src/index.css` and paste these rules at the very bottom:

```css
.song-card.accent-blue { border-color: #3388ff; }
.song-card.accent-purple { border-color: #9b59d0; }
.song-card.accent-green { border-color: #2eaa72; }
```

After saving, changing the Header selector should immediately change every song-card border.

Why it works: `ThemeProvider` owns both global values. Header updates `accentColour`; every `SongCard` reads the same context and chooses a CSS class. No accent prop is passed through `App` or `SongList`.

Common mistakes:

- Forgetting to add the new values to the Provider's `value` object.
- Calling `useContext` outside a component.
- Forgetting the Provider in `main.tsx`—this project already has it.
- Using an unrestricted `string` where the `AccentColour` union type is expected.

## 14. Advanced task: Recently Played

### What to do

Create a component that displays the five most recently selected songs. Then change `App` so one handler updates both Now Playing and Recently Played.

### Solution / Answer

Create a new file at `src/components/RecentlyPlayed.tsx` and paste this complete component:

```tsx
import type { Song } from '../types/Song';

interface RecentlyPlayedProps {
  songs: Song[];
}

export default function RecentlyPlayed({ songs }: RecentlyPlayedProps) {
  return (
    <section className="panel">
      <span className="concept-label">Array State + map()</span>
      <h2>Recently Played</h2>
      {songs.length === 0 ? (
        <p className="status">Nothing played yet</p>
      ) : (
        <ol>
          {songs.map((song) => (
            <li key={song.id}>
              <strong>{song.title}</strong> — {song.artist}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
```

Then open `src/App.tsx`, select all its contents, and replace them with:

```tsx
import { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SongList from './components/SongList';
import NowPlaying from './components/NowPlaying';
import PlayTimer from './components/PlayTimer';
import SearchHistory from './components/SearchHistory';
import RecentlyPlayed from './components/RecentlyPlayed';
import type { Song } from './types/Song';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);

  function handleSearchSubmit() {
    const cleanTerm = searchTerm.trim();
    if (cleanTerm) setSearchHistory((previous) => [cleanTerm, ...previous]);
  }

  function handleSelectSong(song: Song) {
    setSelectedSong(song);
    setRecentlyPlayed((previous) => {
      const withoutSelectedSong = previous.filter((item) => item.id !== song.id);
      return [song, ...withoutSelectedSong].slice(0, 5);
    });
  }

  return (
    <div className="app-shell">
      <Header />
      <main>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
        />
        <SongList searchTerm={searchTerm} onSelectSong={handleSelectSong} />
        <RecentlyPlayed songs={recentlyPlayed} />
        <div className="dashboard-grid">
          <NowPlaying song={selectedSong} />
          <PlayTimer />
          <SearchHistory
            history={searchHistory}
            onClear={() => setSearchHistory([])}
          />
        </div>
      </main>
    </div>
  );
}
```

After saving, play several different songs. The newest appears first, duplicates move to the top, and only five remain visible.

Why it works: the list uses state because it appears in the UI. `filter` removes an earlier copy, `[song, ...withoutSelectedSong]` puts the selected song first, and `slice(0, 5)` limits the array.

Common mistakes:

- Using a ref for the list: changing a ref would not update the displayed list.
- Using `push`, which mutates the existing state array and adds at the end.
- Using the array index as the key when each song already has a stable ID.

## 15. Debugging task

### What to do

Each snippet below contains a common React mistake. Identify the issue before reading the answer. These are standalone exercises; do not paste them into the music app unless your tutor asks you to create a scratch component.

### Solution / Answer

#### 1. Updating state directly

Broken:

```tsx
const [count, setCount] = useState(0);
count++;
```

Complete working component:

```tsx
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((previous) => previous + 1)}>
      Count: {count}
    </button>
  );
}
```

Why: state is read-only. The setter schedules a React update. The functional form safely uses the latest value.

#### 2. An async effect callback

Broken:

```tsx
useEffect(async () => {
  const response = await fetch('/api/songs');
}, []);
```

Create `src/components/DebugSongs.tsx` and paste this complete working example:

```tsx
import { useEffect, useState } from 'react';

interface ApiSong {
  id: number;
  title: string;
}

export default function DebugSongs() {
  const [songs, setSongs] = useState<ApiSong[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadSongs() {
      try {
        const response = await fetch('/api/songs');
        if (!response.ok) throw new Error('Request failed');
        const data: ApiSong[] = await response.json();
        if (!ignore) setSongs(data);
      } catch {
        if (!ignore) setError('Could not load songs');
      }
    }

    void loadSongs();

    return () => {
      ignore = true;
    };
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <ul>
      {songs.map((song) => <li key={song.id}>{song.title}</li>)}
    </ul>
  );
}
```

To display the scratch component, temporarily import it into `src/App.tsx` and render `<DebugSongs />`. The music project itself simulates its API locally, so `/api/songs` will show the error message unless you replace that URL with a real endpoint. The important observation is that the component compiles and the effect callback itself is not async. Why: an effect callback must return nothing or a cleanup function, not a Promise.

#### 3. A timer local variable

Broken:

```tsx
const timer = 0;
```

Create `src/components/DebugTimer.tsx` and paste this complete component:

```tsx
import { useEffect, useRef, useState } from 'react';

export default function DebugTimer() {
  const [ticks, setTicks] = useState(0);
  const timerRef = useRef<number | null>(null);

  function startTimer() {
    if (timerRef.current === null) {
      timerRef.current = window.setInterval(() => {
        setTicks((previous) => previous + 1);
      }, 1000);
    }
  }

  function stopTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => stopTimer, []);

  return (
    <div>
      <p>Ticks: {ticks}</p>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}
```

Temporarily import and render `<DebugTimer />` in `src/App.tsx`. The count should start and stop normally, even though each state update renders again. Why: a local variable is recreated on every render, while a ref preserves its value.

#### 4. Theme prop drilling

The complete context solution is already used by the project:

```tsx
// ThemeContext.tsx
import { createContext, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const toggleTheme = () =>
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

Wrap the app in `src/main.tsx`:

```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

Read it in any descendant component:

```tsx
const context = useContext(ThemeContext);
if (!context) throw new Error('Component must be inside ThemeProvider');
```

Why: the Provider makes one shared value available to every descendant, so intermediate components do not need unused theme props.

Common debugging mistakes include mutating state, forgetting required hook imports, ignoring effect dependencies, and using a context outside its Provider.

## 16. Concept check

1. What differs between props and state?
2. What triggers a render?
3. What does `[]` mean in an effect?
4. What does `[searchTerm]` mean?
5. When is a ref better than state?
6. Does changing `.current` render?
7. What problem does context solve?
8. What is prop drilling?
9. Why does `map` need a key?
10. Why are controlled inputs useful?

### Solution / Answer

1. **Props and state:** props are inputs supplied by a parent. State belongs to a component and changes through its setter.
2. **What triggers a render?** A state update, a consumed context update, or the parent rendering can cause a component to render.
3. **`[]` in an effect:** run the effect after the component first mounts. Its cleanup still runs when the component unmounts.
4. **`[searchTerm]`:** run after mounting and again whenever the `searchTerm` value changes.
5. **Ref instead of state:** use a ref for a value that must survive renders but does not control visible UI, such as an interval ID.
6. **Does `.current` trigger a render?** No.
7. **Context's purpose:** it shares a value with descendants without manually passing it through every component level.
8. **Prop drilling:** passing a prop through intermediate components only so a deeper component can use it.
9. **Why a key?** React uses it to match each rendered item with the same item after an array changes. Prefer a stable database or object ID.
10. **Controlled inputs:** React state is the single source of truth, making validation, clearing, filtering, and submitting predictable.

To observe these answers in the project, inspect `src/App.tsx`, `src/components/SongList.tsx`, `src/components/PlayTimer.tsx`, and `src/context/ThemeContext.tsx` while the app is running.
