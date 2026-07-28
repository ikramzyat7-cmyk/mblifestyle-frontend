import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';

const positionLabels = {
  'main': '⬅️ Grande bannière (gauche)',
  'top-right': '↗️ Petite bannière (haut droite)',
  'bottom-right': '↘️ Petite bannière (bas droite)',
};

function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    badge_text: '',
    link: '',
    image: null,
    position: 'main',
    is_active: true,
  });

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = () => {
    setLoading(true);
    api.get('/admin/banners').then((res) => {
      setBanners(res.data);
      setLoading(false);
    });
  };

  const resetForm = () => {
    setForm({ title: '', subtitle: '', badge_text: '', link: '', image: null, position: 'main', is_active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      badge_text: banner.badge_text || '',
      link: banner.link || '',
      image: null,
      position: banner.position,
      is_active: banner.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('subtitle', form.subtitle);
    formData.append('badge_text', form.badge_text);
    formData.append('link', form.link);
    formData.append('position', form.position);
    formData.append('is_active', form.is_active ? 1 : 0);
    if (form.image) formData.append('image', form.image);

    try {
      if (editingId) {
        formData.append('_method', 'PUT');
        await api.post(`/banners/${editingId}`, formData);
        setMessage('Bannière modifiée !');
      } else {
        await api.post('/banners', formData);
        setMessage('Bannière ajoutée !');
      }
      resetForm();
      fetchBanners();
    } catch (err) {
      setMessage('Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette bannière ?')) return;
    await api.delete(`/banners/${id}`);
    setMessage('Bannière supprimée.');
    fetchBanners();
  };

  const toggleActive = async (banner) => {
    const formData = new FormData();
    formData.append('is_active', banner.is_active ? '0' : '1');
    formData.append('_method', 'PUT');
    await api.post(`/banners/${banner.id}`, formData);
    fetchBanners();
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header-bar">
          <div>
            <h1>Bannières promotionnelles</h1>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              3 positions disponibles : grande gauche + 2 petites droite
            </p>
          </div>
          <button className="btn-add-product" onClick={() => setShowForm(true)}>
            + Ajouter une bannière
          </button>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {/* Aperçu des positions */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '24px', height: '120px' }}>
          <div style={{ background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#888', border: '2px dashed #ccc' }}>
            ⬅️ Grande bannière (main)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#888', border: '2px dashed #ccc' }}>↗️ Haut droite</div>
            <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#888', border: '2px dashed #ccc' }}>↘️ Bas droite</div>
          </div>
        </div>

        {showForm && (
          <div className="admin-modal-overlay" onClick={resetForm}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <button className="admin-modal-close" onClick={resetForm}>✕</button>
              <form className="admin-form" onSubmit={handleSubmit}>
                <h2>{editingId ? 'Modifier la bannière' : 'Ajouter une bannière'}</h2>

                <div className="apf-field">
                  <label>Position *</label>
                  <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                    {Object.entries(positionLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="apf-field">
                  <label>Titre</label>
                  <input type="text" placeholder="Ex: SOLDES D'ÉTÉ" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>

                <div className="apf-field">
                  <label>Sous-titre</label>
                  <input type="text" placeholder="Ex: Jusqu'à -70% sur une sélection" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                </div>

                <div className="apf-field">
                  <label>Badge (ex: -70%, NOUVEAU...)</label>
                  <input type="text" placeholder="Ex: -50%" value={form.badge_text} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} />
                </div>

                <div className="apf-field">
                  <label>Lien (clic sur la bannière)</label>
                  <input type="text" placeholder="Ex: /catalogue" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
                </div>

                <div className="apf-field">
                  <label>Image de fond</label>
                  <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
                </div>

                <label className="apf-checkbox">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                  Bannière active
                </label>

                <div className="form-buttons">
                  <button type="submit">{editingId ? 'Enregistrer' : 'Ajouter'}</button>
                  <button type="button" className="btn-cancel" onClick={resetForm}>Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p className="admin-loading">Chargement...</p>
        ) : (
          <div className="slides-list">
            {banners.length === 0 ? (
              <p className="admin-loading">Aucune bannière — ajoutez-en une !</p>
            ) : (
              banners.map((banner) => (
                <div key={banner.id} className={`slide-card ${!banner.is_active ? 'inactive' : ''}`}>
                  <div className="slide-card-image">
                    {banner.image ? (
                      <img src={`https://mblifestyle-backend-production.up.railway.app/storage/${banner.image}`} alt={banner.title} />
                    ) : (
                      <div className="slide-card-placeholder">Pas d'image</div>
                    )}
                  </div>
                  <div className="slide-card-info">
                    <h3>{banner.title || '(Sans titre)'}</h3>
                    <p style={{ fontSize: '12px', color: '#888' }}>{positionLabels[banner.position]}</p>
                    {banner.subtitle && <p className="slide-subtitle">{banner.subtitle}</p>}
                    {banner.badge_text && <p style={{ fontSize: '12px', color: '#cc0000', fontWeight: '700' }}>Badge : {banner.badge_text}</p>}
                  </div>
                  <div className="slide-card-actions">
                    <button className={`ac-visibility-btn ${banner.is_active ? 'visible' : 'hidden'}`} onClick={() => toggleActive(banner)}>
                      {banner.is_active ? '👁 Visible' : '🙈 Caché'}
                    </button>
                    <button className="btn-table-edit" onClick={() => handleEdit(banner)}>Modifier</button>
                    <button className="btn-table-delete" onClick={() => handleDelete(banner.id)}>Supprimer</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminBanners;