import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../hooks/useSettings';
import api from '../api/axios';
import logo from '../assets/logo.png';
import './Header.css';
import CategoryMenu from './CategoryMenu';


function Header({ searchTerm, onSearchChange, forceWhite }) {
  const [openMenu, setOpenMenu] = useState(false);
  const { totalItems } = useCart();
  const settings = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const shopName = settings.shop_name || 'MBLIFESTYLE';
  const isActive = (path) => location.pathname === path;

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!isHomePage || forceWhite) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, forceWhite]);

  return (
    <>
      <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="header-main-inner">

          {/* ===== LOGO — tout à gauche ===== */}
          <Link to="/" className="logo">
            <img src={logo} alt={shopName} className="logo-img" />
            <span className="logo-text">{shopName}</span>
          </Link>

          {/* ===== NAV — centre ===== */}
          <nav className="nav-categories">
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>Accueil</Link>
            <Link to="/nouveautes" className={`nav-item ${isActive('/nouveautes') ? 'active' : ''}`}>Nouveautés</Link>
            <div
  className="nav-item-dropdown"
  onMouseEnter={() => setOpenMenu(true)}
  onMouseLeave={() => setOpenMenu(false)}
>
  <Link to="/categories" className={`nav-item ${isActive('/categories') ? 'active' : ''}`}>
    Catégories
  </Link>
  {openMenu && <CategoryMenu />}
</div>
            <Link to="/catalogue" className={`nav-item ${isActive('/catalogue') ? 'active' : ''}`}>Nos produits</Link>
            <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
          </nav>

          {/* ===== DROITE — recherche + panier + instagram ===== */}
          <div className="header-right">

            {/* Recherche — icône + input qui glisse */}
            <div className={`search-box ${searchOpen ? 'search-box-open' : ''}`}>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    navigate(`/recherche?q=${encodeURIComponent(searchTerm.trim())}`);
                    setSearchOpen(false);
                  }
                  if (e.key === 'Escape') setSearchOpen(false);
                }}
                className="search-input"
              />
              <button
                className="icon-btn search-icon-btn"
                onClick={() => {
                  if (searchOpen && searchTerm.trim()) {
                    navigate(`/recherche?q=${encodeURIComponent(searchTerm.trim())}`);
                    setSearchOpen(false);
                  } else {
                    setSearchOpen((p) => !p);
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22">
                  <circle cx="11" cy="11" r="7" strokeWidth="2" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Panier */}
            <Link to="/panier" className="cart-icon">
              <div className="header-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22">
                  <circle cx="9" cy="21" r="1" strokeWidth="2" />
                  <circle cx="20" cy="21" r="1" strokeWidth="2" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeWidth="2" />
                </svg>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </div>
            </Link>

            {/* Instagram */}
            <a
              href={settings.instagram_url || 'https://instagram.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22">
                <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>

          </div>

          {/* Mobile burger */}
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
              <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="mobile-menu-logo-text">{shopName}</span>
              <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
            </div>
            <nav className="mobile-menu-links">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
              <Link to="/nouveautes" onClick={() => setMobileMenuOpen(false)}>Nouveautés</Link>
              <Link to="/categories" onClick={() => setMobileMenuOpen(false)}>Catégories</Link>
              <Link to="/catalogue" onClick={() => setMobileMenuOpen(false)}>Nos produits</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </nav>
            <div className="mobile-menu-footer">© {new Date().getFullYear()} {shopName}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;