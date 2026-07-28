import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import api from '../api/axios';
import './OutfitBuilder.css';

const zoneCategories = {
  casquette: ['Casquettes'],
  haut: ['T-shirts', 'Chemises', 'Pulls', 'Polos'],
  bas: ['Pantalons', 'Shorts'],
};

const zoneLabels = {
  casquette: 'Casquette',
  haut: 'Haut',
  bas: 'Bas',
};

function OutfitBuilder() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeZone, setActiveZone] = useState(null);

  const [selection, setSelection] = useState({
    casquette: null,
    haut: null,
    bas: null,
  });

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getProductsForZone = (zone) => {
    const categories = zoneCategories[zone];
    return products.filter((p) => categories.includes(p.category));
  };

  const selectProduct = (zone, product) => {
    setSelection((prev) => ({
      ...prev,
      [zone]: {
        product,
        color: product.colors?.[0]?.hex || null,
        size: product.sizes?.[0]?.size || null,
      },
    }));
    setActiveZone(null);
  };

  const updateZoneOption = (zone, key, value) => {
    setSelection((prev) => ({
      ...prev,
      [zone]: { ...prev[zone], [key]: value },
    }));
  };

  const removeZone = (zone) => {
    setSelection((prev) => ({ ...prev, [zone]: null }));
  };

  const getZoneImage = (zone) => {
    const sel = selection[zone];
    if (!sel) return null;
    const colorData = sel.product.colors?.find((c) => c.hex === sel.color);
    if (colorData?.image) return `https://mblifestyle-backend-production.up.railway.app/storage/${colorData.image}`;
    if (sel.product.images?.[0]) return `https://mblifestyle-backend-production.up.railway.app/storage/${sel.product.images[0]}`;
    return null;
  };

  const hasAnySelection = Object.values(selection).some((s) => s !== null);

  const handleAddOutfitToCart = () => {
    Object.values(selection).forEach((sel) => {
      if (sel) {
        addToCart(sel.product, sel.size, 1, sel.color);
      }
    });
    navigate('/panier');
  };

  return (
    <div className="outfit-page">
      <Header searchTerm="" onSearchChange={() => {}} />

      <div className="outfit-hero">
        <h1>Compose ton look</h1>
        <p>Choisis une casquette, un haut et un bas pour créer ta tenue idéale</p>
      </div>

      <div className="outfit-builder">
        <div className="outfit-mannequin-wrapper">
          <svg viewBox="0 0 200 420" className="outfit-mannequin">
  <defs>
    <clipPath id="clipHead">
      <circle cx="100" cy="35" r="28" />
    </clipPath>
    <clipPath id="clipTorso">
      <path d="M60 72 Q100 60 140 72 L150 200 Q100 215 50 200 Z" />
    </clipPath>
    <clipPath id="clipLegs">
      <path d="M55 200 L48 400 Q70 408 95 400 L100 250 L105 400 Q130 408 152 400 L145 200 Z" />
    </clipPath>
  </defs>

  {/* Tête */}
  <circle cx="100" cy="35" r="28" fill="#e8e4dc" />
  {/* Cou */}
  <rect x="92" y="58" width="16" height="14" fill="#e8e4dc" />

  {/* Casquette (zone) */}
  {getZoneImage('casquette') && (
    <image
      href={getZoneImage('casquette')}
      x="62"
      y="-5"
      width="76"
      height="76"
      clipPath="url(#clipHead)"
      preserveAspectRatio="xMidYMid slice"
    />
  )}

  {/* Torse (zone Haut) */}
  <path
    d="M60 72 Q100 60 140 72 L150 200 Q100 215 50 200 Z"
    fill="#f0ede6"
  />
  {getZoneImage('haut') && (
    <image
      href={getZoneImage('haut')}
      x="50"
      y="60"
      width="100"
      height="155"
      clipPath="url(#clipTorso)"
      preserveAspectRatio="xMidYMid slice"
    />
  )}

  {/* Jambes (zone Bas) */}
  <path
    d="M55 200 L48 400 Q70 408 95 400 L100 250 L105 400 Q130 408 152 400 L145 200 Z"
    fill="#f0ede6"
  />
  {getZoneImage('bas') && (
    <image
      href={getZoneImage('bas')}
      x="45"
      y="195"
      width="110"
      height="215"
      clipPath="url(#clipLegs)"
      preserveAspectRatio="xMidYMid slice"
    />
  )}
</svg>

          <div className="outfit-zone-buttons">
            <button
              className={`outfit-zone-btn zone-casquette ${selection.casquette ? 'filled' : ''}`}
              onClick={() => setActiveZone('casquette')}
            >
              {selection.casquette ? '✓' : '+'} Casquette
            </button>
            <button
              className={`outfit-zone-btn zone-haut ${selection.haut ? 'filled' : ''}`}
              onClick={() => setActiveZone('haut')}
            >
              {selection.haut ? '✓' : '+'} Haut
            </button>
            <button
              className={`outfit-zone-btn zone-bas ${selection.bas ? 'filled' : ''}`}
              onClick={() => setActiveZone('bas')}
            >
              {selection.bas ? '✓' : '+'} Bas
            </button>
          </div>
        </div>

        <div className="outfit-summary">
          <h2>Ta tenue</h2>

          {!hasAnySelection && (
            <p className="outfit-empty">
              Clique sur les boutons à côté du mannequin pour choisir tes pièces.
            </p>
          )}

          {Object.entries(selection).map(([zone, sel]) => {
            if (!sel) return null;
            return (
              <div className="outfit-summary-item" key={zone}>
                <div className="outfit-summary-info">
                  <span className="outfit-summary-zone">{zoneLabels[zone]}</span>
                  <p className="outfit-summary-name">{sel.product.name}</p>
                  <p className="outfit-summary-price">{sel.product.price} DH</p>

                  {sel.product.colors && sel.product.colors.length > 0 && (
                    <div className="outfit-summary-colors">
                      {sel.product.colors.map((c) => (
                        <button
                          key={c.hex}
                          className={`outfit-color-dot ${sel.color === c.hex ? 'selected' : ''}`}
                          style={{ backgroundColor: c.hex }}
                          onClick={() => updateZoneOption(zone, 'color', c.hex)}
                        ></button>
                      ))}
                    </div>
                  )}

                  {sel.product.sizes && sel.product.sizes.length > 0 && (
                    <select
                      value={sel.size || ''}
                      onChange={(e) => updateZoneOption(zone, 'size', e.target.value)}
                      className="outfit-size-select"
                    >
                      {sel.product.sizes.map((s) => (
                        <option key={s.size} value={s.size}>
                          {s.size}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button className="outfit-remove-btn" onClick={() => removeZone(zone)}>
                  ✕
                </button>
              </div>
            );
          })}

          {hasAnySelection && (
            <button className="btn-add-outfit" onClick={handleAddOutfitToCart}>
              Ajouter toute la tenue au panier
            </button>
          )}
        </div>
      </div>

      {activeZone && (
        <div className="outfit-modal-overlay" onClick={() => setActiveZone(null)}>
          <div className="outfit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="outfit-modal-header">
              <h3>Choisir : {zoneLabels[activeZone]}</h3>
              <button onClick={() => setActiveZone(null)}>✕</button>
            </div>

            <div className="outfit-modal-grid">
              {loading && <p>Chargement...</p>}

              {!loading && getProductsForZone(activeZone).length === 0 && (
                <p className="outfit-empty">Aucun produit disponible dans cette catégorie.</p>
              )}

              {getProductsForZone(activeZone).map((product) => {
                const imgUrl = product.images?.[0]
                  ? `https://mblifestyle-backend-production.up.railway.app/storage/${product.images[0]}`
                  : 'https://via.placeholder.com/200x250/f5f5f5/999999?text=Image';

                return (
                  <button
                    key={product.id}
                    className="outfit-modal-product"
                    onClick={() => selectProduct(activeZone, product)}
                  >
                    <img src={imgUrl} alt={product.name} />
                    <span>{product.name}</span>
                    <span className="outfit-modal-product-price">{product.price} DH</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default OutfitBuilder;