import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './Admin.css';
const availableColors = [
  { name: 'Noir', hex: '#111111' },
  { name: 'Blanc', hex: '#ffffff' },
  { name: 'Bleu', hex: '#1e3a8a' },
  { name: 'Gris', hex: '#888888' },
  { name: 'Beige', hex: '#d8c3a5' },
  { name: 'Rouge', hex: '#c0392b' },
  { name: 'Vert', hex: '#2e7d32' },
];

const availableSizes = ['XS', 'S', 'M', 'L', 'XL'];

const availableCategories = [
  'T-shirts',
  'Pantalons',
  'Ensembles',
  'Shorts',
  'Chemises',
  'Sweat à capuche',
  'Chaussures',
  'Chaussettes',
  'Accessoires',
  'Casquettes',
];

const accessorySubcategories = ['Lunettes', 'Bagues', 'Bracelets', 'Colliers'];

function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchParams] = useSearchParams();
const categoryFilter = searchParams.get('category');
const statusFilter = searchParams.get('status');
const subcategoryFilter = searchParams.get('subcategory');
const [filterBrand, setFilterBrand] = useState('');
const [filterCategory, setFilterCategory] = useState('');
const [adminCategories, setAdminCategories] = useState([]);
const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    subcategory: '',
    description: '',
    price: '',
    stock: '',
    rating: 0,
    is_featured: false,
    images: [],
    existingImages: [],
    colors: [],
    sizes: [],
  });

  const [editingId, setEditingId] = useState(null);
const [message, setMessage] = useState('');
const [showForm, setShowForm] = useState(false);
const [selectedIds, setSelectedIds] = useState([]);
const [editingStock, setEditingStock] = useState(null);
const [tempStock, setTempStock] = useState('');

useEffect(() => {
  fetchProducts();
  api.get('/categories').then((res) => setAdminCategories(res.data));
  api.get('/me').then((res) => setCurrentUser(res.data));
}, []);
  const fetchProducts = () => {
    console.log('fetchProducts appelé !');
    setLoading(true);
    api.get('/products')
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
  const { name, value, type, checked, files } = e.target;
  if (type === 'checkbox') {
    setForm({ ...form, [name]: checked });
  } else if (type === 'file') {
    if (name === 'images') {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...Array.from(files)] }));
    } else {
      setForm({ ...form, [name]: Array.from(files) });
    }
  } else if (name === 'category') {
    // Réinitialise la sous-catégorie si on change de catégorie principale
    setForm({ ...form, category: value, subcategory: '' });
  } else {
    setForm({ ...form, [name]: value });
  }
};
  const handleImageDragEnd = (result) => {
    if (!result.destination) return;
  
    const reordered = Array.from(form.images);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
  
    setForm((prev) => ({ ...prev, images: reordered }));
  };
  
  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };
  const handleExistingImageDragEnd = (result) => {
    if (!result.destination) return;
  
    const reordered = Array.from(form.existingImages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
  
    setForm((prev) => ({ ...prev, existingImages: reordered }));
  };

  const toggleColor = (hex) => {
  setForm((prev) => {
    const exists = prev.colors.find((c) => c.hex === hex);
    if (exists) {
      return { ...prev, colors: prev.colors.filter((c) => c.hex !== hex) };
    }
    return { ...prev, colors: [...prev.colors, { hex, image: null, stock: 0 }] };
  });
};

const setColorStock = (hex, stock) => {
  setForm((prev) => ({
    ...prev,
    colors: prev.colors.map((c) => (c.hex === hex ? { ...c, stock: Number(stock) } : c)),
  }));
};
  
  const setColorImage = (hex, file) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => (c.hex === hex ? { ...c, image: file } : c)),
    }));
  };
  const toggleSize = (size) => {
  setForm((prev) => {
    const exists = prev.sizes.find((s) => s.size === size);
    if (exists) {
      return { ...prev, sizes: prev.sizes.filter((s) => s.size !== size) };
    }
    return { ...prev, sizes: [...prev.sizes, { size, stock: 0 }] };
  });
};

const setSizeStock = (size, stock) => {
  setForm((prev) => ({
    ...prev,
    sizes: prev.sizes.map((s) => (s.size === size ? { ...s, stock: Number(stock) } : s)),
  }));
};

  

const handleSubmit = (e) => {
  e.preventDefault();
  console.log('handleSubmit appelé !');

  const formData = new FormData();
formData.append('name', form.name);
formData.append('brand', form.brand);
formData.append('category', form.category);
formData.append('subcategory', form.subcategory || '');
formData.append('description', form.description);
formData.append('price', form.price);
formData.append('stock', form.stock || 0);
formData.append('rating', form.rating || 0);
formData.append('is_featured', form.is_featured ? 1 : 0);
const colorsForJson = form.colors.map((c) => ({ hex: c.hex, stock: c.stock || 0 }));
formData.append('colors', JSON.stringify(colorsForJson));

form.colors.forEach((c, index) => {
  if (c.image && typeof c.image !== 'string') {
    formData.append(`color_images[${index}]`, c.image);
  }
});
formData.append('sizes', JSON.stringify(form.sizes));
if (form.images.length > 0) {
    form.images.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
  } else if (form.existingImages.length > 0) {
    formData.append('existing_images_order', JSON.stringify(form.existingImages));
  }

    if (editingId) {
      formData.append('_method', 'PUT');
      api.post(`/products/${editingId}`, formData)
        .then(() => {
          setMessage('Produit modifié avec succès !');
          resetForm();
          fetchProducts();
        })
        .catch((err) => {
          console.error(err);
          setMessage('Erreur lors de la modification.');
        });
    } else {
      api.post('/products', formData)
        .then(() => {
          setMessage('Produit ajouté avec succès !');
          resetForm();
          fetchProducts();
        })
        .catch((err) => {
          console.error(err);
          setMessage("Erreur lors de l'ajout.");
        });
    }
};

const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      brand: product.brand || '',
      category: product.category,
      subcategory: product.subcategory || '',
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      rating: product.rating || 0,
      is_featured: !!product.is_featured,
      images: [],
      existingImages: product.images || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;

    api.delete(`/products/${id}`)
      .then(() => {
        setMessage('Produit supprimé.');
        fetchProducts();
      })
      .catch((err) => {
        console.error(err);
        setMessage('Erreur lors de la suppression.');
      });
  };
  const exportToCSV = () => {
    const headers = [
      'ID', 'Nom', 'Marque', 'Catégorie', 'Sous-catégorie',
      'Prix', 'Discount (%)', 'Stock', 'En vedette', 'Couleurs', 'Tailles', 'Date ajout'
    ];
  
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.name || ''}"`,
      `"${p.brand || ''}"`,
      `"${p.category || ''}"`,
      `"${p.subcategory || ''}"`,
      p.price,
      p.discount || 0,
      p.stock,
      p.is_featured ? 'Oui' : 'Non',
      `"${(p.colors || []).map((c) => c.hex).join(', ')}"`,
      `"${(p.sizes || []).map((s) => `${s.size}(${s.stock})`).join(', ')}"`,
      new Date(p.created_at).toLocaleDateString('fr-FR'),
    ]);
  
    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
    ].join('\n');
  
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
  
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `produits_mblifestyle_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const handleDuplicate = async (product) => {
    try {
      const formData = new FormData();
      formData.append('name', `${product.name} (Copie)`);
      formData.append('brand', product.brand || '');
      formData.append('category', product.category);
      formData.append('subcategory', product.subcategory || '');
      formData.append('description', product.description || '');
      formData.append('price', product.price);
      formData.append('discount', product.discount || 0);
      formData.append('stock', product.stock || 0);
      formData.append('is_featured', 0);
      formData.append('colors', JSON.stringify(
        (product.colors || []).map((c) => ({ hex: c.hex, stock: c.stock || 0 }))
      ));
      formData.append('sizes', JSON.stringify(product.sizes || []));
  
      if (product.images && product.images.length > 0) {
        formData.append('existing_images_order', JSON.stringify(product.images));
      }
  
      await api.post('/products', formData);
      setMessage(`"${product.name}" dupliqué avec succès !`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors de la duplication.');
    }
  };
  const startEditStock = (product) => {
    setEditingStock(product.id);
    setTempStock(product.stock);
  };
  
  const saveStock = async (productId) => {
    try {
      await api.post(`/products/${productId}`, {
        _method: 'PUT',
        stock: tempStock,
      });
      setEditingStock(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };
  
  const cancelEditStock = () => {
    setEditingStock(null);
    setTempStock('');
  };
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };
  
  const handleDeleteSelected = async () => {
    if (!window.confirm(`Supprimer ${selectedIds.length} produit(s) ?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/products/${id}`)));
      setMessage(`${selectedIds.length} produit(s) supprimé(s).`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors de la suppression.');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      brand: '',
      category: '',
      subcategory: '',
      description: '',
      price: '',
      stock: '',
      rating: 0,
      is_featured: false,
      images: [],
      existingImages: [],
      colors: [],
      sizes: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const availableBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

const filteredProducts = products.filter((p) => {
  if (categoryFilter) {
    const slug = p.category?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
    if (slug !== categoryFilter) return false;
  }
  if (subcategoryFilter && p.subcategory !== subcategoryFilter) return false;
  if (statusFilter === 'in_stock' && p.stock <= 0) return false;
  if (statusFilter === 'out_of_stock' && p.stock > 0) return false;
  if (statusFilter === 'featured' && !p.is_featured) return false;
  if (filterBrand && p.brand !== filterBrand) return false;
if (filterCategory && p.category !== filterCategory) return false;
if (searchQuery) {
  const q = searchQuery.toLowerCase();
  const matchesName = p.name?.toLowerCase().includes(q);
  const matchesBrand = p.brand?.toLowerCase().includes(q);
  const matchesCategory = p.category?.toLowerCase().includes(q);
  if (!matchesName && !matchesBrand && !matchesCategory) return false;
}
return true;
});

const filterLabel = (() => {
  const parts = [];
  if (filterCategory) parts.push(filterCategory);
else if (categoryFilter) {
  parts.push(categoryFilter.replace(/-/g, ' '));
  if (subcategoryFilter) parts.push(subcategoryFilter);
}
  else if (statusFilter === 'in_stock') parts.push('En stock');
  else if (statusFilter === 'out_of_stock') parts.push('Rupture de stock');
  else if (statusFilter === 'featured') parts.push('En vedette');
  if (filterBrand) parts.push(filterBrand);
  
  if (parts.length === 0) return `Liste des produits (${products.length})`;
  return `${parts.join(' — ')} (${filteredProducts.length})`;
})();


  return (
    <div className="admin-layout">
      <AdminSidebar />
  
      <main className="admin-main">
      <div className="admin-header-bar">
  <h1>Gestion des produits</h1>
  <div className="admin-header-actions">
    <button className="btn-export-csv" onClick={exportToCSV}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="15" height="15">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" />
        <polyline points="7 10 12 15 17 10" strokeWidth="2" />
        <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" />
      </svg>
      Exporter CSV ({filteredProducts.length})
    </button>
    <Link to="/admin/produits/ajouter" className="btn-add-product">
      + Ajouter un produit
    </Link>
  </div>
</div>
      {message && <p className="admin-message">{message}</p>}
  
      {showForm && (
        <div className="admin-modal-overlay" onClick={resetForm}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={resetForm}>✕</button>
  
            <form className="admin-form" onSubmit={handleSubmit}>
              <h2>{editingId ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
  
              <input type="text" name="name" placeholder="Nom du produit" value={form.name} onChange={handleChange} required />
              <input type="text" name="brand" placeholder="Marque" value={form.brand} onChange={handleChange} />
  
              <select name="category" value={form.category} onChange={handleChange} required className="category-select">
  <option value="">Sélectionner une catégorie</option>
  {availableCategories.map((cat) => (
    <option key={cat} value={cat}>{cat}</option>
  ))}
</select>

{form.category === 'Accessoires' && (
  <select
    name="subcategory"
    value={form.subcategory}
    onChange={handleChange}
    required
    className="category-select"
  >
    <option value="">Sélectionner un type d'accessoire</option>
    {accessorySubcategories.map((sub) => (
      <option key={sub} value={sub}>{sub}</option>
    ))}
  </select>
)}
  
              <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange}></textarea>
              <input type="number" name="price" placeholder="Prix (DH)" value={form.price} onChange={handleChange} step="0.01" required />
              <input type="number" name="stock" placeholder="Stock disponible" value={form.stock} onChange={handleChange} />
  
              <label className="checkbox-label">
                <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
                Mettre en vedette sur la page d'accueil
              </label>
  
              <div className="field-group">
                {form.existingImages.length > 0 && (
                  <div className="existing-images-notice">
                    <p className="images-count">
                      Photos déjà enregistrées (glisse pour réordonner) :
                    </p>
  
                    <DragDropContext onDragEnd={handleExistingImageDragEnd}>
                      <Droppable droppableId="existing-images-list" direction="horizontal">
                        {(provided) => (
                          <div
                            className="image-preview-list"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {form.existingImages.map((img, index) => (
                              <Draggable key={img + index} draggableId={img + index} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    className={`image-preview-item existing ${snapshot.isDragging ? 'dragging' : ''}`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <img src={`https://mblifestyle-backend-production.up.railway.app/storage/${img}`} alt={`existante-${index}`} />
                                    <span className="image-preview-badge">
                                      {index === 0 ? 'Recto' : index === 1 ? 'Verso' : index + 1}
                                    </span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
  
                    <p className="existing-images-hint">
                      ⚠️ Si tu sélectionnes de nouvelles photos ci-dessous, elles remplaceront complètement
                      celles-ci. Sinon, clique "Enregistrer les modifications" pour sauvegarder le nouvel ordre.
                    </p>
                  </div>
                )}
                <label className="field-label">
                  Photos du produit (glisse pour réorganiser — la 1ère = recto, la 2ème = verso)
                </label>
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                />
  
                {form.images.length > 0 && (
                  <DragDropContext onDragEnd={handleImageDragEnd}>
                    <Droppable droppableId="images-list" direction="horizontal">
                      {(provided) => (
                        <div
                          className="image-preview-list"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {form.images.map((file, index) => (
                            <Draggable key={file.name + index} draggableId={file.name + index} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  className={`image-preview-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <img src={URL.createObjectURL(file)} alt={`preview-${index}`} />
                                  <span className="image-preview-badge">
                                    {index === 0 ? 'Recto' : index === 1 ? 'Verso' : index + 1}
                                  </span>
                                  <button
                                    type="button"
                                    className="image-preview-remove"
                                    onClick={() => removeImage(index)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
  
              <div className="field-group">
                <label className="field-label">Couleurs disponibles</label>
                <div className="color-options">
                  {availableColors.map((color) => (
                    <button
                      type="button"
                      key={color.hex}
                      className={`color-dot ${form.colors.find((c) => c.hex === color.hex) ? 'selected' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => toggleColor(color.hex)}
                      title={color.name}
                    ></button>
                  ))}
                </div>
  
                {form.colors.length > 0 && (
  <div className="color-images-section">
    <p className="color-images-hint">Photo et stock pour chaque couleur :</p>
    {form.colors.map((c) => (
      <div className="color-image-row" key={c.hex}>
        <span className="color-image-dot" style={{ backgroundColor: c.hex }}></span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setColorImage(c.hex, e.target.files[0])}
        />
        {c.image && typeof c.image !== 'string' && (
          <span className="color-image-filename">{c.image.name}</span>
        )}
        <input
          type="number"
          min="0"
          placeholder="Stock"
          value={c.stock ?? 0}
          onChange={(e) => setColorStock(c.hex, e.target.value)}
          className="color-stock-input"
        />
      </div>
    ))}
  </div>
)}
              </div>
  
              <div className="field-group">
  <label className="field-label">Tailles disponibles</label>
  <div className="size-options">
    {availableSizes.map((size) => (
      <button
        type="button"
        key={size}
        className={`size-chip ${form.sizes.find((s) => s.size === size) ? 'selected' : ''}`}
        onClick={() => toggleSize(size)}
      >
        {size}
      </button>
    ))}
  </div>

  {form.sizes.length > 0 && (
    <div className="size-stock-section">
      <p className="size-stock-hint">Stock pour chaque taille :</p>
      {form.sizes.map((s) => (
        <div className="size-stock-row" key={s.size}>
          <span className="size-stock-label">{s.size}</span>
          <input
            type="number"
            min="0"
            placeholder="Stock"
            value={s.stock ?? 0}
            onChange={(e) => setSizeStock(s.size, e.target.value)}
            className="size-stock-input"
          />
        </div>
      ))}
    </div>
  )}
</div>
  
              
  
              <div className="form-buttons">
                <button type="submit">
                  {editingId ? 'Enregistrer les modifications' : 'Ajouter le produit'}
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
      <div className="admin-search-bar">
  <div className="admin-search-wrapper">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" className="admin-search-icon">
      <circle cx="11" cy="11" r="8" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
    </svg>
    <input
      type="text"
      placeholder="Rechercher par nom, marque, catégorie..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="admin-search-input"
    />
    {searchQuery && (
      <button className="admin-search-clear" onClick={() => setSearchQuery('')}>✕</button>
    )}
  </div>
</div>

<div className="admin-filters-bar">
  <div className="admin-title-row">
    <h2 className="admin-products-title">{filterLabel}</h2>
    {selectedIds.length > 0 && (
      <button className="btn-delete-selected" onClick={handleDeleteSelected}>
        🗑 Supprimer la sélection ({selectedIds.length})
      </button>
    )}
  </div>

  <div className="admin-filters-controls">
  <select
  value={filterCategory}
  onChange={(e) => setFilterCategory(e.target.value)}
  className="admin-filter-select"
>
      <option value="">Toutes les catégories</option>
      {adminCategories.map((cat) => (
        <option key={cat.id} value={cat.name}>{cat.name}</option>
      ))}
    </select>

    <select
  value={filterBrand}
  onChange={(e) => setFilterBrand(e.target.value)}
  className="admin-filter-select"
>
      <option value="">Toutes les marques</option>
      {availableBrands.map((brand) => (
        <option key={brand} value={brand}>{brand}</option>
      ))}
    </select>

    {(filterBrand || filterCategory || searchQuery) && (
  <button
    className="admin-filter-reset"
    onClick={() => { setFilterBrand(''); setFilterCategory(''); setSearchQuery(''); }}
  >
    ✕ Réinitialiser
  </button>
)}
  </div>
</div>
  
        {loading && <p className="admin-loading">Chargement...</p>}
        {!loading && filteredProducts.length === 0 && <p className="admin-loading">Aucun produit.</p>}
{!loading && filteredProducts.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
              <tr>
  <th>
    <input
      type="checkbox"
      checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
      onChange={toggleSelectAll}
      className="admin-checkbox"
    />
  </th>
  <th>Photo</th>
  <th>Nom</th>
  <th>Marque</th>
  <th>Catégorie</th>
  <th>Couleurs</th>
  <th>Tailles</th>
  <th>Prix</th>
  <th>Stock</th>
  <th>Vedette</th>
  <th>Actions</th>
</tr>
              </thead>
              <tbody>
              {filteredProducts.map((product) => {
                  const thumbUrl = product.images?.[0]
                    ? `https://mblifestyle-backend-production.up.railway.app/storage/${product.images[0]}`
                    : null;
  
                  return (
                    <tr key={product.id} className={selectedIds.includes(product.id) ? 'row-selected' : ''}>
  <td>
    <input
      type="checkbox"
      checked={selectedIds.includes(product.id)}
      onChange={() => toggleSelect(product.id)}
      className="admin-checkbox"
    />
  </td>
  <td>
    {thumbUrl ? (
                          <img src={thumbUrl} alt={product.name} className="admin-table-thumb" />
                        ) : (
                          <div className="admin-table-thumb admin-table-thumb-empty">—</div>
                        )}
                      </td>
                      <td className="admin-table-name">{product.name}</td>
<td>{product.brand || '—'}</td>
<td>
  {product.category}
  {product.subcategory && <span className="admin-subcategory"> ({product.subcategory})</span>}
</td>
<td>
  {product.colors && product.colors.length > 0 ? (
    <div className="admin-table-colors-detail">
      {product.colors.map((c) => (
        <div key={c.hex} className="admin-table-color-item">
          <span
            className={`admin-table-color-dot ${c.stock <= 0 ? 'out-of-stock' : ''}`}
            style={{ backgroundColor: c.hex }}
          ></span>
          <div className="admin-table-color-sizes">
            {c.sizes && c.sizes.length > 0 ? (
              c.sizes.map((s) => (
                <span
                  key={s.size}
                  className={`admin-table-size-tag ${s.stock <= 0 ? 'out-of-stock' : ''}`}
                  title={`${s.size} : ${s.stock} en stock`}
                >
                  {s.size}:{s.stock}
                </span>
              ))
            ) : (
              <span className="admin-table-color-stock">{c.stock}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : '—'}
</td>
<td>
  {product.sizes && product.sizes.length > 0 ? (
    <div className="admin-table-sizes">
      {product.sizes.map((s) => (
        <span
          key={s.size}
          className={`admin-table-size-tag ${s.stock <= 0 ? 'out-of-stock' : ''}`}
          title={s.stock > 0 ? `${s.stock} en stock` : 'Rupture'}
        >
          {s.size}
        </span>
      ))}
    </div>
  ) : '—'}
</td>
<td className="admin-table-price">{product.price} DH</td>
<td onClick={(e) => e.stopPropagation()}>
  {editingStock === product.id ? (
    <div className="admin-stock-edit">
      <input
        type="number"
        min="0"
        value={tempStock}
        onChange={(e) => setTempStock(e.target.value)}
        className="admin-stock-input"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') saveStock(product.id);
          if (e.key === 'Escape') cancelEditStock();
        }}
      />
      <button className="admin-stock-save" onClick={() => saveStock(product.id)} title="Enregistrer">✓</button>
      <button className="admin-stock-cancel" onClick={cancelEditStock} title="Annuler">✕</button>
    </div>
  ) : (
    <div
      className="admin-stock-display"
      onClick={() => startEditStock(product)}
      title="Cliquer pour modifier le stock"
    >
      {product.stock > 0 ? (
        <span className="admin-stock-value">{product.stock}</span>
      ) : (
        <span className="admin-badge-stock-out">Rupture</span>
      )}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="12" height="12" className="admin-stock-edit-icon">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" />
      </svg>
    </div>
  )}
</td>
                      <td>
                        {product.is_featured ? (
                          <span className="admin-badge-yes">Oui</span>
                        ) : (
                          <span className="admin-badge-no">Non</span>
                        )}
                      </td>
                      <td>
                      <div className="admin-table-actions">
  <Link to={`/admin/produits/detail/${product.id}`} className="btn-table-detail">
    Détails
  </Link>
  {currentUser?.role !== 'order_manager' && (
    <>
      <Link to={`/admin/produits/modifier/${product.id}`} className="btn-table-edit">
        Modifier
      </Link>
      <button className="btn-table-duplicate" onClick={() => handleDuplicate(product)}>
        Dupliquer
      </button>
      <button className="btn-table-delete" onClick={() => handleDelete(product.id)}>
        Supprimer
      </button>
    </>
  )}
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

export default Admin;