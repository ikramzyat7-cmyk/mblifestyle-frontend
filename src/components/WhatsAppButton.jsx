import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import './WhatsAppButton.css';

const defaultMessage = 'Bonjour, je souhaite passer une commande 👋';

function WhatsAppButton() {
  const settings = useSettings();
  const whatsappNumber = settings.whatsapp_number || '212786972636';
  const shopName = settings.shop_name || 'MBLifestyle';
  const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  const [showPopup, setShowPopup] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => setShowPopup(true), 30000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  const handleDismiss = () => {
    setShowPopup(false);
    setDismissed(true);
  };

  return (
    <>
      {/* Popup automatique après 30s */}
      {showPopup && !open && (
        <div className="wa-popup">
          <button className="wa-popup-close" onClick={handleDismiss}>✕</button>
          <div className="wa-popup-header">
            <div className="wa-popup-avatar">
              <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                <path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.93 8.93 0 0 0-7.74 13.4L3 21l3.71-1.27A8.93 8.93 0 0 0 12.05 21a8.89 8.89 0 0 0 8.92-8.91 8.85 8.85 0 0 0-3.37-5.77zm-5.55 13.7a7.4 7.4 0 0 1-3.77-1.03l-.27-.16-2.79.95.94-2.72-.18-.28a7.4 7.4 0 0 1 6.07-11.4 7.32 7.32 0 0 1 7.36 7.37 7.4 7.4 0 0 1-7.36 7.27zm4.04-5.52c-.22-.11-1.3-.64-1.5-.71-.2-.08-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.14-.26.16-.48.05-.22-.11-1.36-.5-1.95-1.93-.16-.27.15-.27.43-.9.05-.11.02-.21-.03-.3-.05-.08-.46-1.1-.63-1.5-.16-.4-.33-.34-.46-.35h-.4c-.13 0-.35.05-.53.27-.18.22-.7.69-.7 1.67 0 .98.7 1.93.8 2.06.1.14 1.39 2.13 3.4 2.9 1.66.65 2 .55 2.36.5.37-.06 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.1-.2-.16-.42-.27z" />
              </svg>
            </div>
            <div className="wa-popup-info">
              <p className="wa-popup-name">{shopName}</p>
              <span className="wa-popup-status">● En ligne</span>
            </div>
          </div>
          <div className="wa-popup-body">
            <div className="wa-popup-message">
              👋 Bonjour ! Besoin d'aide pour choisir votre tenue ? Je suis disponible !
            </div>
          </div>
          <a href={link} target="_blank" rel="noopener noreferrer" className="wa-popup-btn" onClick={handleDismiss}>
            Démarrer la conversation →
          </a>
        </div>
      )}

      {/* Popup manuelle au clic */}
      {open && (
        <div className="wa-popup">
          <button className="wa-popup-close" onClick={() => setOpen(false)}>✕</button>
          <div className="wa-popup-header">
            <div className="wa-popup-avatar">
              <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                <path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.93 8.93 0 0 0-7.74 13.4L3 21l3.71-1.27A8.93 8.93 0 0 0 12.05 21a8.89 8.89 0 0 0 8.92-8.91 8.85 8.85 0 0 0-3.37-5.77zm-5.55 13.7a7.4 7.4 0 0 1-3.77-1.03l-.27-.16-2.79.95.94-2.72-.18-.28a7.4 7.4 0 0 1 6.07-11.4 7.32 7.32 0 0 1 7.36 7.37 7.4 7.4 0 0 1-7.36 7.27zm4.04-5.52c-.22-.11-1.3-.64-1.5-.71-.2-.08-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.14-.26.16-.48.05-.22-.11-1.36-.5-1.95-1.93-.16-.27.15-.27.43-.9.05-.11.02-.21-.03-.3-.05-.08-.46-1.1-.63-1.5-.16-.4-.33-.34-.46-.35h-.4c-.13 0-.35.05-.53.27-.18.22-.7.69-.7 1.67 0 .98.7 1.93.8 2.06.1.14 1.39 2.13 3.4 2.9 1.66.65 2 .55 2.36.5.37-.06 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.1-.2-.16-.42-.27z" />
              </svg>
            </div>
            <div className="wa-popup-info">
              <p className="wa-popup-name">{shopName}</p>
              <span className="wa-popup-status">● En ligne</span>
            </div>
          </div>
          <div className="wa-popup-body">
            <div className="wa-popup-message">
              👋 Bonjour ! Besoin d'aide pour choisir votre tenue ? Je suis disponible !
            </div>
          </div>
          <a href={link} target="_blank" rel="noopener noreferrer" className="wa-popup-btn" onClick={() => setOpen(false)}>
            Démarrer la conversation →
          </a>
        </div>
      )}

      {/* Bouton principal */}
      <button
        className="whatsapp-button"
        onClick={() => { setOpen((p) => !p); setShowPopup(false); }}
        aria-label="Commander via WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
          <path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.93 8.93 0 0 0-7.74 13.4L3 21l3.71-1.27A8.93 8.93 0 0 0 12.05 21a8.89 8.89 0 0 0 8.92-8.91 8.85 8.85 0 0 0-3.37-5.77zm-5.55 13.7a7.4 7.4 0 0 1-3.77-1.03l-.27-.16-2.79.95.94-2.72-.18-.28a7.4 7.4 0 0 1 6.07-11.4 7.32 7.32 0 0 1 7.36 7.37 7.4 7.4 0 0 1-7.36 7.27zm4.04-5.52c-.22-.11-1.3-.64-1.5-.71-.2-.08-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.14-.26.16-.48.05-.22-.11-1.36-.5-1.95-1.93-.16-.27.15-.27.43-.9.05-.11.02-.21-.03-.3-.05-.08-.46-1.1-.63-1.5-.16-.4-.33-.34-.46-.35h-.4c-.13 0-.35.05-.53.27-.18.22-.7.69-.7 1.67 0 .98.7 1.93.8 2.06.1.14 1.39 2.13 3.4 2.9 1.66.65 2 .55 2.36.5.37-.06 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.1-.2-.16-.42-.27z" />
        </svg>
        <span className="wa-btn-text">Besoin d'aide ?</span>
      </button>
    </>
  );
}

export default WhatsAppButton;