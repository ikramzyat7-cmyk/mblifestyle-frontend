import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminPopup.css';
import { storageUrl } from '../api/config';
function AdminPopup() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    is_active: false,
    product_ids: [],
    title: 'Ne ratez pas cette offre !',
    subtitle: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/popup'),
    ]).then(([productsRes, popupRes]) => {
      setProducts(productsRes.data);
      if (popupRes.data) {
        setForm({
          is_active: !!popupRes.data.is_active,
          product_ids: popupRes.data.product_ids || [],
          title: popupRes.data.title || 'Ne ratez pas cette offre !',
          subtitle: popupRes.data.subtitle || '',
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/popup', form);
      setMessage('Popup mis à jour avec succès !');
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors de la mise à jour.');
    }
  };

  const selectedProducts = products.filter((p) => form.product_ids.includes(p.id));

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-header-bar">
          <h1>Popup promotionnel</h1>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {loading ? (
          <p className="admin-loading">Chargement...</p>
        ) : (
          <div className="popup-admin-layout">
            <form className="popup-admin-form" onSubmit={handleSubmit}>
              <div className="apf-card">
                <h3>Paramètres du popup</h3>

                <div className="apf-field">
                  <label className="apf-checkbox">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    Activer le popup sur le site
                  </label>
                </div>

                <div className="apf-field">
                  <label>Titre du popup *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ne ratez pas cette offre !"
                  />
                </div>

                <div className="apf-field">
                  <label>Sous-titre (optionnel)</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="Profitez de -20% sur cette pièce exclusive"
                  />
                </div>

                <div className="apf-field">
                  <label>Produits à mettre en avant (max 3)</label>
                  <div className="popup-products-list">
                    {products.map((p) => (
                      <label key={p.id} className="popup-product-checkbox">
                        <input
                          type="checkbox"
                          checked={form.product_ids.includes(p.id)}
                          disabled={!form.product_ids.includes(p.id) && form.product_ids.length >= 3}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm((prev) => ({ ...prev, product_ids: [...prev.product_ids, p.id] }));
                            } else {
                              setForm((prev) => ({ ...prev, product_ids: prev.product_ids.filter((id) => id !== p.id) }));
                            }
                          }}
                        />
                        <span>{p.name} — {p.price} DH{p.discount > 0 ? ` (-${p.discount}%)` : ''}</span>
                      </label>
                    ))}
                  </div>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
                    {form.product_ids.length}/3 produits sélectionnés
                  </p>
                </div>

                <button type="submit" className="apf-btn-submit">
                  Enregistrer les paramètres
                </button>
              </div>
            </form>

            <div className="popup-admin-preview">
              <h3>Aperçu</h3>
              {selectedProducts.length > 0 ? (
                <div className="popup-preview-list">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="popup-preview-card">
                      {product.images?.[0] && (
                        <div className="popup-preview-image">
                          <img
                            src={`${storageUrl(product.images[0])}`}
                            alt={product.name}
                          />
                          {product.discount > 0 && (
                            <div className="promo-popup-badge">-{product.discount}%</div>
                          )}
                        </div>
                      )}
                      <div className="popup-preview-info">
                        <p className="popup-preview-label">Offre spéciale</p>
                        <h4>{form.title}</h4>
                        {form.subtitle && <p className="popup-preview-subtitle">{form.subtitle}</p>}
                        <p className="popup-preview-name">{product.name}</p>
                        <p className="popup-preview-price">
                          {product.discount > 0 ? (
                            <>
                              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '13px' }}>
                                {parseFloat(product.price).toFixed(2)} DH
                              </span>
                              {' '}
                              <span style={{ color: '#e74c3c', fontWeight: 700 }}>
                                {(product.price - (product.price * product.discount / 100)).toFixed(2)} DH
                              </span>
                            </>
                          ) : (
                            <span style={{ fontWeight: 700 }}>{product.price} DH</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="admin-loading">Sélectionnez jusqu'à 3 produits pour voir l'aperçu</p>
              )}

              <div className={`popup-status-badge ${form.is_active ? 'active' : 'inactive'}`}>
                {form.is_active ? '✓ Popup activé' : '✕ Popup désactivé'}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPopup;