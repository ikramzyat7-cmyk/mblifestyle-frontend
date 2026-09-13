import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ProductCard from '../components/ProductCard';
import './Wishlist.css';

function Wishlist() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddAllToCart = () => {
    wishlistItems.forEach((product) => {
      addToCart(product, '', 1, null);
    });
  };

  return (
    <div className="wishlist-page">
      <Header searchTerm="" onSearchChange={() => {}} />

      <div className="wishlist-hero">
        <div className="wishlist-breadcrumb">
          <Link to="/">Accueil</Link>
          <span>/</span>
          <span>Mes Favoris</span>
        </div>
        <h1 className="wishlist-title">
          Mes Favoris
          <span className="wishlist-count">({wishlistItems.length})</span>
        </h1>
      </div>

      <div className="wishlist-container">
        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">🤍</div>
            <h2>Votre liste de favoris est vide</h2>
            <p>Ajoutez des produits en cliquant sur le cœur ❤️</p>
            <Link to="/catalogue" className="wishlist-empty-btn">
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <>
            {/* Actions globales */}
            <div className="wishlist-actions">
              <span className="wishlist-info">
                {wishlistItems.length} produit{wishlistItems.length > 1 ? 's' : ''} dans ta liste
              </span>
              <div className="wishlist-action-btns">
                <button className="wishlist-btn-all" onClick={handleAddAllToCart}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                    <circle cx="9" cy="21" r="1" strokeWidth="2"/>
                    <circle cx="20" cy="21" r="1" strokeWidth="2"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeWidth="2"/>
                  </svg>
                  Tout ajouter au panier
                </button>
                <button className="wishlist-btn-clear" onClick={clearWishlist}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                    <polyline points="3 6 5 6 21 6" strokeWidth="2"/>
                    <path d="M19 6l-1 14H6L5 6" strokeWidth="2"/>
                    <path d="M10 11v6M14 11v6" strokeWidth="2"/>
                  </svg>
                  Vider la liste
                </button>
              </div>
            </div>

            {/* Grille — vraies ProductCard identiques au catalogue */}
            <div className="wishlist-grid">
              {wishlistItems.map((product) => (
                <div key={product.id} className="wishlist-card-wrapper">
                  <ProductCard product={product} />
                  {/* Bouton supprimer des favoris en dessous de la card */}
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => removeFromWishlist(product.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                      <polyline points="3 6 5 6 21 6" strokeWidth="2"/>
                      <path d="M19 6l-1 14H6L5 6" strokeWidth="2"/>
                      <path d="M10 11v6M14 11v6" strokeWidth="2"/>
                    </svg>
                    Retirer des favoris
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default Wishlist;