import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import api from '../api/axios';
import './Footer.css';
import logo from '../assets/logo.png';

function Footer() {
  const settings = useSettings();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.slice(0, 6)));
  }, []);

  const shopName = settings.shop_name || 'MBLifestyle';
  const email = settings.email || 'contact@mblifestyle.com';
  const whatsapp = settings.whatsapp_number || '';
  const instagram = settings.instagram_url || 'https://instagram.com';
  const address = settings.address || 'Casablanca, Maroc';
  const hours = settings.working_hours || 'Lun-Sam : 10h - 19h';

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-inner">

          {/* Logo & Description */}
          <div className="footer-brand">
          <Link to="/" className="footer-logo">
  <img src={logo} alt={shopName} className="footer-logo-img" />
  <span className="footer-logo-text">{shopName}</span>
</Link>
            <p className="footer-desc">
              Découvrez les dernières tendances mode. Style, qualité et élégance au meilleur prix.
            </p>
            <div className="footer-social">
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                  <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" strokeWidth="2" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Catégories dynamiques */}
          <div className="footer-column">
            <h3 className="footer-column-title">Catégories</h3>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/categorie/${cat.slug}`} className="footer-link">
                {cat.name}
              </Link>
            ))}
            <Link to="/categories" className="footer-link footer-link-more">
              Voir tout →
            </Link>
          </div>

          {/* Liens utiles */}
          <div className="footer-column">
            <h3 className="footer-column-title">Liens utiles</h3>
            <Link to="/" className="footer-link">Accueil</Link>
            <Link to="/nouveautes" className="footer-link">Nouveautés</Link>
            <Link to="/catalogue" className="footer-link">Nos produits</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
            <Link to="/cgv" className="footer-link">CGV</Link>
            <Link to="/politique-confidentialite" className="footer-link">Politique de confidentialité</Link>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <h3 className="footer-column-title">Contact</h3>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeWidth="2" />
                <circle cx="12" cy="10" r="3" strokeWidth="2" />
              </svg>
              {address}
            </div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2" />
                <polyline points="22,6 12,13 2,6" strokeWidth="2" />
              </svg>
              {email}
            </div>
            {whatsapp && (
              <div className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" strokeWidth="2" />
                </svg>
                +{whatsapp}
              </div>
            )}
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <polyline points="12 6 12 12 16 14" strokeWidth="2" />
              </svg>
              {hours}
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} {shopName}. Tous droits réservés.</p>
          <div className="footer-bottom-links">
            <Link to="/contact" className="footer-bottom-link">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;