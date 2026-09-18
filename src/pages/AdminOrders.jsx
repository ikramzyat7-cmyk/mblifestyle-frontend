import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminOrders.css';
import LoadingScreen from '../components/LoadingScreen';
const colorNames = {
  '#111111': 'Noir', '#ffffff': 'Blanc', '#1e3a8a': 'Bleu',
  '#888888': 'Gris', '#d8c3a5': 'Beige', '#c0392b': 'Rouge', '#2e7d32': 'Vert',
};

function ProductStockInfo({ productId }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/products/${productId}`).then((res) => setProduct(res.data));
  }, [productId]);

  if (!product) return null;

  const colors = product.colors || [];
  const sizes = product.sizes || [];

  return (
    <div className="order-stock-info">
      <p className="order-stock-title">Stock actuel :</p>
      {colors.length > 0 ? (
        <div className="order-stock-colors">
          {colors.map((c) => (
            <div key={c.hex} className="order-stock-color-row">
              <span className="order-item-color-dot" style={{ backgroundColor: c.hex }}></span>
              <span className="order-stock-color-name">
                {colorNames[c.hex] || c.hex} — Stock : <strong>{c.stock}</strong>
              </span>
              {c.sizes && c.sizes.length > 0 && (
                <div className="order-stock-sizes">
                  {c.sizes.map((s) => (
                    <span key={s.size} className={`order-stock-size-tag ${s.stock <= 0 ? 'out' : ''}`}>
                      {s.size} : {s.stock}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : sizes.length > 0 ? (
        <div className="order-stock-sizes-global">
          {sizes.map((s) => (
            <span key={s.size} className={`order-stock-size-tag ${s.stock <= 0 ? 'out' : ''}`}>
              {s.size} : {s.stock}
            </span>
          ))}
        </div>
      ) : (
        <span className="order-stock-size-tag">Stock global : {product.stock}</span>
      )}
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    const status = searchParams.get('status') || 'all';
    setFilter(status);
  }, [searchParams]);

  useEffect(() => {
    fetchOrders();
  }, []);
  useEffect(() => {
    const status = searchParams.get('status') || 'all';
    const delivery = searchParams.get('delivery') || 'all';
    setFilter(status);
    setDeliveryFilter(delivery);
  }, [searchParams]);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders').then((res) => {
      setOrders(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleConfirm = async (id) => {
    if (!window.confirm('Confirmer cette commande et mettre à jour le stock ?')) return;
    try {
      await api.patch(`/orders/${id}/confirm`);
      showMessage('✅ Commande confirmée et stock mis à jour !');
      fetchOrders();
      window.dispatchEvent(new Event('refreshSidebar'));
    } catch {
      showMessage('❌ Erreur lors de la confirmation.', 'error');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette commande ?')) return;
    try {
      await api.patch(`/orders/${id}/cancel`);
      showMessage('Commande annulée.');
      fetchOrders();
      window.dispatchEvent(new Event('refreshSidebar'));
    } catch {
      showMessage("Erreur lors de l'annulation.", 'error');
    }
  };

  const handleDeliver = async (id) => {
    if (!window.confirm('Marquer cette commande comme livrée ?')) return;
    try {
      await api.patch(`/orders/${id}/deliver`);
      showMessage('✅ Commande marquée comme livrée !');
      fetchOrders();
    } catch {
      showMessage('❌ Erreur lors de la mise à jour.', 'error');
    }
  };

  const handleUndeliver = async (id) => {
    if (!window.confirm('Marquer cette commande comme non livrée ?')) return;
    try {
      await api.patch(`/orders/${id}/undeliver`);
      showMessage('Commande marquée comme non livrée.');
      fetchOrders();
    } catch {
      showMessage('Erreur lors de la mise à jour.', 'error');
    }
  };

  // Filtre par statut
  let filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

    // Filtre livraison
  if (deliveryFilter === 'delivered') {
    filteredOrders = filteredOrders.filter((o) => o.is_delivered);
  } else if (deliveryFilter === 'not_delivered') {
    filteredOrders = filteredOrders.filter((o) => !o.is_delivered);
  }

  // Filtre recherche par code de suivi
  if (searchTerm.trim() !== '') {
    filteredOrders = filteredOrders.filter((o) =>
      o.order_code?.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    delivered: orders.filter((o) => o.is_delivered).length,
    not_delivered: orders.filter((o) => !o.is_delivered).length,
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header-bar">
          <h1>Commandes</h1>
          <div className="orders-stats">
            <span className="orders-stat pending">{counts.pending} en attente</span>
            <span className="orders-stat confirmed">{counts.confirmed} confirmées</span>
            <span className="orders-stat cancelled">{counts.cancelled} annulées</span>
            <span className="orders-stat delivered">{counts.delivered} livrées</span>
          </div>
        </div>

        {message && (
          <p className={`admin-message ${messageType === 'error' ? 'admin-message-error' : ''}`}>
            {message}
          </p>
        )}

                {/* Recherche par code de suivi */}
        <div className="orders-search">
          <input
            type="text"
            placeholder="🔍 Rechercher par code de suivi (ex: MB-1577)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="orders-search-input"
          />
        </div>

        {/* Filtre statut */}
        <div className="orders-filters">
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'pending', label: 'En attente' },
            { key: 'confirmed', label: 'Confirmées' },
            { key: 'cancelled', label: 'Annulées' },
          ].map((f) => (
            <button key={f.key}
              className={`orders-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}>
              {f.label}
              <span className="orders-filter-count">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        {/* Filtre livraison */}
        <div className="orders-delivery-filters">
          <span className="orders-delivery-label">🚚 Livraison :</span>
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'delivered', label: `✅ Livrées (${counts.delivered})` },
            { key: 'not_delivered', label: `⏳ Non livrées (${counts.not_delivered})` },
          ].map((f) => (
            <button key={f.key}
              className={`orders-delivery-btn ${deliveryFilter === f.key ? 'active' : ''}`}
              onClick={() => setDeliveryFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingScreen />
        ) : filteredOrders.length === 0 ? (
          <p className="admin-loading">Aucune commande.</p>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className={`order-card order-card-${order.status} ${order.is_delivered ? 'order-card-delivered' : ''}`}>
                <div className="order-card-header">
                  <div className="order-card-id">
                      <span>Commande #{order.id}</span>
                      {order.order_code && (
                        <span className="order-code-badge">{order.order_code}</span>
                      )}
                      <span className={`order-status-badge ${order.status}`}>
                      {order.status === 'pending' ? '⏳ En attente'
                        : order.status === 'confirmed' ? '✓ Confirmée'
                        : '✕ Annulée'}
                    </span>
                    {/* Badge livraison */}
                    <span className={`order-delivery-badge ${order.is_delivered ? 'delivered' : 'not-delivered'}`}>
                      {order.is_delivered ? '✅ Livrée' : '⏳ Non livrée'}
                    </span>
                  </div>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-customer">
                    <h4>Client</h4>
                    <p><strong>{order.customer_name}</strong></p>
                    <p>📞 {order.customer_phone}</p>
                    {order.customer_address && <p>📍 {order.customer_address}</p>}
                  </div>

                  <div className="order-items">
                    <h4>Articles ({order.items?.length})</h4>
                    {order.items?.map((item, i) => (
                      <div key={i} className="order-item">
                        <div className="order-item-info">
                          <span className="order-item-name">{item.product_name}</span>
                          <div className="order-item-details">
                            {item.color && (
                              <span className="order-item-detail">
                                <span className="order-item-color-dot" style={{ backgroundColor: item.color }}></span>
                                {colorNames[item.color] || item.color}
                              </span>
                            )}
                            {item.size && <span className="order-item-detail">Taille : {item.size}</span>}
                            <span className="order-item-detail">Qté : {item.quantity}</span>
                            <span className="order-item-price">{item.price} DH</span>
                          </div>
                          <ProductStockInfo productId={item.product_id} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-total">
                    <h4>Total</h4>
                    <p className="order-total-amount">{parseFloat(order.total).toFixed(2)} DH</p>
                  </div>
                </div>

                <div className="order-card-actions">
                  {/* Actions statut */}
                  {order.status === 'pending' && (
                    <>
                      <button className="order-btn-confirm" onClick={() => handleConfirm(order.id)}>
                        ✓ Confirmer
                      </button>
                      <button className="order-btn-cancel" onClick={() => handleCancel(order.id)}>
                        ✕ Annuler
                      </button>
                    </>
                  )}

                  {/* Actions livraison */}
                  {order.status === 'confirmed' && (
                    <>
                      {!order.is_delivered ? (
                        <button className="order-btn-deliver" onClick={() => handleDeliver(order.id)}>
                          🚚 Marquer comme livrée
                        </button>
                      ) : (
                        <button className="order-btn-undeliver" onClick={() => handleUndeliver(order.id)}>
                          ↩️ Marquer non livrée
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminOrders;