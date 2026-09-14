import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminActivityLog.css';
import LoadingScreen from '../components/LoadingScreen';
const actionConfig = {
  product_created:  { label: 'Produit ajouté',      color: '#2e7d32', icon: '➕' },
  product_updated:  { label: 'Produit modifié',      color: '#1e3a8a', icon: '✏️' },
  product_deleted:  { label: 'Produit supprimé',     color: '#e74c3c', icon: '🗑' },
  order_confirmed:  { label: 'Commande confirmée',   color: '#2e7d32', icon: '✓' },
  order_cancelled:  { label: 'Commande annulée',     color: '#e74c3c', icon: '✕' },
  category_created: { label: 'Catégorie ajoutée',    color: '#2e7d32', icon: '📁' },
  category_updated: { label: 'Catégorie modifiée',   color: '#1e3a8a', icon: '📁' },
  category_deleted: { label: 'Catégorie supprimée',  color: '#e74c3c', icon: '📁' },
};

function AdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filter, page]);

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.append('action', filter);
    if (search) params.append('search', search);
    params.append('page', page);

    api.get(`/activity-logs?${params.toString()}`)
      .then((res) => {
        setLogs(res.data.data);
        setMeta(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleClear = async () => {
    if (!window.confirm('Effacer tout l\'historique ?')) return;
    try {
      await api.delete('/activity-logs');
      setMessage('Historique effacé.');
      fetchLogs();
    } catch (err) {
      setMessage('Erreur.');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-header-bar">
          <h1>Historique des modifications</h1>
          <button className="btn-table-delete" onClick={handleClear}>
            🗑 Effacer l'historique
          </button>
        </div>

        {message && <p className="admin-message">{message}</p>}

        <div className="al-toolbar">
          <div className="admin-search-wrapper" style={{ maxWidth: '300px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" className="admin-search-icon">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
              className="admin-search-input"
            />
          </div>

          <div className="orders-filters" style={{ margin: 0 }}>
            {['all', 'product_created', 'product_updated', 'product_deleted', 'order_confirmed', 'order_cancelled'].map((f) => (
              <button
                key={f}
                className={`orders-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => { setFilter(f); setPage(1); }}
              >
                {f === 'all' ? 'Tout' : actionConfig[f]?.label || f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingScreen />
        ) : logs.length === 0 ? (
          <p className="admin-loading">Aucune activité enregistrée.</p>
        ) : (
          <>
            <div className="al-list">
              {logs.map((log) => {
                const config = actionConfig[log.action] || { label: log.action, color: '#888888', icon: '•' };
                return (
                  <div key={log.id} className="al-item">
                    <div className="al-icon" style={{ backgroundColor: config.color + '20', color: config.color }}>
                      {config.icon}
                    </div>

                    <div className="al-content">
                      <div className="al-header">
                        <span className="al-badge" style={{ backgroundColor: config.color + '20', color: config.color }}>
                          {config.label}
                        </span>
                        {log.model && log.model_id && (
                          <span className="al-model">
                            {log.model} #{log.model_id}
                          </span>
                        )}
                      </div>
                      <p className="al-description">{log.description}</p>

                      {log.changes && (
                        <div className="al-changes">
                          {Object.entries(log.changes).map(([key, val]) => (
                            <span key={key} className="al-change-tag">
                              {key} : <strong>{val.avant}</strong> → <strong>{val.après}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="al-meta">
                      <span className="al-admin">{log.admin_email}</span>
                      <span className="al-date">{formatDate(log.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {meta && meta.last_page > 1 && (
              <div className="al-pagination">
                <button
                  className="orders-filter-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Précédent
                </button>
                <span style={{ fontSize: '13px', color: '#888' }}>
                  Page {meta.current_page} / {meta.last_page}
                </span>
                <button
                  className="orders-filter-btn"
                  disabled={page === meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminActivityLog;