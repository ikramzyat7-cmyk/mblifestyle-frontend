import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminSlides.css';
import { storageUrl } from '../api/config';
function AdminSlides() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    image: null,
    video: null,
    type: 'image',
    style: 'default',
    promo_amount: '',
    promo_sub: '',
    product_image: null,
    is_active: true,
    order: 0,
  });

  useEffect(() => { fetchSlides(); }, []);

  const fetchSlides = () => {
    setLoading(true);
    api.get('/admin/slides').then((res) => {
      setSlides(res.data);
      setLoading(false);
    });
  };

  const resetForm = () => {
    setForm({
      title: '', subtitle: '', button_text: '', button_link: '',
      image: null, video: null, type: 'image', style: 'default',
      promo_amount: '', promo_sub: '', product_image: null,
      is_active: true, order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (slide) => {
    setEditingId(slide.id);
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      button_text: slide.button_text || '',
      button_link: slide.button_link || '',
      image: null,
      video: null,
      type: slide.type || 'image',
      style: slide.style || 'default',
      promo_amount: slide.promo_amount || '',
      promo_sub: slide.promo_sub || '',
      product_image: null,
      is_active: slide.is_active,
      order: slide.order || 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('subtitle', form.subtitle);
    formData.append('button_text', form.button_text);
    formData.append('button_link', form.button_link);
    formData.append('is_active', form.is_active ? 1 : 0);
    formData.append('order', form.order);
    formData.append('type', form.type);
    formData.append('style', form.style);
    formData.append('promo_amount', form.promo_amount || '');
    formData.append('promo_sub', form.promo_sub || '');
    if (form.video) formData.append('video', form.video);
    if (form.image) formData.append('image', form.image);
    if (form.product_image) formData.append('product_image', form.product_image);

    try {
      if (editingId) {
        formData.append('_method', 'PUT');
        await api.post(`/slides/${editingId}`, formData);
        setMessage('Slide modifié !');
      } else {
        await api.post('/slides', formData);
        setMessage('Slide ajouté !');
      }
      resetForm();
      fetchSlides();
    } catch (err) {
      setMessage('Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce slide ?')) return;
    await api.delete(`/slides/${id}`);
    setMessage('Slide supprimé.');
    fetchSlides();
  };

  const toggleActive = async (slide) => {
    const formData = new FormData();
    formData.append('is_active', slide.is_active ? '0' : '1');
    formData.append('_method', 'PUT');
    try {
      await api.post(`/slides/${slide.id}`, formData);
      fetchSlides();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header-bar">
          <h1>Bannières / Slider</h1>
          <button className="btn-add-product" onClick={() => setShowForm(true)}>
            + Ajouter un slide
          </button>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {showForm && (
          <div className="admin-modal-overlay" onClick={resetForm}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <button className="admin-modal-close" onClick={resetForm}>✕</button>
              <form className="admin-form" onSubmit={handleSubmit}>
                <h2>{editingId ? 'Modifier le slide' : 'Ajouter un slide'}</h2>

                {/* Style */}
                <div className="apf-field">
                  <label>Style du slide</label>
                  <select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
                    <option value="default">Standard (image/vidéo plein écran)</option>
                    <option value="fagor-banner">Bannière Fagor (fond noir + photo produit)</option>
                  </select>
                </div>

                {/* Champs communs */}
                <div className="apf-field">
                  <label>Titre</label>
                  <input type="text" placeholder="Ex: SOLDE D'ÉTÉ" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>

                {form.style === 'default' && (
                  <div className="apf-field">
                    <label>Sous-titre</label>
                    <input type="text" placeholder="Ex: Découvrez nos dernières pièces" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                  </div>
                )}

                {/* Champs spécifiques bannière Fagor */}
                {form.style === 'fagor-banner' && (
                  <>
                    <div className="apf-field">
                      <label>Montant économie (ex: 150$, -35%)</label>
                      <input type="text" placeholder="Ex: 150$" value={form.promo_amount} onChange={(e) => setForm({ ...form, promo_amount: e.target.value })} />
                    </div>
                    <div className="apf-field">
                      <label>Texte sous le montant</label>
                      <input type="text" placeholder="Ex: à l'achat de n'importe quel ensemble Fagor" value={form.promo_sub} onChange={(e) => setForm({ ...form, promo_sub: e.target.value })} />
                    </div>
                    <div className="apf-field">
                      <label>Photo produit droite (PNG sans fond recommandé)</label>
                      <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, product_image: e.target.files[0] })} />
                    </div>
                  </>
                )}

                <div className="apf-field-row">
                  <div className="apf-field">
                    <label>Texte du bouton</label>
                    <input type="text" placeholder="Ex: Découvrir" value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} />
                  </div>
                  <div className="apf-field">
                    <label>Lien du bouton</label>
                    <input type="text" placeholder="Ex: /catalogue" value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })} />
                  </div>
                </div>

                {/* Type image/vidéo — seulement pour default */}
                {form.style === 'default' && (
                  <>
                    <div className="apf-field">
                      <label>Type de slide</label>
                      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        <option value="image">Image</option>
                        <option value="video">Vidéo</option>
                      </select>
                    </div>
                    {form.type === 'image' ? (
                      <div className="apf-field">
                        <label>Image du slide</label>
                        <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0], video: null })} />
                      </div>
                    ) : (
                      <div className="apf-field">
                        <label>Vidéo du slide (MP4, WebM — max 50MB)</label>
                        <input type="file" accept="video/mp4,video/webm,video/mov" onChange={(e) => setForm({ ...form, video: e.target.files[0], image: null })} />
                      </div>
                    )}
                  </>
                )}

                <div className="apf-field-row">
                  <div className="apf-field">
                    <label>Ordre d'affichage</label>
                    <input type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                  </div>
                  <div className="apf-field">
                    <label className="apf-checkbox">
                      <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                      Activer ce slide
                    </label>
                  </div>
                </div>

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
            {slides.length === 0 ? (
              <p className="admin-loading">Aucun slide — ajoutez-en un !</p>
            ) : (
              slides.map((slide) => (
                <div key={slide.id} className={`slide-card ${!slide.is_active ? 'inactive' : ''}`}>
                  <div className="slide-card-image">
                    {slide.product_image ? (
                      <img src={`${storageUrl(slide.product_image)}`} alt={slide.title} />
                    ) : slide.image ? (
                      <img src={`${storageUrl(slide.image)}`} alt={slide.title} />
                    ) : (
                      <div className="slide-card-placeholder">
                        {slide.type === 'video' ? '🎬 Vidéo' : 'Pas d\'image'}
                      </div>
                    )}
                    {slide.style === 'fagor-banner' && (
                      <span style={{ position: 'absolute', top: '6px', left: '6px', background: '#cc0000', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: '700' }}>
                        BANNIÈRE
                      </span>
                    )}
                  </div>
                  <div className="slide-card-info">
                    <h3>{slide.title || '(Sans titre)'}</h3>
                    {slide.subtitle && <p className="slide-subtitle">{slide.subtitle}</p>}
                    {slide.promo_amount && <p style={{ fontSize: '12px', color: '#cc0000', fontWeight: '700' }}>Économie : {slide.promo_amount}</p>}
                    {slide.button_text && (
                      <p className="slide-btn-preview">Bouton : <strong>{slide.button_text}</strong> → {slide.button_link}</p>
                    )}
                    <p className="slide-order">Ordre : {slide.order}</p>
                  </div>
                  <div className="slide-card-actions">
                    <button className={`ac-visibility-btn ${slide.is_active ? 'visible' : 'hidden'}`} onClick={() => toggleActive(slide)}>
                      {slide.is_active ? '👁 Visible' : '🙈 Caché'}
                    </button>
                    <button className="btn-table-edit" onClick={() => handleEdit(slide)}>Modifier</button>
                    <button className="btn-table-delete" onClick={() => handleDelete(slide.id)}>Supprimer</button>
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

export default AdminSlides;