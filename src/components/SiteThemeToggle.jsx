import { useLocation } from 'react-router-dom';
import { useSiteTheme } from '../context/SiteThemeContext';
import './SiteThemeToggle.css';

function SiteThemeToggle() {
  const { isDark, toggleSiteTheme } = useSiteTheme();
  const location = useLocation();

  // On cache le bouton sur les pages admin (elles ont déjà leur propre toggle)
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <button
      className="site-theme-toggle"
      onClick={toggleSiteTheme}
      aria-label="Basculer le mode sombre/clair"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

export default SiteThemeToggle;