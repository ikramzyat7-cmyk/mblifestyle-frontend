import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import api from '../api/axios';
import './AllCategories.css';
import { storageUrl } from '../api/config';
function AllCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/products'),
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getProductCount = (catName) =>
    products.filter((p) => p.category?.toLowerCase() === catName?.toLowerCase()).length;

  return (
    <div className="all-categories-page">
      <Header searchTerm="" onSearchChange={() => {}} />

      {/* Hero */}
      <div className="ac-hero">
        <div className="ac-breadcrumb">
          <Link to="/">Accueil</Link>
          <span>›</span>
          <span>Toutes les catégories</span>
        </div>
        <h1 className="ac-hero-title">NOS CATÉGORIES</h1>
        {!loading && (
          <p className="ac-hero-subtitle">{categories.length} catégories disponibles</p>
        )}
      </div>

      <div className="ac-container">
        {loading ? (
          <div className="ac-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="ac-skeleton">
                <div className="ac-skeleton-img" />
                <div className="ac-skeleton-text" />
              </div>
            ))}
          </div>
        ) : (
          <div className="ac-grid">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/categorie/${cat.slug}`} className="ac-card">
                <div className="ac-card-img">
                  {cat.image ? (
                    <img src={`${storageUrl(cat.image)}`} alt={cat.name} />
                  ) : (
                    <div className="ac-card-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#cccccc" width="40" height="40">
                        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
                        <polyline points="21 15 16 10 5 21" strokeWidth="1.5" />
                      </svg>
                    </div>
                  )}
                  <div className="ac-card-overlay">
                    <span className="ac-card-btn">Voir la collection →</span>
                  </div>
                </div>
                <div className="ac-card-info">
                  <h3 className="ac-card-name">{cat.name}</h3>
                  <span className="ac-card-count">{getProductCount(cat.name)} produit{getProductCount(cat.name) !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default AllCategories;