import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminDelivery.css';

function AdminDelivery() {
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({ name: '', price: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    api.get('/admin/delivery-cities').then((res) => setCities(res.data));
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    if (editId) {
      await api.put(`/admin/delivery-cities/${editId}`, form);
    } else {
      await api.post('/admin/delivery-cities', form);
    }
    api.get('/admin/delivery-cities').then((res) => setCities(res.data));
    setForm({ name: '', price: '' });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette ville ?')) {
      await api.delete(`/admin/delivery-cities/${id}`);
      setCities(cities.filter((c) => c.id !== id));
    }
  };

  const handleToggle = async (city) => {
    await api.put(`/admin/delivery-cities/${city.id}`, { is_active: !city.is_active });
    setCities(cities.map((c) => c.id === city.id ? { ...c, is_active: !c.is_active } : c));
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="delivery-page-header">
          <h1>🚚 Frais de livraison par ville</h1>
        </div>

        <div className="delivery-layout">

          {/* Formulaire */}
          <div className="delivery-form-card">
            <h3>{editId ? '✏️ Modifier la ville' : '➕ Ajouter une ville'}</h3>

            <div className="delivery-form-field">
              <label>Nom de la ville</label>
              <input type="text" placeholder="Ex: Casablanca" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="delivery-form-field">
              <label>Prix de livraison (DH)</label>
              <input type="number" placeholder="Ex: 25" value={form.price} min="0"
                onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>

            <div className="delivery-form-btns">
              <button className="delivery-btn-save" onClick={handleSave}>
                {editId ? 'Enregistrer' : 'Ajouter la ville'}
              </button>
              {editId && (
                <button className="delivery-btn-cancel"
                  onClick={() => { setEditId(null); setForm({ name: '', price: '' }); }}>
                  Annuler
                </button>
              )}
            </div>
          </div>

          {/* Tableau */}
          <div className="delivery-table-card">
            <div className="delivery-table-header">
              <h3>Villes disponibles</h3>
              <span className="delivery-table-count">{cities.length} ville{cities.length > 1 ? 's' : ''}</span>
            </div>
            <table className="delivery-table">
              <thead>
                <tr>
                  <th>Ville</th>
                  <th>Prix livraison</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => (
                  <tr key={city.id}>
                    <td><span className="delivery-city-name">{city.name}</span></td>
                    <td><span className="delivery-price">{parseFloat(city.price).toFixed(2)} DH</span></td>
                    <td>
                      <span className={city.is_active ? 'delivery-badge-active' : 'delivery-badge-inactive'}>
                        {city.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="delivery-actions">
                        <button className="delivery-btn-edit"
                          onClick={() => { setEditId(city.id); setForm({ name: city.name, price: city.price }); }}>
                          Modifier
                        </button>
                        <button className="delivery-btn-toggle" onClick={() => handleToggle(city)}>
                          {city.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button className="delivery-btn-delete" onClick={() => handleDelete(city.id)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDelivery;