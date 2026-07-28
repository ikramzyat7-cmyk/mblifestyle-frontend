import { useState, useEffect } from 'react';
import './CookieBanner.css';

function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookies_accepted');
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookies_accepted', 'true');
    setVisible(false);
  };

  const handleRefuse = () => {
    localStorage.setItem('cookies_accepted', 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <span className="cookie-icon">🍪</span>
        <p>
          Ce site utilise des cookies pour améliorer votre expérience et sauvegarder votre panier.
          En continuant à naviguer, vous acceptez notre{' '}
          <a href="/politique-confidentialite">politique de confidentialité</a>.
        </p>
      </div>
      <div className="cookie-banner-btns">
        <button className="cookie-btn-refuse" onClick={handleRefuse}>Refuser</button>
        <button className="cookie-btn-accept" onClick={handleAccept}>Accepter</button>
      </div>
    </div>
  );
}

export default CookieBanner;