import type { FormEvent } from 'react';
interface SearchBarProps { searchTerm: string; onSearchChange: (value: string) => void; onSearchSubmit: () => void; }
export default function SearchBar({ searchTerm, onSearchChange, onSearchSubmit }: SearchBarProps) {
  function submit(event: FormEvent) { event.preventDefault(); onSearchSubmit(); }
  return <section className="panel search-panel"><span className="concept-label">Controlled Input + State</span><h2>Discover songs</h2><form onSubmit={submit}>
    {/* Its value comes from parent state; changes call the parent callback. */}
    <input value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="Try Oasis, Rock or Jazz..." aria-label="Search songs" /><button type="submit">Search</button>
  </form></section>;
}
