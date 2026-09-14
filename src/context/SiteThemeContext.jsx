import { createContext, useContext, useState, useEffect } from 'react';

const SiteThemeContext = createContext();

export function SiteThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('site_theme') === 'dark';
  });

  useEffect(() => {
    document.body.classList.toggle('site-dark', isDark);
    localStorage.setItem('site_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleSiteTheme = () => setIsDark((prev) => !prev);

  return (
    <SiteThemeContext.Provider value={{ isDark, toggleSiteTheme }}>
      {children}
    </SiteThemeContext.Provider>
  );
}

export const useSiteTheme = () => useContext(SiteThemeContext);