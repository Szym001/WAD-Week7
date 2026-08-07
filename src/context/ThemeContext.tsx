import { createContext, useState, type ReactNode } from 'react';
export type Theme = 'light' | 'dark';
export interface ThemeContextValue { theme: Theme; toggleTheme: () => void; }
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
export function ThemeProvider({ children }: { children: ReactNode }) {
  // CONTEXT: Theme is shared without passing props through every component.
  const [theme, setTheme] = useState<Theme>('light');
  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light');
  return <ThemeContext.Provider value={{ theme, toggleTheme }}><div className={`theme ${theme}`}>{children}</div></ThemeContext.Provider>;
}
