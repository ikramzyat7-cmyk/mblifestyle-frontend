import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminCategories.css';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    image: null,
    hasSubcategories: false,
    subcategories: [],
    is_visible: true,
  });

  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    api.get('/categories?admin=1')
      .then((res) => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.length === categories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((c) => c.id));
    }
  };
  
  const handleDeleteSelected = async () => {
    if (!window.confirm(`Supprimer ${selectedIds.length} catégorie(s) ?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/categories/${id}`)));
      setMessage(`${selectedIds.length} catégorie(s) supprimée(s).`);
      setSelectedIds([]);
      fetchCategories();
      window.dispatchEvent(new Event('refreshSidebar'));
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors de la suppression.');
    }
  };

  const addSubcategory = () => {
    const label = newSubcategory.trim();
    if (!label) return;
    if (form.subcategories.includes(label)) return;
    setForm((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, label],
    }));
    setNewSubcategory('');
  };

  const removeSubcategory = (sub) => {
    setForm((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => s !== sub),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', form.name);
    if (form.image) formData.append('image', form.image);
    formData.append(
      'subcategories',
      JSON.stringify(form.hasSubcategories ? form.subcategories : [])
    );
    formData.append('is_visible', form.is_visible ? 1 : 0);
    if (editingId) {
      formData.append('_method', 'PUT');
      api.post(`/categories/${editingId}`, formData)
        .then(() => {
          setMessage('Catégorie modifiée avec succès !');
          resetForm();
          fetchCategories();
          window.dispatchEvent(new Event('refreshSidebar'));
        })
        .catch((err) => {
          console.error(err);
          setMessage('Erreur lors de la modification.');
        });
    } else {
      api.post('/categories', formData)
        .then(() => {
          setMessage('Catégorie ajoutée avec succès !');
          resetForm();
          fetchCategories();
          window.dispatchEvent(new Event('refreshSidebar'));
        })
        .catch((err) => {
          console.error(err);
          setMessage("Erreur lors de l'ajout.");
        });
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      image: null,
      hasSubcategories: category.subcategories && category.subcategories.length > 0,
      subcategories: category.subcategories || [],
      is_visible: category.is_visible !== false,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    api.delete(`/categories/${id}`)
      .then(() => {
        setMessage('Catégorie supprimée.');
        fetchCategories();
        window.dispatchEvent(new Event('refreshSidebar'));
      })
      .catch((err) => {
        console.error(err);
        setMessage('Erreur lors de la suppression.');
      });
  };
  const toggleCategoryVisibility = async (category) => {
    try {
      await api.patch(`/categories/${category.id}/visibility`, {
        is_visible: !category.is_visible,
      });
      fetchCategories();
      window.dispatchEvent(new Event('refreshSidebar'));
    } catch (err) {
      console.error(err);
    }
  };
  
  const toggleSubcategoryVisibility = async (category, sub) => {
    const hidden = category.hidden_subcategories || [];
    const newHidden = hidden.includes(sub)
      ? hidden.filter((s) => s !== sub)
      : [...hidden, sub];
  
    try {
      await api.patch(`/categories/${category.id}/visibility`, {
        is_visible: category.is_visible,
        hidden_subcategories: newHidden,
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm({ name: '', image: null, hasSubcategories: false, subcategories: [], is_visible: true });
    setNewSubcategory('');
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-header-bar">
          <h1>Catégories</h1>
          <button className="btn-add-product" onClick={() => setShowForm(true)}>
            + Ajouter une catégorie
          </button>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {showForm && (
          <div className="admin-modal-overlay" onClick={resetForm}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <button className="admin-modal-close" onClick={resetForm}>✕</button>

              <form className="admin-form" onSubmit={handleSubmit}>
                <h2>{editingId ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</h2>

                <div className="ac-field">
                  <label>Nom de la catégorie *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ex: T-shirts, Accessoires..."
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ac-field">
                  <label>Photo de la catégorie</label>
                  <input type="file" accept="image/*" onChange={handleChange} />
                </div>

                <label className="ac-checkbox">
                  <input
                    type="checkbox"
                    checked={form.hasSubcategories}
                    onChange={(e) => setForm({ ...form, hasSubcategories: e.target.checked, subcategories: [] })}
                  />
                  Cette catégorie contient des sous-catégories
                </label>
                <label className="ac-checkbox">
  <input
    type="checkbox"
    checked={form.is_visible}
    onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
  />
  Afficher cette catégorie sur le site
</label>

                {form.hasSubcategories && (
                  <div className="ac-subcategories">
                    <label>Sous-catégories</label>

                    <div className="ac-sub-input-row">
                      <input
                        type="text"
                        placeholder="Ex: Lunettes, Bagues, Bracelets..."
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSubcategory();
                          }
                        }}
                      />
                      <button type="button" className="ac-btn-add-sub" onClick={addSubcategory}>
                        + Ajouter
                      </button>
                    </div>

                    {form.subcategories.length > 0 && (
                      <div className="ac-sub-tags">
                        {form.subcategories.map((sub) => (
                          <div key={sub} className="ac-sub-tag">
                            <span>{sub}</span>
                            <button type="button" onClick={() => removeSubcategory(sub)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {form.subcategories.length === 0 && (
                      <p className="ac-sub-hint">
                        Tape un nom et clique "+ Ajouter" ou appuie sur Entrée.
                      </p>
                    )}
                  </div>
                )}

                <div className="form-buttons">
                  <button type="submit">
                    {editingId ? 'Enregistrer les modifications' : 'Ajouter la catégorie'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={resetForm}>
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="admin-products-section">
        <div className="admin-title-row">
  <h2 className="admin-products-title">Liste des catégories ({categories.length})</h2>
  {selectedIds.length > 0 && (
    <button className="btn-delete-selected" onClick={handleDeleteSelected}>
      🗑 Supprimer la sélection ({selectedIds.length})
    </button>
  )}
</div>

          {loading && <p className="admin-loading">Chargement...</p>}
          {!loading && categories.length === 0 && <p className="admin-loading">Aucune catégorie.</p>}

          {!loading && categories.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
              <thead>
  <tr>
    <th>
      <input
        type="checkbox"
        checked={selectedIds.length === categories.length && categories.length > 0}
        onChange={toggleSelectAll}
        className="admin-checkbox"
      />
    </th>
    <th>Photo</th>
    <th>Nom</th>
    <th>Slug</th>
    <th>Sous-catégories</th>
    <th>Visibilité</th>
    <th>Actions</th>
  </tr>
</thead>
                <tbody>
                  {categories.map((category) => {
                    const thumbUrl = category.image
                      ? `http://127.0.0.1:8000/storage/${category.image}`
                      : null;

                    return (
                      <tr key={category.id} className={selectedIds.includes(category.id) ? 'row-selected' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(category.id)}
                          onChange={() => toggleSelect(category.id)}
                          className="admin-checkbox"
                        />
                      </td>
                      <td>
                        {thumbUrl ? (
                            <img src={thumbUrl} alt={category.name} className="admin-table-thumb" />
                          ) : (
                            <div className="admin-table-thumb admin-table-thumb-empty">—</div>
                          )}
                        </td>
                        <td className="admin-table-name">{category.name}</td>
                        <td>{category.slug}</td>
                        <td>
                          {category.subcategories && category.subcategories.length > 0 ? (
                            <div className="ac-table-subs">
                              {category.subcategories.map((sub) => (
                                <span key={sub} className="ac-table-sub-tag">{sub}</span>
                              ))}
                            </div>
                          ) : '—'}
                        </td>
                        <td>
  <div className="ac-visibility">
    <button
      className={`ac-visibility-btn ${category.is_visible ? 'visible' : 'hidden'}`}
      onClick={() => toggleCategoryVisibility(category)}
      title={category.is_visible ? 'Cacher cette catégorie' : 'Afficher cette catégorie'}
    >
      {category.is_visible ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" strokeWidth="2" />
          </svg>
          Visible
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" />
            <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
          </svg>
          Caché
        </>
      )}
    </button>

    {category.subcategories && category.subcategories.length > 0 && (
      <div className="ac-sub-visibility">
        {category.subcategories.map((sub) => {
          const isHidden = (category.hidden_subcategories || []).includes(sub);
          return (
            <button
              key={sub}
              className={`ac-sub-visibility-btn ${isHidden ? 'hidden' : 'visible'}`}
              onClick={() => toggleSubcategoryVisibility(category, sub)}
              title={isHidden ? `Afficher ${sub}` : `Cacher ${sub}`}
            >
              {isHidden ? '👁‍🗨' : '👁'} {sub}
            </button>
          );
        })}
      </div>
    )}
  </div>
</td>

<td>
  <div className="admin-table-actions">
    <button className="btn-table-edit" onClick={() => handleEdit(category)}>
      Modifier
    </button>
    <button className="btn-table-delete" onClick={() => handleDelete(category.id)}>
      Supprimer
    </button>
  </div>
</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminCategories;