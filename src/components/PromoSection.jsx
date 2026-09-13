import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import './PromoSection.css';

function PromoSection() {
  const [popup, setPopup] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    api.get('/popup').then((res) => {
      if (res.data && res.data.is_active && res.data.products?.length > 0) {
        setPopup(res.data);
      }
    });
  }, []);

  if (!popup) return null;

  const product = popup.products[currentIndex];
  const imageUrl = product.images?.[0]
    ? `${storageUrl(product.images[0])}`
    : null;

  const discountedPrice = product.discount > 0
    ? (product.price - (product.price * product.discount / 100)).toFixed(2)
    : null;

  const handleAddToCart = () => {
    addToCart(product, product.sizes?.[0]?.size || '', 1, null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <section className="promo-section">
      <div className="promo-section-inner">

        {popup.products.length > 1 && (
          <div className="promo-section-tabs">
            {popup.products.map((p, i) => (
              <button
                key={p.id}
                className={`promo-section-tab ${currentIndex === i ? 'active' : ''}`}
                onClick={() => { setCurrentIndex(i); setAdded(false); }}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        <div className="promo-section-content">
          <div
            className="promo-section-image"
            onClick={() => navigate(`/produit/${product.id}`)}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} />
            ) : (
              <div className="promo-section-placeholder" />
            )}
            {product.discount > 0 && (
              <div className="promo-section-badge">-{product.discount}%</div>
            )}
          </div>

          <div className="promo-section-info">
            <span className="promo-section-label">Offre spéciale</span>
            <h2 className="promo-section-title">{popup.title}</h2>
            {popup.subtitle && (
              <p className="promo-section-subtitle">{popup.subtitle}</p>
            )}

            <div className="promo-section-divider"></div>

            {product.brand && (
              <p className="promo-section-brand">{product.brand}</p>
            )}
            <h3
              className="promo-section-product-name"
              onClick={() => navigate(`/produit/${product.id}`)}
            >
              {product.name}
            </h3>

            <div className="promo-section-price">
              {discountedPrice ? (
                <>
                  <span className="promo-section-price-old">
                    {parseFloat(product.price).toFixed(2)} DH
                  </span>
                  <span className="promo-section-price-new">
                    {discountedPrice} DH
                  </span>
                </>
              ) : (
                <span className="promo-section-price-new">
                  {product.price} DH
                </span>
              )}
            </div>

            <div className="promo-section-actions">
              <button
                className={`promo-section-btn-cart ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
              >
                {added ? (
                  'Ajouté au panier ✓'
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                      <circle cx="9" cy="21" r="1" strokeWidth="2" />
                      <circle cx="20" cy="21" r="1" strokeWidth="2" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeWidth="2" />
                    </svg>
                    Ajouter au panier
                  </>
                )}
              </button>

              <button
                className="promo-section-btn-detail"
                onClick={() => navigate(`/produit/${product.id}`)}
              >
                Voir le produit
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                  <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
                  <polyline points="12 5 19 12 12 19" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {popup.products.length > 1 && (
              <div className="promo-section-nav">
                <button
                  className="promo-section-arrow"
                  onClick={() => { setCurrentIndex((i) => Math.max(0, i - 1)); setAdded(false); }}
                  disabled={currentIndex === 0}
                >
                  ‹
                </button>
                <span>{currentIndex + 1} / {popup.products.length}</span>
                <button
                  className="promo-section-arrow"
                  onClick={() => { setCurrentIndex((i) => Math.min(popup.products.length - 1, i + 1)); setAdded(false); }}
                  disabled={currentIndex === popup.products.length - 1}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PromoSection;