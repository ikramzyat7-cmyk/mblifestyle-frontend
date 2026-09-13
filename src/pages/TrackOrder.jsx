import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import api from '../api/axios';
import './TrackOrder.css';

const statusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

function TrackOrder() {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError(null);
    setOrder(null);
    setLoading(true);

    try {
      const res = await api.get(`/orders/track/${code.trim()}`);
      setOrder(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Commande introuvable. Vérifiez votre code.');
      } else {
        setError('Une erreur est survenue. Réessayez plus tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-page">
      <Header searchTerm="" onSearchChange={() => {}} />

      <div className="track-hero">
        <div className="track-breadcrumb">
          <Link to="/">Accueil</Link>
          <span>/</span>
          <span>Suivre ma commande</span>
        </div>
        <h1 className="track-title">Suivre ma commande</h1>
      </div>

      <div className="track-container">
        <form className="track-form" onSubmit={handleTrack}>
          <label>Entrez votre code de commande</label>
          <div className="track-form-row">
            <input
              type="text"
              placeholder="Ex: MB-1234"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Recherche...' : 'Suivre'}
            </button>
          </div>
          {error && <p className="track-error">{error}</p>}
        </form>

        {order && (
          <div className="track-result">
            <div className="track-result-header">
              <div>
                <p className="track-result-label">Code de commande</p>
                <p className="track-result-code">{order.order_code}</p>
              </div>
              <span className={`track-status track-status-${order.status}`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>

            <div className="track-result-meta">
              <p>📅 Commandée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}</p>
              <p>{order.is_delivered ? '✅ Livrée' : '🚚 Non livrée'}</p>
            </div>

            <div className="track-items">
              {order.items.map((item, i) => (
                <div key={i} className="track-item">
                  <div>
                    <p className="track-item-name">{item.product_name}</p>
                    <p className="track-item-variant">
                      {item.color && `${item.color}`}
                      {item.size && ` • Taille ${item.size}`}
                      {` • Qté ${item.quantity}`}
                    </p>
                  </div>
                  <span className="track-item-price">
                    {(parseFloat(item.price) * item.quantity).toFixed(2)} DH
                  </span>
                </div>
              ))}
            </div>

                        <div className="track-summary-rows">
              <div className="track-summary-row">
                <span>Sous-total</span>
                <span>{(parseFloat(order.total) - parseFloat(order.delivery_price || 0)).toFixed(2)} DH</span>
              </div>
              <div className="track-summary-row">
                <span>Livraison {order.delivery_city ? `(${order.delivery_city})` : ''}</span>
                <span>{parseFloat(order.delivery_price || 0) === 0 ? 'Gratuite' : `${parseFloat(order.delivery_price).toFixed(2)} DH`}</span>
              </div>
            </div>
            <div className="track-total">
              <span>Total</span>
              <span>{parseFloat(order.total).toFixed(2)} DH</span>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default TrackOrder;