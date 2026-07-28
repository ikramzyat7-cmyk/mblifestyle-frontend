import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminUsers.css';

const roleLabels = {
  super_admin: { label: 'Super Admin', color: '#e74c3c' },
  stock_manager: { label: 'Gestionnaire stock', color: '#1e3a8a' },
  order_manager: { label: 'Gestionnaire commandes', color: '#2e7d32' },
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'stock_manager', is_active: true,
  });

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/me'),
    ]).then(([usersRes, meRes]) => {
      setUsers(usersRes.data);
      setCurrentUser(meRes.data);
      setLoading(false);
    });
  }, []);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: 'stock_manager', is_active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (!data.password) delete data.password;

      if (editingId) {
        await api.put(`/users/${editingId}`, data);
        setMessage('Admin modifié !');
      } else {
        await api.post('/users', data);
        setMessage('Admin créé !');
      }
      resetForm();
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet admin ?')) return;
    try {
      await api.delete(`/users/${id}`);
      setMessage('Admin supprimé.');
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur.');
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { is_active: !user.is_active });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      setMessage('Erreur.');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-header-bar">
          <div>
            <h1>Gestion des admins</h1>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              {users.length} compte(s) admin
            </p>
          </div>
          {isSuperAdmin && (
            <button className="btn-add-product" onClick={() => setShowForm(true)}>
              + Ajouter un admin
            </button>
          )}
        </div>

        {message && <p className="admin-message">{message}</p>}

        {!isSuperAdmin && (
          <div className="au-warning">
            ⚠️ Seul le Super Admin peut gérer les comptes. Vous pouvez voir la liste uniquement.
          </div>
        )}

        {showForm && (
          <div className="admin-modal-overlay" onClick={resetForm}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <button className="admin-modal-close" onClick={resetForm}>✕</button>
              <form className="admin-form" onSubmit={handleSubmit}>
                <h2>{editingId ? 'Modifier l\'admin' : 'Ajouter un admin'}</h2>

                <div className="apf-field">
                  <label>Nom *</label>
                  <input type="text" placeholder="Ex: Mohamed" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div className="apf-field">
                  <label>Email *</label>
                  <input type="email" placeholder="admin@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>

                <div className="apf-field">
                  <label>{editingId ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}</label>
                  <input type="password" placeholder="Min. 8 caractères" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingId} />
                </div>

                <div className="apf-field">
                  <label>Rôle *</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="super_admin">Super Admin (accès total)</option>
                    <option value="stock_manager">Gestionnaire de stock (produits + catégories)</option>
                    <option value="order_manager">Gestionnaire de commandes (commandes uniquement)</option>
                  </select>
                </div>

                <label className="apf-checkbox">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                  Compte actif
                </label>

                <div className="form-buttons">
                  <button type="submit">{editingId ? 'Enregistrer' : 'Créer le compte'}</button>
                  <button type="button" className="btn-cancel" onClick={resetForm}>Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p className="admin-loading">Chargement...</p>
        ) : (
          <div className="au-list">
            {users.map((user) => {
              const roleConfig = roleLabels[user.role] || { label: user.role, color: '#888' };
              const isMe = currentUser?.id === user.id;

              return (
                <div key={user.id} className={`au-card ${!user.is_active ? 'inactive' : ''}`}>
                  <div className="au-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="au-info">
                    <div className="au-name-row">
                      <p className="au-name">{user.name} {isMe && <span className="au-me-badge">Vous</span>}</p>
                      <span className="au-role-badge" style={{ backgroundColor: roleConfig.color + '20', color: roleConfig.color }}>
                        {roleConfig.label}
                      </span>
                    </div>
                    <p className="au-email">{user.email}</p>
                    <p className="au-date">
                      Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="au-status">
                    <span className={`au-active-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? '● Actif' : '● Inactif'}
                    </span>
                  </div>

                  {isSuperAdmin && !isMe && (
                    <div className="au-actions">
                      <button
                        className={`ac-visibility-btn ${user.is_active ? 'visible' : 'hidden'}`}
                        onClick={() => toggleActive(user)}
                      >
                        {user.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button className="btn-table-edit" onClick={() => handleEdit(user)}>
                        Modifier
                      </button>
                      <button className="btn-table-delete" onClick={() => handleDelete(user.id)}>
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="au-roles-info">
          <h3>Permissions par rôle</h3>
          <div className="au-roles-grid">
            <div className="au-role-card">
              <span className="au-role-title" style={{ color: '#e74c3c' }}>Super Admin</span>
              <ul>
                <li>✓ Tout gérer</li>
                <li>✓ Créer/supprimer des admins</li>
                <li>✓ Paramètres de la boutique</li>
                <li>✓ Historique complet</li>
              </ul>
            </div>
            <div className="au-role-card">
              <span className="au-role-title" style={{ color: '#1e3a8a' }}>Gestionnaire de stock</span>
              <ul>
                <li>✓ Produits (CRUD)</li>
                <li>✓ Catégories</li>
                <li>✓ Slides / Popup</li>
                <li>✗ Commandes</li>
                <li>✗ Admins</li>
              </ul>
            </div>
            <div className="au-role-card">
              <span className="au-role-title" style={{ color: '#2e7d32' }}>Gestionnaire de commandes</span>
              <ul>
                <li>✓ Voir/confirmer commandes</li>
                <li>✓ Voir les produits</li>
                <li>✗ Modifier produits</li>
                <li>✗ Catégories</li>
                <li>✗ Admins</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminUsers;