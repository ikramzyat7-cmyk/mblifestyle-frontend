import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminSettings.css';

function AdminSettings() {
  const [form, setForm] = useState({
    whatsapp_number: '',
    email: '',
    shop_name: '',
    instagram_url: '',
    address: '',
    working_hours: '',
    promo_banner: '',
    nouveautes_image: '',
    nouveautes_image_file: null,
    promo_title: '',
    promo_text: '',
    promo_btn: '',
    promo_link: '',
    promo_image: '',
    promo_image_file: null,
    lookbook_title_1: '', lookbook_link_1: '', lookbook_image_1: '',
    lookbook_title_2: '', lookbook_link_2: '', lookbook_image_2: '',
    lookbook_title_3: '', lookbook_link_3: '', lookbook_image_3: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings').then((res) => {
      setForm((prev) => ({
        ...prev,
        whatsapp_number: res.data.whatsapp_number || '',
        email: res.data.email || '',
        shop_name: res.data.shop_name || '',
        instagram_url: res.data.instagram_url || '',
        address: res.data.address || '',
        working_hours: res.data.working_hours || '',
        promo_banner: res.data.promo_banner || '',
        nouveautes_image: res.data.nouveautes_image || '',
        promo_title: res.data.promo_title || '',
        promo_text: res.data.promo_text || '',
        promo_btn: res.data.promo_btn || '',
        promo_link: res.data.promo_link || '',
        promo_image: res.data.promo_image || '',
        lookbook_title_1: res.data.lookbook_title_1 || '',
        lookbook_link_1: res.data.lookbook_link_1 || '',
        lookbook_image_1: res.data.lookbook_image_1 || '',
        lookbook_title_2: res.data.lookbook_title_2 || '',
        lookbook_link_2: res.data.lookbook_link_2 || '',
        lookbook_image_2: res.data.lookbook_image_2 || '',
        lookbook_title_3: res.data.lookbook_title_3 || '',
        lookbook_link_3: res.data.lookbook_link_3 || '',
        lookbook_image_3: res.data.lookbook_image_3 || '',
      }));
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('whatsapp_number', form.whatsapp_number);
      formData.append('email', form.email);
      formData.append('shop_name', form.shop_name);
      formData.append('instagram_url', form.instagram_url);
      formData.append('address', form.address);
      formData.append('working_hours', form.working_hours);
      formData.append('promo_banner', form.promo_banner);
      formData.append('promo_title', form.promo_title);
      formData.append('promo_text', form.promo_text);
      formData.append('promo_btn', form.promo_btn);
      formData.append('promo_link', form.promo_link);
      formData.append('lookbook_title_1', form.lookbook_title_1 || '');
      formData.append('lookbook_link_1', form.lookbook_link_1 || '');
      formData.append('lookbook_title_2', form.lookbook_title_2 || '');
      formData.append('lookbook_link_2', form.lookbook_link_2 || '');
      formData.append('lookbook_title_3', form.lookbook_title_3 || '');
      formData.append('lookbook_link_3', form.lookbook_link_3 || '');
      if (form.lookbook_image_1_file) formData.append('lookbook_image_1_file', form.lookbook_image_1_file);
      if (form.lookbook_image_2_file) formData.append('lookbook_image_2_file', form.lookbook_image_2_file);
      if (form.lookbook_image_3_file) formData.append('lookbook_image_3_file', form.lookbook_image_3_file);
      if (form.nouveautes_image_file) {
        formData.append('nouveautes_image_file', form.nouveautes_image_file);
      }
      if (form.promo_image_file) {
        formData.append('promo_image_file', form.promo_image_file);
      }
      await api.post('/settings', formData);
      setMessage('Paramètres enregistrés avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors de la sauvegarde.');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header-bar">
          <h1>Paramètres</h1>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {loading ? (
          <p className="admin-loading">Chargement...</p>
        ) : (
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="settings-grid">

              {/* ===== INFOS GÉNÉRALES ===== */}
              <div className="apf-card">
                <h3>Informations générales</h3>
                <div className="apf-field">
                  <label>Nom de la boutique</label>
                  <input type="text" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} placeholder="FAGOR" />
                </div>
                <div className="apf-field">
                  <label>Adresse</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Casablanca, Maroc" />
                </div>
                <div className="apf-field">
                  <label>Horaires d'ouverture</label>
                  <input type="text" value={form.working_hours} onChange={(e) => setForm({ ...form, working_hours: e.target.value })} placeholder="Lun-Sam : 10h - 19h" />
                </div>
                <div className="apf-field">
                  <label>Bandeau promo (navbar)</label>
                  <input type="text" value={form.promo_banner} onChange={(e) => setForm({ ...form, promo_banner: e.target.value })} placeholder="Ex: 🔥 Soldes jusqu'à -50% !" />
                  <small style={{ color: '#888', fontSize: '11px' }}>Laissez vide pour masquer le bandeau</small>
                </div>
              </div>

              {/* ===== CONTACT ===== */}
              <div className="apf-card">
                <h3>Contact & Réseaux sociaux</h3>
                <div className="apf-field">
                  <label>Numéro WhatsApp</label>
                  <div className="settings-input-with-prefix">
                    <span className="settings-prefix">+</span>
                    <input type="text" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="212600000000" />
                  </div>
                  <small style={{ color: '#888', fontSize: '11px' }}>Format : 212XXXXXXXXX</small>
                </div>
                <div className="apf-field">
                  <label>Email de contact</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@fagor.com" />
                </div>
                <div className="apf-field">
                  <label>Lien Instagram</label>
                  <div className="settings-input-with-prefix">
                    <span className="settings-prefix">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                        <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="2" />
                        <circle cx="12" cy="12" r="4" strokeWidth="2" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    </span>
                    <input type="text" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} placeholder="https://instagram.com/fagor" />
                  </div>
                </div>
              </div>

              {/* ===== BANNIÈRE PROMO MILIEU ===== */}
              <div className="apf-card">
                <h3>🎯 Bannière promotionnelle milieu page</h3>
                <p className="apf-photo-hint">Bannière affichée sous "Nos catégories" avec photo à droite</p>
                <div className="apf-field">
                  <label>Titre principal</label>
                  <input type="text" value={form.promo_title} onChange={(e) => setForm({ ...form, promo_title: e.target.value })} placeholder="Ex: SOLDES D'ÉTÉ" />
                </div>
                <div className="apf-field">
                  <label>Texte promotion</label>
                  <input type="text" value={form.promo_text} onChange={(e) => setForm({ ...form, promo_text: e.target.value })} placeholder="Ex: Jusqu'à -35% — stock limité" />
                </div>
                <div className="apf-field-row">
                  <div className="apf-field">
                    <label>Texte bouton</label>
                    <input type="text" value={form.promo_btn} onChange={(e) => setForm({ ...form, promo_btn: e.target.value })} placeholder="Ex: J'EN PROFITE" />
                  </div>
                  <div className="apf-field">
                    <label>Lien bouton</label>
                    <input type="text" value={form.promo_link} onChange={(e) => setForm({ ...form, promo_link: e.target.value })} placeholder="Ex: /catalogue" />
                  </div>
                </div>
                <div className="apf-field">
                  <label>Photo produit (droite)</label>
                  <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, promo_image_file: e.target.files[0] })} />
                  {form.promo_image && !form.promo_image_file && (
                    <img src={`http://127.0.0.1:8000/storage/${form.promo_image}`} alt="Promo" style={{ width: '120px', height: '80px', objectFit: 'contain', marginTop: '8px', borderRadius: '6px', border: '1px solid #e0e0e0' }} />
                  )}
                  {form.promo_image_file && (
                    <img src={URL.createObjectURL(form.promo_image_file)} alt="Aperçu" style={{ width: '120px', height: '80px', objectFit: 'contain', marginTop: '8px', borderRadius: '6px', border: '1px solid #cc0000' }} />
                  )}
                </div>
              </div>

              {/* ===== IMAGE NOUVEAUTÉS ===== */}
              <div className="apf-card">
                <h3>🖼 Image section Nouveautés</h3>
                <p className="apf-photo-hint">Grande image affichée à gauche de la section "Nouveautés"</p>
                <div className="apf-field">
                  <label className="apf-upload-zone" style={{ cursor: 'pointer' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setForm({ ...form, nouveautes_image_file: e.target.files[0] })} />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28">
                      <polyline points="16 16 12 12 8 16" strokeWidth="2" />
                      <line x1="12" y1="12" x2="12" y2="21" strokeWidth="2" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" strokeWidth="2" />
                    </svg>
                    <span>{form.nouveautes_image_file ? `✓ ${form.nouveautes_image_file.name}` : 'Cliquer pour uploader'}</span>
                    <span className="apf-upload-hint">PNG, JPG, WEBP — recommandé : 400x460px</span>
                  </label>
                </div>
                {form.nouveautes_image && !form.nouveautes_image_file && (
                  <img src={`http://127.0.0.1:8000/storage/${form.nouveautes_image}`} alt="Nouveautés" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e0e0', marginTop: '12px' }} />
                )}
                {form.nouveautes_image_file && (
                  <img src={URL.createObjectURL(form.nouveautes_image_file)} alt="Aperçu" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cc0000', marginTop: '12px' }} />
                )}
              </div>
              <div className="apf-card">
  <h3>📸 Lookbook — Collections</h3>
  <p className="apf-photo-hint">3 photos ambiance affichées sur la page d'accueil</p>

  {[1, 2, 3].map((n) => (
    <div key={n} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--admin-border)' }}>
      <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Photo {n}</p>
      <div className="apf-field-row">
        <div className="apf-field">
          <label>Titre</label>
          <input
            type="text"
            value={form[`lookbook_title_${n}`] || ''}
            onChange={(e) => setForm({ ...form, [`lookbook_title_${n}`]: e.target.value })}
            placeholder="Ex: Collection Été 2026"
          />
        </div>
        <div className="apf-field">
          <label>Lien</label>
          <input
            type="text"
            value={form[`lookbook_link_${n}`] || ''}
            onChange={(e) => setForm({ ...form, [`lookbook_link_${n}`]: e.target.value })}
            placeholder="Ex: /categorie/t-shirts"
          />
        </div>
      </div>
      <div className="apf-field">
        <label>Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, [`lookbook_image_${n}_file`]: e.target.files[0] })}
        />
        {form[`lookbook_image_${n}`] && !form[`lookbook_image_${n}_file`] && (
          <img
            src={`http://127.0.0.1:8000/storage/${form[`lookbook_image_${n}`]}`}
            alt={`Lookbook ${n}`}
            style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px' }}
          />
        )}
      </div>
    </div>
  ))}
</div>
              {/* ===== APERÇU ===== */}
              <div className="settings-preview">
                <h3>Aperçu</h3>
                <div className="settings-preview-card">
                  {[
                    { label: 'Boutique', value: form.shop_name },
                    { label: 'WhatsApp', value: `+${form.whatsapp_number}` },
                    { label: 'Email', value: form.email },
                    { label: 'Adresse', value: form.address },
                    { label: 'Horaires', value: form.working_hours },
                    { label: 'Bandeau promo', value: form.promo_banner || 'Masqué' },
                    { label: 'Bannière titre', value: form.promo_title || '—' },
                  ].map((item) => (
                    <div key={item.label} className="settings-preview-item">
                      <span className="settings-preview-label">{item.label}</span>
                      <span className="settings-preview-value">{item.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="settings-submit">
              <button type="submit" className="apf-btn-submit">Enregistrer les paramètres</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default AdminSettings;