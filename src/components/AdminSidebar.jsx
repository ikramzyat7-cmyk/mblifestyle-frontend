import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/logo.png';
import './AdminSidebar.css';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

function AdminSidebar() {
  const { currentUser } = useAuth();
const isOrderManager = currentUser?.role === 'order_manager';
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [categoriesOpen, setCategoriesOpen] = useState(
    location.pathname === '/admin/categories' ||
    (location.pathname === '/admin/produits' && new URLSearchParams(location.search).get('category') !== null)
  );
  const [openSubcategory, setOpenSubcategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [orderCounts, setOrderCounts] = useState({ pending: 0, confirmed: 0, cancelled: 0 });
  const [productCounts, setProductCounts] = useState({});

  const isActive = (path) => location.pathname === path;

const isActiveWithParams = (path, params = {}) => {
  if (location.pathname !== path) return false;
  const searchParams = new URLSearchParams(location.search);
  return Object.entries(params).every(([key, value]) => searchParams.get(key) === value);
};

const loadData = () => {
  api.get('/categories?admin=1').then((res) => setCategories(res.data));

  api.get('/orders').then((res) => {
    const orders = res.data;
    setOrderCounts({
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      delivered: orders.filter((o) => o.is_delivered).length,
      not_delivered: orders.filter((o) => !o.is_delivered && o.status === 'confirmed').length,
    });
  });

  api.get('/products').then((res) => {
    const counts = {};
    let inStock = 0, outOfStock = 0, featured = 0;
    res.data.forEach((p) => {
        counts[p.category] = (counts[p.category] || 0) + 1;
        if (p.stock > 0) inStock++;
        else outOfStock++;
        if (p.is_featured) featured++;
      });
      setProductCounts({ ...counts, _inStock: inStock, _outOfStock: outOfStock, _featured: featured });
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('refreshSidebar', loadData);
  
    // Polling toutes les 30 secondes pour détecter nouvelles commandes
    const interval = setInterval(() => {
      api.get('/orders').then((res) => {
        const orders = res.data;
        setOrderCounts({
          pending: orders.filter((o) => o.status === 'pending').length,
          confirmed: orders.filter((o) => o.status === 'confirmed').length,
          cancelled: orders.filter((o) => o.status === 'cancelled').length,
        });
      });
    }, 30000);
  
    return () => {
      window.removeEventListener('refreshSidebar', loadData);
      clearInterval(interval);
    };
  }, []);

const handleLogout = () => {
  api.post('/logout').finally(() => {
    localStorage.removeItem('admin_token');
    navigate('/mb-gestion-2026');
  });
};

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <img src={logo} alt="MBLIFESTYLE" />
        <span>MBLIFESTYLE</span>
      </div>

      <div className="admin-sidebar-section">
  <p className="admin-sidebar-label">General Menu</p>

  {!isOrderManager && (
    <Link to="/admin" className={`admin-sidebar-link ${isActive('/admin') ? 'active' : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
        <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
      </svg>
      Dashboard
    </Link>
  )}

  <Link to="/admin/produits" className={`admin-sidebar-link ${isActiveWithParams('/admin/produits', {}) && !location.search ? 'active' : ''}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeWidth="2" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeWidth="2" />
      <line x1="12" y1="22.08" x2="12" y2="12" strokeWidth="2" />
    </svg>
    Produits
  </Link>

  {!isOrderManager && (
    <>
      <Link to="/admin/produits?status=in_stock" className={`admin-sidebar-link ${isActiveWithParams('/admin/produits', { status: 'in_stock' }) ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d32" width="18" height="18">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
          <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
        </svg>
        En stock
        {productCounts._inStock > 0 && (
          <span className="admin-sidebar-count" style={{ backgroundColor: '#2e7d32', marginLeft: 'auto' }}>
            {productCounts._inStock}
          </span>
        )}
      </Link>

      <Link to="/admin/produits?status=out_of_stock" className={`admin-sidebar-link ${isActiveWithParams('/admin/produits', { status: 'out_of_stock' }) ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#e74c3c" width="18" height="18">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" />
          <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" />
        </svg>
        Rupture de stock
        {productCounts._outOfStock > 0 && (
          <span className="admin-sidebar-count" style={{ backgroundColor: '#e74c3c', marginLeft: 'auto' }}>
            {productCounts._outOfStock}
          </span>
        )}
      </Link>

      <Link to="/admin/produits?status=featured" className={`admin-sidebar-link ${isActiveWithParams('/admin/produits', { status: 'featured' }) ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#f5a623" width="18" height="18">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" />
        </svg>
        En vedette
        {productCounts._featured > 0 && (
          <span className="admin-sidebar-count" style={{ backgroundColor: '#f5a623', marginLeft: 'auto' }}>
            {productCounts._featured}
          </span>
        )}
      </Link>
    </>
  )}

  {/* Commandes — visible par tous */}
  <div>
    <div
      className={`admin-sidebar-link ${isActive('/admin/commandes') ? 'active' : ''}`}
      style={{ cursor: 'pointer' }}
      onClick={() => { navigate('/admin/commandes'); setOrdersOpen((prev) => !prev); }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeWidth="2" />
        <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
        <path d="M16 10a4 4 0 0 1-8 0" strokeWidth="2" />
      </svg>
      Commandes
      {orderCounts.pending > 0 && (
        <span className="admin-orders-badge">{orderCounts.pending}</span>
      )}
      <svg
        className={`admin-sidebar-chevron ${ordersOpen ? 'open' : ''}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14"
        style={{ marginLeft: orderCounts.pending > 0 ? '4px' : 'auto' }}
        onClick={(e) => { e.stopPropagation(); setOrdersOpen((prev) => !prev); }}
      >
        <polyline points="6 9 12 15 18 9" strokeWidth="2" />
      </svg>
    </div>

    {ordersOpen && (
      <div className="admin-sidebar-submenu">
        <Link to="/admin/commandes?status=pending" className="admin-sidebar-sublink">
          <span className="admin-sidebar-dot" style={{ backgroundColor: '#f59e0b' }}></span>
          En attente
          {orderCounts.pending > 0 && (
            <span className="admin-sidebar-count" style={{ backgroundColor: '#f59e0b' }}>{orderCounts.pending}</span>
          )}
        </Link>
        <Link to="/admin/commandes?status=confirmed" className="admin-sidebar-sublink">
          <span className="admin-sidebar-dot" style={{ backgroundColor: '#2e7d32' }}></span>
          Confirmées
          {orderCounts.confirmed > 0 && (
            <span className="admin-sidebar-count" style={{ backgroundColor: '#2e7d32' }}>{orderCounts.confirmed}</span>
          )}
        </Link>
        <Link to="/admin/commandes?status=cancelled" className="admin-sidebar-sublink">
          <span className="admin-sidebar-dot" style={{ backgroundColor: '#e74c3c' }}></span>
          Annulées
          {orderCounts.cancelled > 0 && (
            <span className="admin-sidebar-count" style={{ backgroundColor: '#e74c3c' }}>{orderCounts.cancelled}</span>
          )}
        </Link>
        <Link to="/admin/commandes?delivery=delivered" className={`admin-sidebar-sublink ${isActiveWithParams('/admin/commandes', { delivery: 'delivered' }) ? 'active' : ''}`}>
        <span className="admin-sidebar-dot" style={{ backgroundColor: '#2e7d32' }}></span>
        Livrées
        {orderCounts.delivered > 0 && (
          <span className="admin-sidebar-count" style={{ backgroundColor: '#2e7d32' }}>{orderCounts.delivered}</span>
        )}
      </Link>

      <Link to="/admin/commandes?delivery=not_delivered" className={`admin-sidebar-sublink ${isActiveWithParams('/admin/commandes', { delivery: 'not_delivered' }) ? 'active' : ''}`}>
      <span className="admin-sidebar-dot" style={{ backgroundColor: '#f59e0b' }}></span>
      Non livrées
      {orderCounts.not_delivered > 0 && (
        <span className="admin-sidebar-count" style={{ backgroundColor: '#f59e0b' }}>{orderCounts.not_delivered}</span>
      )}
    </Link>
      </div>
    )}
  </div>
</div>
{!isOrderManager && (

      <div className="admin-sidebar-section">
        <p className="admin-sidebar-label">Gestion</p>

        <div>
        <div
  className={`admin-sidebar-link admin-sidebar-expandable ${isActive('/admin/categories') ? 'active' : ''}`}
  style={{ cursor: 'pointer' }}
  onClick={() => navigate('/admin/categories')}
>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" strokeWidth="2" />
  </svg>
  Catégories
  <svg
    className={`admin-sidebar-chevron ${categoriesOpen ? 'open' : ''}`}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14"
    style={{ marginLeft: 'auto' }}
    onClick={(e) => {
      e.stopPropagation();
      setCategoriesOpen((prev) => !prev);
    }}
  >
    <polyline points="6 9 12 15 18 9" strokeWidth="2" />
  </svg>
</div>

{categoriesOpen && (
  <div className="admin-sidebar-submenu">
    {categories.map((cat) => (
      <div key={cat.id}>
        <Link
          to={`/admin/produits?category=${cat.slug}`}
          className={`admin-sidebar-sublink ${isActiveWithParams('/admin/produits', { category: cat.slug }) ? 'active' : ''}`}
          onClick={() => {
            if (cat.subcategories && cat.subcategories.length > 0) {
              setOpenSubcategory((prev) => prev === cat.id ? null : cat.id);
            }
          }}
        >
          <span className="admin-sidebar-dot"></span>
          {cat.name}
          {productCounts[cat.name] > 0 && (
            <span className="admin-sidebar-count">{productCounts[cat.name]}</span>
          )}
          {cat.subcategories && cat.subcategories.length > 0 && (
            <svg
              className={`admin-sidebar-chevron ${openSubcategory === cat.id ? 'open' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" width="12" height="12"
              style={{ marginLeft: 'auto' }}
            >
              <polyline points="6 9 12 15 18 9" strokeWidth="2" />
            </svg>
          )}
        </Link>

        {cat.subcategories && cat.subcategories.length > 0 && openSubcategory === cat.id && (
          <div className="admin-sidebar-subsubmenu">
            {cat.subcategories.map((sub) => (
              <Link
                key={sub}
                to={`/admin/produits?category=${cat.slug}&subcategory=${encodeURIComponent(sub)}`}
                className={`admin-sidebar-subsublink ${isActiveWithParams('/admin/produits', { category: cat.slug, subcategory: sub }) ? 'active' : ''}`}
              >
                <span className="admin-sidebar-subdot"></span>
                {sub}
              </Link>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
)}
        </div>

        <Link to="/admin/livraison" className={`admin-sidebar-link ${isActive('/admin/livraison') ? 'active' : ''}`}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
    <rect x="1" y="3" width="15" height="13" strokeWidth="2"/>
    <path d="M16 8h4l3 3v5h-7V8z" strokeWidth="2"/>
    <circle cx="5.5" cy="18.5" r="2.5" strokeWidth="2"/>
    <circle cx="18.5" cy="18.5" r="2.5" strokeWidth="2"/>
  </svg>
  Livraison
</Link>

<Link
  to="/admin/nouveautes"
  className={`admin-sidebar-link ${isActive('/admin/nouveautes') ? 'active' : ''}`}
>
  
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <polyline points="12 6 12 12 16 14" strokeWidth="2" />
          </svg>
          Nouveautés
        </Link>
        <Link to="/admin/avis" className={`admin-sidebar-link ${isActive('/admin/avis') ? 'active' : ''}`}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" />
  </svg>
  Avis clients
</Link>
<Link to="/admin/slides" className={`admin-sidebar-link ${isActive('/admin/slides') ? 'active' : ''}`}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
    <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
    <path d="M8 21h8M12 17v4" strokeWidth="2" />
  </svg>
  Bannières
</Link>
<Link to="/admin/banners" className={`admin-sidebar-link ${isActive('/admin/banners') ? 'active' : ''}`}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
    <rect x="2" y="7" width="20" height="14" rx="2" strokeWidth="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeWidth="2" />
  </svg>
  Bannières promo
</Link>
        <Link to="/admin/popup" className={`admin-sidebar-link ${isActive('/admin/popup') ? 'active' : ''}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
      <rect x="3" y="3" width="18" height="14" rx="2" strokeWidth="2" />
      <path d="M8 21h8M12 17v4" strokeWidth="2" />
    </svg>
    Popup promo
  </Link>
      </div>
)}
      <div className="admin-sidebar-section admin-sidebar-bottom">
  <p className="admin-sidebar-label">Compte</p>

  <button className="admin-sidebar-link admin-theme-toggle" onClick={toggleTheme}>
    {isDark ? (
      <>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
          <circle cx="12" cy="12" r="5" strokeWidth="2" />
          <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" />
          <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" />
          <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" />
          <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" />
        </svg>
        Mode clair
      </>
    ) : (
      <>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="2" />
        </svg>
        Mode sombre
      </>
    )}
  </button>
  {!isOrderManager && (
  <Link to="/admin/historique" className={`admin-sidebar-link ${isActive('/admin/historique') ? 'active' : ''}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <polyline points="12 6 12 12 16 14" strokeWidth="2" />
    </svg>
    Historique
  </Link>
)}
{!isOrderManager && (
  <Link to="/admin/admins" className={`admin-sidebar-link ${isActive('/admin/admins') ? 'active' : ''}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
      <circle cx="9" cy="7" r="4" strokeWidth="2" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
    </svg>
    Admins
  </Link>
)}
{!isOrderManager && (
  <Link to="/admin/parametres" className={`admin-sidebar-link ${isActive('/admin/parametres') ? 'active' : ''}`}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
    <circle cx="12" cy="12" r="3" strokeWidth="2" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeWidth="2" />
  </svg>
  Paramètres
</Link>
)}
  <button className="admin-sidebar-link admin-sidebar-logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" />
            <polyline points="16 17 21 12 16 7" strokeWidth="2" />
            <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;