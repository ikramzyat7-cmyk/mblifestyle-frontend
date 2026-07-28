import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import './SearchResults.css';

const PRODUCTS_PER_PAGE = 20;

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(query);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get('/products').then((res) => {
      setProducts(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSearchTerm(query);
    setCurrentPage(1);
  }, [query]);

  let filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      (product.brand && product.brand.toLowerCase().includes(term)) ||
      (product.category && product.category.toLowerCase().includes(term)) ||
      (product.description && product.description.toLowerCase().includes(term))
    );
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc': return parseFloat(b.price) - parseFloat(a.price);
      case 'discount': return (b.discount || 0) - (a.discount || 0);
      default: return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="search-results-page">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Hero */}
      <div className="sr-hero">
        <div className="sr-breadcrumb">
          <Link to="/">Accueil</Link>
          <span>›</span>
          <span>Recherche</span>
        </div>
        <h1 className="sr-title">
          {searchTerm ? `Résultats pour « ${searchTerm} »` : 'Recherche'}
        </h1>
        {!loading && (
          <p className="sr-count">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="sr-container">

        {/* Toolbar */}
        {!loading && filteredProducts.length > 0 && (
          <div className="sr-toolbar">
            <span className="sr-toolbar-count">
              {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            <select className="sort-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}>
              <option value="newest">Trier : Plus récent</option>
              <option value="price-asc">Trier : Prix croissant</option>
              <option value="price-desc">Trier : Prix décroissant</option>
              <option value="discount">Trier : Meilleures promos</option>
            </select>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image" />
                <div className="skeleton-info">
                  <div className="skeleton-line skeleton-brand" />
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line skeleton-price" />
                  <div className="skeleton-line skeleton-btn" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aucun résultat */}
        {!loading && filteredProducts.length === 0 && (
          <div className="sr-empty">
            <div className="sr-empty-icon">🔍</div>
            <h2>Aucun résultat pour « {searchTerm} »</h2>
            <p>Essayez avec d'autres mots-clés ou explorez nos catégories</p>
            <div className="sr-empty-btns">
              <Link to="/catalogue" className="sr-empty-btn-primary">Voir tous nos produits</Link>
              <Link to="/categories" className="sr-empty-btn-secondary">Parcourir les catégories</Link>
            </div>
          </div>
        )}

        {/* Produits */}
        {!loading && paginatedProducts.length > 0 && (
          <div className="products-grid">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button key={page} className={`pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => handlePageChange(page)}>
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="pagination-dots">...</span>;
              }
              return null;
            })}
            <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default SearchResults;