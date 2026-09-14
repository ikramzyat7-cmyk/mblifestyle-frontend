import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import './CategoryPage.css';
import { storageUrl } from '../api/config';
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

const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [inStock, setInStock] = useState(false);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [priceRange, setPriceRange] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedClothingSize, setSelectedClothingSize] = useState('');
  const [selectedShoeSize, setSelectedShoeSize] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
    setSelectedColors([]);
    setSelectedClothingSize('');
    setSelectedShoeSize('');
    setPriceRange(null);

    api.get('/products').then((res) => {
      setProducts(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    api.get('/categories').then((res) => {
      const found = res.data.find((c) => c.slug === slug);
      setCategoryData(found || null);
    });

    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  const categoryName = categoryData?.name || slug;

  const categoryProducts = products.filter((p) =>
    p.category?.toLowerCase() === categoryName?.toLowerCase()
  );

  const allPrices = categoryProducts.map((p) => parseFloat(p.price));
  const priceFloor = allPrices.length > 0 ? Math.floor(Math.min(...allPrices)) : 0;
  const priceCeil = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : 1000;
  const currentMin = priceRange ? priceRange[0] : priceFloor;
  const currentMax = priceRange ? priceRange[1] : priceCeil;

  const inStockCount = categoryProducts.filter((p) => p.stock > 0).length;
  const discountCount = categoryProducts.filter((p) => p.discount > 0).length;
  const [showSizeGuide, setShowSizeGuide] = useState(false); 
  const toggleColor = (hex) => {
    setSelectedColors((prev) => prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]);
    setCurrentPage(1);
  };

  let filteredProducts = categoryProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = !inStock || product.stock > 0;
    const matchesDiscount = !onlyDiscount || product.discount > 0;
    const price = parseFloat(product.price);
    const matchesPrice = price >= currentMin && price <= currentMax;
    const matchesColor = selectedColors.length === 0 ||
      (product.colors && product.colors.some((c) => selectedColors.includes(c.hex)));
    const matchesSize = (!selectedClothingSize && !selectedShoeSize) ||
      (product.colors && product.colors.some((c) =>
        c.sizes && c.sizes.some((s) =>
          (selectedClothingSize && s.size === selectedClothingSize && s.stock > 0) ||
          (selectedShoeSize && s.size === selectedShoeSize && s.stock > 0)
        )
      ));
    return matchesSearch && matchesStock && matchesDiscount && matchesPrice && matchesColor && matchesSize;
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc': return parseFloat(b.price) - parseFloat(a.price);
      case 'discount': return (b.discount || 0) - (a.discount || 0);
      case 'featured': return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      default: return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const resetFilters = () => {
    setInStock(false);
    setOnlyDiscount(false);
    setPriceRange(null);
    setSelectedColors([]);
    setSelectedClothingSize('');
    setSelectedShoeSize('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="category-page">
      <Header searchTerm={searchTerm} onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }} />

      {/* Hero */}
      <div className="category-hero"
        style={categoryData?.image ? {
          backgroundImage: `url(${storageUrl(categoryData.image)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}>
        {categoryData?.image && <div className="category-hero-overlay" />}
        <div className="category-hero-content">
          <div className="category-breadcrumb">
            <Link to="/">Accueil</Link>
            <span>/</span>
            <Link to="/categories">Catégories</Link>
            <span>/</span>
            <span>{categoryName}</span>
          </div>
          <h1 className="category-hero-title">{categoryName?.toUpperCase()}</h1>
          <p className="category-hero-count">
            {categoryProducts.length} produit{categoryProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="category-layout">

        {/* Sidebar */}
        <aside className="category-sidebar">
          <div className="sidebar-header">
            <h3>Filtres</h3>
            <button className="sidebar-reset-all" onClick={resetFilters}>Tout réinitialiser</button>
          </div>

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

          {categoryName?.toLowerCase() !== 'chaussures' && 
 categoryName?.toLowerCase() !== 'accessoires' && (
  <div className="sidebar-block">
    <h3>Taille</h3>
    <div className="sidebar-sizes">
      {clothingSizes.map((size) => (
        <button key={size}
          className={`sidebar-size-btn ${selectedClothingSize === size ? 'active' : ''}`}
          onClick={() => { setSelectedClothingSize(selectedClothingSize === size ? '' : size); setSelectedShoeSize(''); setCurrentPage(1); }}>
          {size}
        </button>
      ))}
    </div>
  </div>
)}

{categoryName?.toLowerCase() === 'chaussures' && (
  <div className="sidebar-block">
    <h3>Pointure</h3>
    <div className="sidebar-sizes">
      {shoeSizes.map((size) => (
        <button key={size}
          className={`sidebar-size-btn ${selectedShoeSize === size ? 'active' : ''}`}
          onClick={() => { setSelectedShoeSize(selectedShoeSize === size ? '' : size); setSelectedClothingSize(''); setCurrentPage(1); }}>
          {size}
        </button>
      ))}
    </div>
  </div>
)}
{categoryName?.toLowerCase() === 'accessoires' && (
  <div className="sidebar-block">
    <h3>Taille
      <button className="sidebar-size-guide-btn" onClick={() => setShowSizeGuide(true)}>
        📏 Guide
      </button>
    </h3>
    <div className="sidebar-sizes">
      {['Taille unique', 'S/M', 'L/XL'].map((size) => (
        <button key={size}
          className={`sidebar-size-btn ${selectedClothingSize === size ? 'active' : ''}`}
          onClick={() => { setSelectedClothingSize(selectedClothingSize === size ? '' : size); setCurrentPage(1); }}>
          {size}
        </button>
      ))}
    </div>
  </div>
)}
        </aside>

        {/* Produits */}
        <div className="category-main">
          <div className="category-toolbar">
            {!loading && (
              <span className="category-count">
                {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            )}
            <div className="toolbar-right">
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
                <option value="newest">Trier : Plus récent</option>
                <option value="featured">Trier : En vedette</option>
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
              <p>😔 Aucun produit dans cette catégorie.</p>
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
      </div>

      {showScrollTop && (
        <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
      )}
{showSizeGuide && (
  <div className="pd-modal-overlay" onClick={() => setShowSizeGuide(false)}>
    <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
      <div className="pd-modal-header">
        <h3>📏 Guide des tailles — Accessoires</h3>
        <button onClick={() => setShowSizeGuide(false)}>✕</button>
      </div>
      <div className="pd-modal-body">
        <table className="pd-size-table">
          <thead>
            <tr>
              <th>Taille</th>
              <th>Tour de tête</th>
              <th>Tour de poignet</th>
              <th>Convient pour</th>
            </tr>
          </thead>
          <tbody>
            {[
              { size: 'Taille unique', head: '54-60 cm', wrist: '15-20 cm', fit: 'La plupart des adultes' },
              { size: 'S/M', head: '52-56 cm', wrist: '14-17 cm', fit: 'Femmes / Adolescents' },
              { size: 'L/XL', head: '57-62 cm', wrist: '17-21 cm', fit: 'Hommes / Grand gabarit' },
            ].map((row) => (
              <tr key={row.size}>
                <td><strong>{row.size}</strong></td>
                <td>{row.head}</td>
                <td>{row.wrist}</td>
                <td>{row.fit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="pd-size-guide-tip">
          💡 En cas de doute, optez pour la taille supérieure ou choisissez "Taille unique".
        </p>
      </div>
    </div>
  </div>
)}
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default CategoryPage;