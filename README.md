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

1. Type `Oasis` and check the results.
2. Search `Rock`, then play a song.
3. Start and stop the timer.
4. Toggle dark mode.
5. Inspect search history.

Ask: Which components use state and effects? Why is `searchTerm` a dependency? Why is the timer handle a ref? Why is theme not passed through props? What causes `SongList` to re-render?

## 9. Student task 1: missing dependency

In `SongList.tsx`, replace `[searchTerm]` with `// TODO: Which dependency belongs here?`. Restore `}, [searchTerm]);`. Search Rock and then Pop. Without the dependency, the effect will not respond correctly to the new query.

## 10. Student task 2: genre filter

Create `const [genre, setGenre] = useState('All')` and a select containing All, Rock, Pop, Jazz, Electronic, and Hip-Hop. Pass genre to `SongList`, filter with it, and use `[searchTerm, genre]`. If an effect uses a changing value that should trigger new results, it normally belongs in its dependencies.

## 11. Student task 3: Reset

Start with only Start and Stop, then add Reset:

```tsx
function resetTimer() {
  if (timerRef.current !== null) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
  setSeconds(0);
}
```

Why is `seconds` state? Why is `timerRef` a ref?

## 12. Student task 4: favourites

In App add `const [favourites, setFavourites] = useState<Song[]>([])`. Pass a callback to `SongCard`, add an **Add to Favourites** button, prevent duplicate IDs, and display the count. This practises lifting state, callback props, and array state.

## 13. Student task 5: extend context

Add `accentColour` (`blue`, `purple`, or `green`) to `ThemeContext`, a selector in Header, and use it for `SongCard` borders. Context can share more than one value.

## 14. Advanced task: Recently Played

Create `RecentlyPlayed.tsx`. When a song is selected, add it newest-first and keep at most five. Use **state**, not a ref, because the list is displayed and must re-render when it changes.

## 15. Debugging task

1. Broken: `const [count, setCount] = useState(0); count++;` Fix: `setCount(count + 1)` inside an event.
2. Improve `useEffect(async () => { ... }, [])` by declaring an inner async function.
3. Why is `const timer = 0` unsuitable? A local variable is recreated on every render.
4. Replace theme passed through four component levels with a context Provider and `useContext`.

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

### Concise answers

1. Props come from a parent; state belongs to a component. 2. State/context updates or a parent render can render a component. 3. Run after mounting. 4. Run after mounting and when `searchTerm` changes. 5. For persistent, non-visual values. 6. No. 7. Sharing values across a tree. 8. Passing props through layers only to reach deeper children. 9. It lets React identify list items. 10. State becomes the single source of truth, making validation and other UI updates straightforward.
