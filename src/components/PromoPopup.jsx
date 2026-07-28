import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './PromoPopup.css';

function PromoPopup() {
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/popup').then((res) => {
      if (res.data && res.data.is_active && res.data.products?.length > 0) {
        setPopup(res.data);
        setTimeout(() => setVisible(true), 1000);
      }
    });
  }, []);

  const handleClose = () => setVisible(false);

  const handleGoToProduct = () => {
    handleClose();
    navigate(`/produit/${popup.products[currentIndex].id}`);
  };

  if (!visible || !popup) return null;

  const product = popup.products[currentIndex];
  const imageUrl = product.images?.[0]
    ? `http://127.0.0.1:8000/storage/${product.images[0]}`
    : null;

  const discountedPrice = product.discount > 0
    ? (product.price - (product.price * product.discount / 100)).toFixed(2)
    : null;

  return (
    <div className="promo-popup-overlay" onClick={handleClose}>
      <div className="promo-popup" onClick={(e) => e.stopPropagation()}>
        <button className="promo-popup-close" onClick={handleClose}>✕</button>

        {popup.products.length > 1 && (
          <div className="promo-popup-nav">
            {popup.products.map((_, i) => (
              <button
                key={i}
                className={`promo-popup-dot ${currentIndex === i ? 'active' : ''}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        )}

        <div className="promo-popup-content">
          {imageUrl && (
            <div className="promo-popup-image">
              <img src={imageUrl} alt={product.name} />
              {product.discount > 0 && (
                <div className="promo-popup-badge">-{product.discount}%</div>
              )}
            </div>
          )}

          <div className="promo-popup-info">
            <p className="promo-popup-label">Offre spéciale</p>
            <h2 className="promo-popup-title">{popup.title}</h2>
            {popup.subtitle && (
              <p className="promo-popup-subtitle">{popup.subtitle}</p>
            )}

            <div className="promo-popup-product">
              {product.brand && <p className="promo-popup-brand">{product.brand}</p>}
              <p className="promo-popup-product-name">{product.name}</p>
              <div className="promo-popup-price">
                {discountedPrice ? (
                  <>
                    <span className="promo-popup-price-old">
                      {parseFloat(product.price).toFixed(2)} DH
                    </span>
                    <span className="promo-popup-price-new">{discountedPrice} DH</span>
                  </>
                ) : (
                  <span className="promo-popup-price-new">{product.price} DH</span>
                )}
              </div>
            </div>

            {popup.products.length > 1 && (
              <div className="promo-popup-arrows">
                <button
                  className="promo-popup-arrow"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                >
                  ‹
                </button>
                <span>{currentIndex + 1} / {popup.products.length}</span>
                <button
                  className="promo-popup-arrow"
                  onClick={() => setCurrentIndex((i) => Math.min(popup.products.length - 1, i + 1))}
                  disabled={currentIndex === popup.products.length - 1}
                >
                  ›
                </button>
              </div>
            )}

            <button className="promo-popup-btn" onClick={handleGoToProduct}>
              Voir le produit
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
                <polyline points="12 5 19 12 12 19" strokeWidth="2" />
              </svg>
            </button>

            <button className="promo-popup-skip" onClick={handleClose}>
              Non merci, continuer mes achats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromoPopup;