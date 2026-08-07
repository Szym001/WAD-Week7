import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
export default function Header() {
  // CONTEXT: Header reads shared state directly—no prop drilling.
  const context = useContext(ThemeContext);
  if (!context) throw new Error('Header must be inside ThemeProvider');
  return <header className="site-header"><div><span className="eyebrow">Week 7 · useContext</span><h1>QHO540 Music Discovery</h1><p>Find a new soundtrack for your day.</p></div><button className="theme-button" onClick={context.toggleTheme}>Switch to {context.theme === 'light' ? 'Dark' : 'Light'} Mode</button></header>;
}
