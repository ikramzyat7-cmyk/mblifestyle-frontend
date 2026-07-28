import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import './AllProducts.css';

const PRODUCTS_PER_PAGE = 20;

const availableColors = [
  { name: 'Noir', hex: '#111111' },
  { name: 'Blanc', hex: '#f5f5f5' },
  { name: 'Rouge', hex: '#cc0000' },
  { name: 'Bleu', hex: '#1e3a8a' },
  { name: 'Marine', hex: '#0a1f5c' },
  { name: 'Vert', hex: '#2e7d32' },
  { name: 'Beige', hex: '#d8c3a5' },
  { name: 'Gris', hex: '#888888' },
  { name: 'Rose', hex: '#e91e8c' },
  { name: 'Camel', hex: '#c19a6b' },
  { name: 'Bordeaux', hex: '#6d1a2a' },
  { name: 'Kaki', hex: '#5c5c2e' },
];

const sizesByCategory = {
  'T-shirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  'T-shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  'Pantalons': ['34', '36', '38', '40', '42', '44', '46', '48'],
  'Robes': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Chemises': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Vestes': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Sweats': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Shorts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Chaussures': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  'Accessoires': ['Taille unique', 'S/M', 'L/XL'],
  'Ensembles': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
};

function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function AllProducts() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('random');
  const [inStock, setInStock] = useState(false);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [priceRange, setPriceRange] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedClothingSize, setSelectedClothingSize] = useState('');
  const [selectedShoeSize, setSelectedShoeSize] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);


  useEffect(() => {
    setLoading(true);
    api.get('/products').then((res) => {
      const sorted = [...res.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setProducts(sorted);
      setLoading(false);
    }).catch(() => setLoading(false));

    api.get('/categories').then((res) => setCategories(res.data));

    // Initialiser depuis URL params
    const catParam = searchParams.get('category');
    if (catParam) setSelectedCategory(catParam);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allPrices = products.map((p) => parseFloat(p.price));
  const priceFloor = allPrices.length > 0 ? Math.floor(Math.min(...allPrices)) : 0;
  const priceCeil = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : 1000;
  const currentMin = priceRange ? priceRange[0] : priceFloor;
  const currentMax = priceRange ? priceRange[1] : priceCeil;

  const inStockCount = products.filter((p) => p.stock > 0).length;
  const discountCount = products.filter((p) => p.discount > 0).length;

  // Tailles disponibles selon catégorie sélectionnée
  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

  // Toggle couleur
  const toggleColor = (hex) => {
    setSelectedColors((prev) =>
      prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]
    );
    setCurrentPage(1);
  };

  // Filtrage
  let filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = !inStock || product.stock > 0;
    const matchesDiscount = !onlyDiscount || product.discount > 0;
    const price = parseFloat(product.price);
    const matchesPrice = price >= currentMin && price <= currentMax;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesColor = selectedColors.length === 0 ||
      (product.colors && product.colors.some((c) => selectedColors.includes(c.hex)));
      const matchesSize = (!selectedClothingSize && !selectedShoeSize) ||
      (product.colors && product.colors.some((c) =>
        c.sizes && c.sizes.some((s) =>
          (selectedClothingSize && s.size === selectedClothingSize && s.stock > 0) ||
          (selectedShoeSize && s.size === selectedShoeSize && s.stock > 0)
        )
      ));
    return matchesSearch && matchesStock && matchesDiscount && matchesPrice && matchesCategory && matchesColor && matchesSize;
  });

  // Tri
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc': return parseFloat(b.price) - parseFloat(a.price);
      case 'newest': return new Date(b.created_at) - new Date(a.created_at);
      case 'discount': return (b.discount || 0) - (a.discount || 0);
      default: return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const resetFilters = () => {
    setInStock(false);
    setOnlyDiscount(false);
    setPriceRange(null);
    setSelectedCategory('all');
    setSelectedColors([]);
    setSelectedSize('');
    setCurrentPage(1);
    setSelectedClothingSize('');
    setSelectedShoeSize('');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="all-products-page">
      <Header searchTerm={searchTerm} onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }} />

      <div className="all-products-hero">
        <div className="category-breadcrumb">
          <Link to="/">Accueil</Link>
          <span>/</span>
          <span>Tous nos produits</span>
        </div>
        <h1 className="all-products-title">Tous nos produits</h1>
      </div>

      <div className="all-products-layout">

        {/* Sidebar filtres */}
        <aside className="category-sidebar">

          <div className="sidebar-header">
            <h3>Filtres</h3>
            <button className="sidebar-reset-all" onClick={resetFilters}>Tout réinitialiser</button>
          </div>

          {/* Disponibilité */}
          <div className="sidebar-block">
            <h3>Disponibilité</h3>
            <label className="sidebar-checkbox">
              <input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); setCurrentPage(1); }} />
              En stock ({inStockCount})
            </label>
            <label className="sidebar-checkbox">
              <input type="checkbox" checked={onlyDiscount} onChange={(e) => { setOnlyDiscount(e.target.checked); setCurrentPage(1); }} />
              En promotion ({discountCount})
            </label>
          </div>

          {/* Prix */}
          <div className="sidebar-block">
            <h3>Prix</h3>
            <div className="price-inputs-row">
              <div className="price-input-box">
                <span className="price-input-label">DH</span>
                <input type="number" value={currentMin} min={priceFloor} max={currentMax}
                  onChange={(e) => { setPriceRange([Math.min(Math.max(Number(e.target.value), priceFloor), currentMax), currentMax]); setCurrentPage(1); }} />
              </div>
              <span className="price-input-separator">à</span>
              <div className="price-input-box">
                <span className="price-input-label">DH</span>
                <input type="number" value={currentMax} min={currentMin} max={priceCeil}
                  onChange={(e) => { setPriceRange([currentMin, Math.max(Math.min(Number(e.target.value), priceCeil), currentMin)]); setCurrentPage(1); }} />
              </div>
            </div>
            <div className="price-slider-wrapper">
              <div className="price-slider-track">
                <div className="price-slider-range" style={{
                  left: `${((currentMin - priceFloor) / (priceCeil - priceFloor || 1)) * 100}%`,
                  right: `${100 - ((currentMax - priceFloor) / (priceCeil - priceFloor || 1)) * 100}%`,
                }} />
              </div>
              <input type="range" min={priceFloor} max={priceCeil} value={currentMin}
                onChange={(e) => { setPriceRange([Math.min(Number(e.target.value), currentMax), currentMax]); setCurrentPage(1); }}
                className="price-slider-input price-slider-input-min" />
              <input type="range" min={priceFloor} max={priceCeil} value={currentMax}
                onChange={(e) => { setPriceRange([currentMin, Math.max(Number(e.target.value), currentMin)]); setCurrentPage(1); }}
                className="price-slider-input price-slider-input-max" />
            </div>
            <div className="price-slider-values">
              <span>{currentMin} DH</span>
              <span>{currentMax} DH</span>
            </div>
          </div>

          {/* Catégories */}
          <div className="sidebar-block">
            <h3>Catégorie</h3>
            <label className="sidebar-checkbox">
              <input type="radio" name="category" checked={selectedCategory === 'all'} onChange={() => { setSelectedCategory('all'); setCurrentPage(1); }} />
              Toutes
            </label>
            {categories.map((cat) => (
              <label className="sidebar-checkbox" key={cat.id}>
                <input type="radio" name="category" checked={selectedCategory === cat.name} onChange={() => { setSelectedCategory(cat.name); setCurrentPage(1); }} />
                {cat.name}
              </label>
            ))}
          </div>

          {/* Couleurs */}
          <div className="sidebar-block">
            <h3>Couleur</h3>
            <div className="sidebar-colors">
              {availableColors.map((color) => (
                <button key={color.hex} type="button"
                  className={`sidebar-color-btn ${selectedColors.includes(color.hex) ? 'active' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => toggleColor(color.hex)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Tailles vêtements */}
<div className="sidebar-block">
  <h3>Taille vêtements</h3>
  <div className="sidebar-sizes">
    {clothingSizes.map((size) => (
      <button key={size}
        className={`sidebar-size-btn ${selectedClothingSize === size ? 'active' : ''}`}
        onClick={() => {
          setSelectedClothingSize(selectedClothingSize === size ? '' : size);
          setSelectedShoeSize('');
          setCurrentPage(1);
        }}>
        {size}
      </button>
    ))}
  </div>
</div>

{/* Tailles chaussures */}
<div className="sidebar-block">
  <h3>Pointure chaussures</h3>
  <div className="sidebar-sizes">
    {shoeSizes.map((size) => (
      <button key={size}
        className={`sidebar-size-btn ${selectedShoeSize === size ? 'active' : ''}`}
        onClick={() => {
          setSelectedShoeSize(selectedShoeSize === size ? '' : size);
          setSelectedClothingSize('');
          setCurrentPage(1);
        }}>
        {size}
      </button>
    ))}
  </div>
</div>

        </aside>

        {/* Produits */}
        <div className="all-products-main">
          <div className="category-toolbar">
            {!loading && (
              <span className="category-count">
                {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            )}
            <div className="toolbar-right">
              {/* Vue grille/liste */}
              <div className="view-mode-btns">
                <button className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" />
                    <rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" />
                  </svg>
                </button>
                <button className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <rect x="3" y="4" width="18" height="3" rx="1" /><rect x="3" y="10" width="18" height="3" rx="1" />
                    <rect x="3" y="16" width="18" height="3" rx="1" />
                  </svg>
                </button>
              </div>
              <select className="sort-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}>
                <option value="random">Trier : Aléatoire</option>
                <option value="newest">Trier : Plus récent</option>
                <option value="price-asc">Trier : Prix croissant</option>
                <option value="price-desc">Trier : Prix décroissant</option>
                <option value="discount">Trier : Meilleures promos</option>
              </select>
            </div>
          </div>

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

          {!loading && filteredProducts.length === 0 && (
            <div className="no-results">
              <p>😔 Aucun produit ne correspond à ces filtres.</p>
              <button onClick={resetFilters} className="no-results-btn">Réinitialiser les filtres</button>
            </div>
          )}

          {!loading && paginatedProducts.length > 0 && (
            <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="pagination-dots">...</span>;
                }
                return null;
              })}

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
      {showScrollTop && (
  <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
    ↑
  </button>
)}
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default AllProducts;