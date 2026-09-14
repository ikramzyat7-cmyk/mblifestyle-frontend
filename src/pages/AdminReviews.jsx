import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminReviews.css';
import LoadingScreen from '../components/LoadingScreen';
function StarDisplay({ rating }) {
  return (
    <div className="star-display">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'star filled' : 'star'}>★</span>
      ))}
    </div>
  );
}

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    setLoading(true);
    api.get('/admin/reviews')
      .then((res) => {
        setReviews(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/reviews/${id}/approve`);
      setMessage('Avis approuvé !');
      fetchReviews();
    } catch (err) {
      setMessage('Erreur.');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/reviews/${id}/reject`);
      setMessage('Avis rejeté.');
      fetchReviews();
    } catch (err) {
      setMessage('Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setMessage('Avis supprimé.');
      fetchReviews();
    } catch (err) {
      setMessage('Erreur.');
    }
  };

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter((r) => r.status === filter);

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-header-bar">
          <h1>Avis clients</h1>
          <div className="orders-stats">
            <span className="orders-stat pending">{counts.pending} en attente</span>
            <span className="orders-stat confirmed">{counts.approved} approuvés</span>
            <span className="orders-stat cancelled">{counts.rejected} rejetés</span>
          </div>
        </div>

        {message && <p className="admin-message">{message}</p>}

        <div className="orders-filters">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              className={`orders-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvés' : 'Rejetés'}
              <span className="orders-filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingScreen />
        ) : filteredReviews.length === 0 ? (
          <p className="admin-loading">Aucun avis.</p>
        ) : (
          <div className="reviews-list">
            {filteredReviews.map((review) => (
              <div key={review.id} className={`review-card review-card-${review.status}`}>
                <div className="review-card-header">
                  <div className="review-avatar">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="review-info">
                    <p className="review-name">{review.name}</p>
                    {review.product && <p className="review-product">Produit : {review.product}</p>}
                    <StarDisplay rating={review.rating} />
                  </div>
                  <div className="review-meta">
                    <span className={`order-status-badge ${review.status === 'pending' ? 'pending' : review.status === 'approved' ? 'confirmed' : 'cancelled'}`}>
                      {review.status === 'pending' ? '⏳ En attente' : review.status === 'approved' ? '✓ Approuvé' : '✕ Rejeté'}
                    </span>
                    <span className="order-date">
                      {new Date(review.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <p className="review-comment">"{review.comment}"</p>

                <div className="review-actions">
                  {review.status !== 'approved' && (
                    <button className="order-btn-confirm" onClick={() => handleApprove(review.id)}>
                      ✓ Approuver
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button className="order-btn-cancel" onClick={() => handleReject(review.id)}>
                      ✕ Rejeter
                    </button>
                  )}
                  <button className="btn-table-delete" onClick={() => handleDelete(review.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminReviews;