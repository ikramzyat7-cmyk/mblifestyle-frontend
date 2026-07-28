import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './CategoryShowcase.css';

function CategoryShowcase() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const visibleCategories = categories.slice(0, 8);
  const hasMore = categories.length > 8;

  return (
    <section className="category-showcase">
      <div className="category-showcase-header">
        <h2>Trouvez votre style</h2>
        <p>Explorez nos collections et trouvez la pièce qui vous correspond</p>
      </div>

      <div className="category-showcase-grid">
        {visibleCategories.map((cat) => (
          <div
            key={cat.id}
            className="category-showcase-item"
            onClick={() => navigate(`/categorie/${cat.slug}`)}
          >
            <div className="category-showcase-image">
              {cat.image ? (
                <img
                  src={`https://mblifestyle-backend-production.up.railway.app/storage/${cat.image}`}
                  alt={cat.name}
                />
              ) : (
                <div className="category-showcase-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="32" height="32">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
                    <polyline points="21 15 16 10 5 21" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
              <div className="category-showcase-overlay">
                <span>Consulter</span>
              </div>
            </div>
            <p className="category-showcase-name">{cat.name}</p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="category-showcase-more">
          <Link to="/categories" className="category-showcase-more-btn">
            Voir toutes les catégories
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
              <polyline points="12 5 19 12 12 19" strokeWidth="2" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}

export default CategoryShowcase;