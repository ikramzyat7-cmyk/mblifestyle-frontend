import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import './ProductDetail.css';

const colorNames = {
  '#111111': 'Noir', '#f5f5f5': 'Blanc', '#cc0000': 'Rouge',
  '#1e3a8a': 'Bleu', '#0a1f5c': 'Marine', '#2e7d32': 'Vert',
  '#d8c3a5': 'Beige', '#888888': 'Gris', '#e91e8c': 'Rose',
  '#c19a6b': 'Camel', '#6d1a2a': 'Bordeaux', '#5c5c2e': 'Kaki',
};

function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="pd-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          className={`pd-star ${star <= (hover || value) ? 'active' : ''}`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >★</button>
      ))}
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [stockWarning, setStockWarning] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [countdown, setCountdown] = useState({ h: 23, m: 45, s: 12 });
  const [viewers, setViewers] = useState(Math.floor(Math.random() * 15) + 5);
  const [openAccordion, setOpenAccordion] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '', product: '', image: null });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data);
      setReviewForm((prev) => ({ ...prev, product: res.data.name }));
      api.get('/products').then((allRes) => {
        const similar = allRes.data
          .filter((p) => p.id !== res.data.id && p.category === res.data.category)
          .slice(0, 4);
        setSimilarProducts(similar);
      });
    }).finally(() => setLoading(false));

    api.get('/reviews').then((res) => {
      setReviews(Array.isArray(res.data) ? res.data : []);
    }).catch(() => setReviews([]));

    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!product?.discount) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return { h: 23, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [product]);

  useEffect(() => {
    const timer = setInterval(() => {
      setViewers((prev) => Math.max(3, Math.min(30, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!product) return;
    const history = JSON.parse(sessionStorage.getItem('recentProducts') || '[]');
    const filtered = history.filter((p) => p.id !== product.id);
    const updated = [{ id: product.id, name: product.name, price: product.price, discount: product.discount, images: product.images, category: product.category }, ...filtered].slice(0, 6);
    sessionStorage.setItem('recentProducts', JSON.stringify(updated));
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const history = JSON.parse(sessionStorage.getItem('recentProducts') || '[]');
    setRecentProducts(history.filter((p) => p.id !== product?.id));
  }, [product]);

  if (loading) return (
    <div className="pd-loading-page">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className="pd-loading">Chargement...</div>
      <Footer />
    </div>
  );

  if (!product) return (
    <div>
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className="pd-not-found">Produit introuvable</div>
      <Footer />
    </div>
  );

  const images = product.images || [];
  const hasColors = product.colors && product.colors.length > 0;
  const selectedColorData = product.colors?.find((c) => c.hex === selectedColor);
  const availableSizes = selectedColorData?.sizes || [];
  const hasSizes = availableSizes.length > 0;
  const specs = product.specs ? Object.entries(product.specs).filter(([, v]) => v) : [];

  const generalImages = images.map((img) => `http://127.0.0.1:8000/storage/${img}`);
  const colorSpecificImages = selectedColorData?.images?.length > 0
    ? selectedColorData.images.map((img) => `http://127.0.0.1:8000/storage/${img}`)
    : [];
  const colorImages = selectedColorData && colorSpecificImages.length > 0
    ? colorSpecificImages
    : generalImages;

  const discountedPrice = product.discount > 0
    ? (product.price - product.price * product.discount / 100).toFixed(2)
    : null;

  const getStockForSize = (size) => {
    const s = availableSizes.find((s) => s.size === size);
    return s ? s.stock : 0;
  };

  const handleColorSelect = (hex) => {
    setSelectedColor(hex);
    setSelectedSize(null);
    setSelectedImage(0);
  };

  const handleAddToCart = () => {
    if (hasColors && !selectedColor) {
      setStockWarning('⚠️ Veuillez choisir une couleur');
      setTimeout(() => setStockWarning(''), 3000);
      return;
    }
    if (hasSizes && !selectedSize) {
      setStockWarning('⚠️ Veuillez choisir une taille');
      setTimeout(() => setStockWarning(''), 3000);
      return;
    }
    const stock = selectedSize ? getStockForSize(selectedSize) : selectedColorData?.stock || product.stock;
    if (quantity > stock) {
      setStockWarning(`Stock insuffisant — ${stock} disponible(s)`);
      setTimeout(() => setStockWarning(''), 3000);
      return;
    }
    addToCart(product, selectedSize || '', quantity, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setStockWarning('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) {
      setReviewError('Veuillez remplir tous les champs');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', reviewForm.name);
      formData.append('rating', reviewForm.rating);
      formData.append('comment', reviewForm.comment);
      formData.append('product', product.name);
      if (reviewForm.image) formData.append('image', reviewForm.image);
      await api.post('/reviews', formData);
      setReviewSubmitted(true);
      setReviewError('');
      setReviewForm({ name: '', rating: 5, comment: '', product: product.name, image: null });
    } catch {
      setReviewError("Erreur lors de l'envoi. Réessayez.");
    }
  };

  const productReviews = reviews.filter((r) =>
    r.product?.toLowerCase() === product.name?.toLowerCase() && r.status === 'approved'
  );

  const avgRating = productReviews.length > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : null;

  const ReviewCard = ({ review }) => (
    <div className="pd-review-card">
      <div className="pd-review-header">
        <div className="pd-review-avatar">{review.name.charAt(0).toUpperCase()}</div>
        <div className="pd-review-info">
          <p className="pd-review-name">{review.name}</p>
          <StarRating value={review.rating} readonly />
        </div>
        <span className="pd-review-date">{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
      </div>
      <p className="pd-review-comment">{review.comment}</p>
      {review.image && (
        <div className="pd-review-photo">
          <img
            src={`http://127.0.0.1:8000/storage/${review.image}`}
            alt="Photo client"
            onClick={() => window.open(`http://127.0.0.1:8000/storage/${review.image}`, '_blank')}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="pd-page">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="pd-container">

        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <Link to="/">Accueil</Link><span>›</span>
          <Link to="/catalogue">Produits</Link><span>›</span>
          {product.category && (
            <><Link to={`/categorie/${product.category.toLowerCase().replace(/ /g, '-')}`}>{product.category}</Link><span>›</span></>
          )}
          <span>{product.name}</span>
        </div>

        {/* Produit principal */}
        <div className="pd-main">

         {/* Galerie */}
<div className="pd-gallery">

{/* Grande image EN PREMIER */}
<div className="pd-gallery-main"
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const img = e.currentTarget.querySelector('img');
    if (img) img.style.transformOrigin = `${x}% ${y}%`;
  }}
  onMouseEnter={(e) => {
    const img = e.currentTarget.querySelector('img');
    if (img) img.style.transform = 'scale(1.8)';
  }}
  onMouseLeave={(e) => {
    const img = e.currentTarget.querySelector('img');
    if (img) { img.style.transform = 'scale(1)'; img.style.transformOrigin = 'center'; }
  }}
>
  {colorImages[selectedImage] ? (
    <img src={colorImages[selectedImage]} alt={product.name} className="pd-main-img" style={{ transition: 'transform 0.1s ease' }} />
  ) : (
    <div className="pd-no-image">
      <svg viewBox="0 0 24 24" fill="none" stroke="#cccccc" width="64" height="64">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
        <polyline points="21 15 16 10 5 21" strokeWidth="1.5" />
      </svg>
    </div>
  )}
  {product.discount > 0 && <span className="pd-badge-discount">-{product.discount}%</span>}
</div>

{/* Miniatures horizontales EN BAS */}
{colorImages.length > 1 && (
  <div className="pd-gallery-thumbs">
    {colorImages.map((img, i) => (
      <button key={i} className={`pd-thumb ${i === selectedImage ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
        <img src={img} alt={`${product.name} ${i + 1}`} />
      </button>
    ))}
  </div>
)}

</div>
          {/* Infos */}
          <div className="pd-info">
            {product.brand && <span className="pd-brand">{product.brand}</span>}
            <h1 className="pd-name">{product.name}</h1>

            {avgRating && (
              <div className="pd-rating-summary">
                <StarRating value={Math.round(avgRating)} readonly />
                <span className="pd-rating-text">{avgRating}/5 ({productReviews.length} avis)</span>
              </div>
            )}

            <div className="pd-price-block">
              {discountedPrice ? (
                <>
                  <span className="pd-price-new">{discountedPrice} DH</span>
                  <span className="pd-price-old">{parseFloat(product.price).toFixed(2)} DH</span>
                  <span className="pd-price-save">Économisez {(product.price - discountedPrice).toFixed(2)} DH</span>
                </>
              ) : (
                <span className="pd-price-new">{parseFloat(product.price).toFixed(2)} DH</span>
              )}
            </div>

            <div className="pd-viewers">
              <span className="pd-viewers-dot" />
              👀 <strong>{viewers} personnes</strong> regardent ce produit en ce moment
            </div>

            <div className="pd-delivery-badge">
              🚚 Livraison estimée : <strong>2-3 jours ouvrables</strong>
            </div>

            {product.discount > 0 && (
              <div className="pd-countdown">
                ⏰ Offre expire dans :
                <span className="pd-countdown-timer">
                  {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
                </span>
              </div>
            )}

            {product.stock > 0 && product.stock <= 5 && (
              <div className="pd-stock-alert">⚠️ Plus que {product.stock} pièce{product.stock > 1 ? 's' : ''} disponible{product.stock > 1 ? 's' : ''} !</div>
            )}
            {product.stock > 5 && product.stock <= 10 && (
              <div className="pd-stock-popular">🔥 Populaire — Stock limité</div>
            )}

            <div className="pd-divider" />

            {/* Couleurs */}
            {hasColors && (
              <div className="pd-section">
                <p className="pd-section-label">
                  Couleur : {selectedColor && <strong>{colorNames[selectedColor] || selectedColor}</strong>}
                </p>
                <div className="pd-colors-thumbs">
                  {product.colors.map((c) => (
                    <button key={c.hex}
                      className={`pd-color-thumb ${selectedColor === c.hex ? 'active' : ''} ${c.stock <= 0 ? 'out' : ''}`}
                      onClick={() => handleColorSelect(c.hex)}
                      title={colorNames[c.hex] || c.hex}
                    >
                      {c.images?.length > 0 ? (
                        <img src={`http://127.0.0.1:8000/storage/${c.images[0]}`} alt={colorNames[c.hex]} />
                      ) : (
                        <span style={{ backgroundColor: c.hex, width: '100%', height: '100%', display: 'block', borderRadius: '4px' }} />
                      )}
                      <span className="pd-color-thumb-label">{colorNames[c.hex] || c.hex}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tailles */}
            {selectedColor && hasSizes && (
              <div className="pd-section">
                <div className="pd-size-header">
                  <p className="pd-section-label">Taille : {selectedSize && <strong>{selectedSize}</strong>}</p>
                  <button className="pd-size-guide-btn" onClick={() => setShowSizeGuide(true)}>📏 Guide des tailles</button>
                </div>
                <div className="pd-sizes">
                  {availableSizes.map((s) => (
                    <button key={s.size}
                      className={`pd-size-btn ${selectedSize === s.size ? 'active' : ''} ${s.stock <= 0 ? 'out' : ''}`}
                      onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                      disabled={s.stock <= 0}
                    >
                      {s.size}
                      {s.stock <= 0 && <span className="pd-size-out">✕</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantité */}
            <div className="pd-section">
              <p className="pd-section-label">Quantité :</p>
              <div className="pd-qty">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            </div>

            {stockWarning && <p className="pd-warning">{stockWarning}</p>}

            {/* Boutons */}
            <div className="pd-actions">
              <button
                className={`pd-btn-cart ${added ? 'added' : ''} ${product.stock <= 0 ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                {product.stock <= 0 ? 'Rupture de stock' : added ? '✓ Ajouté au panier !' : 'Ajouter au panier'}
              </button>
              <Link to="/panier" className="pd-btn-order">Commander maintenant</Link>
            </div>

            {/* Partage */}
            <div className="pd-share">
              <span className="pd-share-label">Partager :</span>
              <a href={`https://wa.me/?text=${encodeURIComponent(`${product.name} - ${window.location.href}`)}`}
                target="_blank" rel="noopener noreferrer" className="pd-share-btn pd-share-wa">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank" rel="noopener noreferrer" className="pd-share-btn pd-share-fb">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Facebook
              </a>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Lien copié !'); }}
                className="pd-share-btn pd-share-copy">
                🔗 Copier le lien
              </button>
            </div>

            <div className="pd-divider" />

            {/* Accordéon */}
            <div className="pd-accordion">
              {[
                { key: 'livraison', title: '🚚 Livraison', content: "Livraison disponible sur Casablanca et environs en 2-3 jours ouvrables. Livraison gratuite à partir de 500 DH d'achat." },
                { key: 'retour', title: '↩️ Retours & Échanges', content: "Vous disposez de 30 jours après réception pour retourner votre article. Le produit doit être dans son état d'origine, non porté et avec ses étiquettes." },
                { key: 'paiement', title: '💳 Paiement', content: "Paiement à la livraison disponible. Commande via WhatsApp avec confirmation avant expédition." },
              ].map((item) => (
                <div key={item.key} className="pd-accordion-item">
                  <button className="pd-accordion-header"
                    onClick={() => setOpenAccordion(openAccordion === item.key ? null : item.key)}>
                    <span>{item.title}</span>
                    <span className={`pd-accordion-icon ${openAccordion === item.key ? 'open' : ''}`}>›</span>
                  </button>
                  {openAccordion === item.key && (
                    <div className="pd-accordion-body">{item.content}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Specs */}
            {specs.length > 0 && (
              <div className="pd-specs">
                <h3 className="pd-specs-title">Caractéristiques</h3>
                <div className="pd-specs-grid">
                  {specs.map(([key, value]) => (
                    <div key={key} className="pd-spec-row">
                      <span className="pd-spec-key">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <span className="pd-spec-val">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="pd-description">
                <h3 className="pd-specs-title">Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Confiance */}
            <div className="pd-trust">
              <div className="pd-trust-item"><span className="pd-trust-icon">🛡️</span><span>Produit authentique garanti</span></div>
              <div className="pd-trust-item"><span className="pd-trust-icon">📦</span><span>Emballage soigné et sécurisé</span></div>
              <div className="pd-trust-item"><span className="pd-trust-icon">⭐</span><span>500+ clients satisfaits</span></div>
            </div>
          </div>
        </div>

        {/* AVIS + POURQUOI NOUS */}
        <div className="pd-bottom-section">

          {/* Avis */}
          <div className="pd-reviews-section">
            <h2 className="pd-reviews-title">Avis clients</h2>

            {productReviews.length > 0 ? (
              <>
                <div className="pd-reviews-summary">
                  <div className="pd-reviews-avg">
                    <span className="pd-reviews-avg-number">{avgRating}</span>
                    <StarRating value={Math.round(avgRating)} readonly />
                    <span className="pd-reviews-count">{productReviews.length} avis</span>
                  </div>
                </div>
                <div className="pd-reviews-list">
                  {productReviews.slice(0, 4).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
                {productReviews.length > 4 && (
                  <button className="pd-reviews-all-btn" onClick={() => setShowAllReviews(true)}>
                    Voir tous les avis ({productReviews.length})
                  </button>
                )}
              </>
            ) : (
              <p className="pd-no-reviews">Aucun avis — soyez le premier !</p>
            )}

            {/* Formulaire */}
            <div className="pd-review-form-section">
              <h3 className="pd-review-form-title">Laisser un avis</h3>
              {reviewSubmitted ? (
                <div className="pd-review-success">✅ Merci ! Votre avis sera publié après validation.</div>
              ) : (
                <form className="pd-review-form" onSubmit={handleReviewSubmit}>
                  <div className="pd-review-form-row">
                    <div className="pd-review-field">
                      <label>Votre nom *</label>
                      <input type="text" placeholder="Ex: Mohamed" value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} required />
                    </div>
                    <div className="pd-review-field">
                      <label>Note *</label>
                      <StarRating value={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                    </div>
                  </div>
                  <div className="pd-review-field">
                    <label>Commentaire *</label>
                    <textarea placeholder="Partagez votre expérience..." value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows={3} required />
                  </div>
                  <div className="pd-review-field">
                    <label>📷 Ajouter une photo (optionnel)</label>
                    <input type="file" accept="image/*"
                      onChange={(e) => setReviewForm({ ...reviewForm, image: e.target.files[0] })} />
                    {reviewForm.image && (
                      <img src={URL.createObjectURL(reviewForm.image)} alt="Aperçu"
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px', border: '2px solid #cc0000' }} />
                    )}
                    <small style={{ color: '#888', fontSize: '11px' }}>Montrez le produit porté — max 5MB</small>
                  </div>
                  {reviewError && <p className="pd-review-error">{reviewError}</p>}
                  <button type="submit" className="pd-review-submit">Publier mon avis</button>
                </form>
              )}
            </div>
          </div>

          {/* Pourquoi MBLifestyle */}
          <div className="pd-why-us">
            <h2 className="pd-reviews-title">Pourquoi choisir MBLifestyle ?</h2>
            <div className="pd-why-list">
              {[
                { icon: '🏆', title: 'Marques premium sélectionnées', desc: 'Nous travaillons uniquement avec des marques reconnues pour leur qualité et leur style.' },
                { icon: '📸', title: 'Photos réelles des produits', desc: 'Toutes nos photos sont prises sur de vrais modèles — ce que vous voyez est ce que vous recevez.' },
                { icon: '🎁', title: 'Emballage cadeau disponible', desc: 'Commandez un cadeau ? Nous pouvons emballer votre article avec soin sur demande.' },
                { icon: '🔔', title: 'Notifications de commande', desc: 'Vous êtes informé à chaque étape — confirmation, préparation et livraison.' },
                { icon: '💎', title: 'Éditions limitées', desc: 'Retrouvez des pièces exclusives et des collections en édition limitée disponibles uniquement chez nous.' },
                { icon: '🤝', title: 'Relation client personnalisée', desc: 'Chaque client est unique. Notre équipe vous conseille personnellement via WhatsApp.' },
              ].map((item, i) => (
                <div key={i} className="pd-why-item">
                  <div className="pd-why-icon">{item.icon}</div>
                  <div>
                    <p className="pd-why-title">{item.title}</p>
                    <p className="pd-why-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Articles similaires */}
        {similarProducts.length > 0 && (
          <div className="pd-similar-section">
            <div className="pd-similar-header">
              <h2 className="pd-similar-title">Articles similaires</h2>
              <Link to={`/categorie/${product.category?.toLowerCase().replace(/ /g, '-')}`} className="pd-similar-link">Voir tout →</Link>
            </div>
            <div className="pd-similar-grid">
              {similarProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* Vus récemment */}
        {recentProducts.length > 0 && (
          <div className="pd-similar-section">
            <div className="pd-similar-header">
              <h2 className="pd-similar-title">Vus récemment</h2>
            </div>
            <div className="pd-similar-grid">
              {recentProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="pd-recent-card" onClick={() => navigate(`/produit/${p.id}`)}>
                  <div className="pd-recent-img">
                    {p.images?.[0] ? <img src={`http://127.0.0.1:8000/storage/${p.images[0]}`} alt={p.name} /> : <div className="pd-recent-placeholder">👕</div>}
                  </div>
                  <p className="pd-recent-name">{p.name}</p>
                  <p className="pd-recent-price">
                    {p.discount > 0 ? (p.price - p.price * p.discount / 100).toFixed(2) : parseFloat(p.price).toFixed(2)} DH
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guide des tailles */}
      {showSizeGuide && (
        <div className="pd-modal-overlay" onClick={() => setShowSizeGuide(false)}>
          <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h3>📏 Guide des tailles</h3>
              <button onClick={() => setShowSizeGuide(false)}>✕</button>
            </div>
            <div className="pd-modal-body">
              <table className="pd-size-table">
                <thead>
                  <tr><th>Taille</th><th>Tour de poitrine</th><th>Tour de taille</th><th>Tour de hanches</th></tr>
                </thead>
                <tbody>
                  {[
                    { size: 'XS', chest: '80-84', waist: '60-64', hip: '86-90' },
                    { size: 'S', chest: '84-88', waist: '64-68', hip: '90-94' },
                    { size: 'M', chest: '88-92', waist: '68-72', hip: '94-98' },
                    { size: 'L', chest: '92-96', waist: '72-76', hip: '98-102' },
                    { size: 'XL', chest: '96-100', waist: '76-80', hip: '102-106' },
                    { size: 'XXL', chest: '100-104', waist: '80-84', hip: '106-110' },
                    { size: '3XL', chest: '104-108', waist: '84-88', hip: '110-114' },
                  ].map((row) => (
                    <tr key={row.size}>
                      <td><strong>{row.size}</strong></td>
                      <td>{row.chest} cm</td>
                      <td>{row.waist} cm</td>
                      <td>{row.hip} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="pd-size-guide-tip">💡 En cas de doute, prenez la taille supérieure.</p>
            </div>
          </div>
        </div>
      )}

      {/* Popup tous les avis */}
      {showAllReviews && (
        <div className="pd-modal-overlay" onClick={() => setShowAllReviews(false)}>
          <div className="pd-modal pd-reviews-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h3>Avis clients ({productReviews.length})</h3>
              <button onClick={() => setShowAllReviews(false)}>✕</button>
            </div>
            <div className="pd-modal-body">
              <div className="pd-reviews-modal-summary">
                <span className="pd-reviews-avg-number">{avgRating}</span>
                <StarRating value={Math.round(avgRating)} readonly />
                <span className="pd-reviews-count">{productReviews.length} avis</span>
              </div>
              <div className="pd-reviews-modal-list">
                {productReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default ProductDetail;