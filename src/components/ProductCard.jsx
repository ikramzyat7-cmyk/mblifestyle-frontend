import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';
import { useWishlist } from '../context/WishlistContext';



function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [stockWarning, setStockWarning] = useState('');


  const images = product.images || [];
  const defaultImage = images[0]
    ? `http://127.0.0.1:8000/storage/${images[0]}`
    : null;
  const hoverImage = images[1]
    ? `http://127.0.0.1:8000/storage/${images[1]}`
    : defaultImage;

  const selectedColorData = product.colors?.find((c) => c.hex === selectedColor);
  const frontImage = selectedColorData?.image
    ? `http://127.0.0.1:8000/storage/${selectedColorData.image}`
    : defaultImage;

  const hasColors = product.colors && product.colors.length > 0;
  const availableSizes = selectedColorData?.sizes || [];
  const hasSizes = availableSizes.length > 0;

  const isOutOfStock = product.stock <= 0;

  const discountedPrice = product.discount > 0
    ? (product.price - (product.price * product.discount / 100)).toFixed(2)
    : null;

  const specs = product.specs ? Object.entries(product.specs).slice(0, 2) : [];

  const getStockForSize = (size) => {
    const sizeData = availableSizes.find((s) => s.size === size);
    return sizeData ? sizeData.stock : 0;
  };

  const handleColorSelect = (e, hex) => {
    e.stopPropagation();
    setSelectedColor(selectedColor === hex ? null : hex);
    setSelectedSize(null);
    setStockWarning('');
  };

  const handleSizeSelect = (e, size) => {
    e.stopPropagation();
    if (getStockForSize(size) <= 0) return;
    setSelectedSize(selectedSize === size ? null : size);
    setStockWarning('');
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
  
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
  
    const availableStock = selectedSize
      ? getStockForSize(selectedSize)
      : selectedColorData
        ? selectedColorData.stock
        : product.stock;
  
    if (quantity > availableStock) {
      setStockWarning(`Stock insuffisant — ${availableStock} dispo`);
      setTimeout(() => setStockWarning(''), 3000);
      return;
    }
  
    setStockWarning('');
    addToCart(product, selectedSize || '', quantity, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleCardClick = () => navigate(`/produit/${product.id}`);
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div className="pc-card" onClick={handleCardClick}>

      {/* Image */}
      <div className="pc-image-wrapper">
        {frontImage ? (
          <>
            <img src={frontImage} alt={product.name} className="pc-img-front" />
            {hoverImage && hoverImage !== frontImage && (
              <img src={hoverImage} alt={product.name} className="pc-img-hover" />
            )}
          </>
        ) : (
          <div className="pc-no-image">
            <svg viewBox="0 0 24 24" fill="none" stroke="#cccccc" width="48" height="48">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
              <polyline points="21 15 16 10 5 21" strokeWidth="1.5" />
            </svg>
          </div>
        )}
        {/* Bouton Wishlist */}
        <button
          className={`pc-wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          title={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg viewBox="0 0 24 24" width="18" height="18"
            fill={inWishlist ? '#e53935' : 'none'}
            stroke={inWishlist ? '#e53935' : 'currentColor'}
            strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        {product.discount > 0 && (
          <span className="pc-badge-discount">-{product.discount}%</span>
        )}
        {isOutOfStock && (
          <span className="pc-badge-rupture">Rupture</span>
        )}
{product.created_at && (() => {
  const created = new Date(product.created_at);
  const now = new Date();
  const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7
    ? <span className="pc-badge-new">NOUVEAU</span>
    : null;
})()}
        {/* Bouton rapide hover */}
        {!isOutOfStock && (
          <div className="pc-quick-actions" onClick={stopPropagation}>
            <button
              className={`pc-btn-quick ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {added ? (
                <>✓ Ajouté !</>
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
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="pc-info">
        {product.brand && <span className="pc-brand">{product.brand}</span>}
        <h3 className="pc-name">{product.name}</h3>

        {specs.length > 0 && (
          <div className="pc-specs">
            {specs.map(([key, value]) => value && (
              <span key={key} className="pc-spec-tag">{value}</span>
            ))}
          </div>
        )}

        <div className="pc-price-row">
          {discountedPrice ? (
            <>
              <span className="pc-price-new">{discountedPrice} DH</span>
              <span className="pc-price-old">{parseFloat(product.price).toFixed(2)} DH</span>
            </>
          ) : (
            <span className="pc-price-new">{parseFloat(product.price).toFixed(2)} DH</span>
          )}
        </div>

        {/* Couleurs */}
        {hasColors && (
          <div className="pc-colors" onClick={stopPropagation}>
            {product.colors.map((c) => (
              <button
                key={c.hex}
                className={`pc-color-dot ${selectedColor === c.hex ? 'active' : ''} ${c.stock <= 0 ? 'out' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={(e) => handleColorSelect(e, c.hex)}
                title={c.stock <= 0 ? 'Rupture' : ''}
              />
            ))}
          </div>
        )}

        {/* Tailles — apparaissent après sélection couleur */}
        {selectedColor && hasSizes && (
          <div className="pc-sizes" onClick={stopPropagation}>
            {availableSizes.map((s) => (
              <button
                key={s.size}
                className={`pc-size-chip 
                  ${selectedSize === s.size ? 'active' : ''} 
                  ${s.stock <= 0 ? 'disabled' : ''}`}
                onClick={(e) => handleSizeSelect(e, s.size)}
                disabled={s.stock <= 0}
              >
                {s.size}
              </button>
            ))}
          </div>
        )}

        {/* Warning */}
        {stockWarning && (
          <p className="pc-stock-warning">{stockWarning}</p>
        )}

        {/* Bouton bas */}
        <div className="pc-footer" onClick={stopPropagation}>
          {isOutOfStock ? (
            <button className="pc-btn-rupture" disabled>Rupture de stock</button>
          ) : (
            <div className="pc-btn-row">
              <div className="pc-qty">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <button
                className={`pc-btn-cart ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
              >
                {added ? '✓ Ajouté' : 'Commander'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;