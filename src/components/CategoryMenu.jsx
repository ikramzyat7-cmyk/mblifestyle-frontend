import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './CategoryMenu.css';

function CategoryMenu() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const visibleCategories = categories.slice(0, 7);
  const hasMore = categories.length > 7;

  return (
    <div className="category-menu">
      <div className="category-menu-grid">
        {visibleCategories.map((cat, index) => (
          <Link
            key={cat.id}
            to={`/categorie/${cat.slug}`}
            className="category-menu-item"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="category-menu-image">
              {cat.image ? (
                <img
                  src={`https://mblifestyle-backend-production.up.railway.app/storage/${cat.image}`}
                  alt={cat.name}
                />
              ) : (
                <div className="category-menu-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
                    <polyline points="21 15 16 10 5 21" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </div>
            <span className="category-menu-name">{cat.name}</span>
          </Link>
        ))}

        {hasMore && (
          <Link
            to="/categories"
            className="category-menu-item category-menu-more"
            style={{ animationDelay: `${7 * 0.05}s` }}
          >
            <div className="category-menu-image category-menu-more-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
                <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                <line x1="12" y1="8" x2="12" y2="16" strokeWidth="2" />
                <line x1="8" y1="12" x2="16" y2="12" strokeWidth="2" />
              </svg>
            </div>
            <span className="category-menu-name">
              +{categories.length - 7} autres
            </span>
          </Link>
        )}
      </div>

      {hasMore && (
        <div className="category-menu-footer">
          <Link to="/categories" className="category-menu-all-btn">
            Voir toutes les catégories ({categories.length})
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
              <polyline points="12 5 19 12 12 19" strokeWidth="2" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

export default CategoryMenu;