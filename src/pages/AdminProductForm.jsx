import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminProductForm.css';

const availableColors = [
  { name: 'Noir',      hex: '#111111' },
  { name: 'Blanc',     hex: '#f5f5f5' },
  { name: 'Rouge',     hex: '#cc0000' },
  { name: 'Bleu',      hex: '#1e3a8a' },
  { name: 'Marine',    hex: '#0a1f5c' },
  { name: 'Vert',      hex: '#2e7d32' },
  { name: 'Beige',     hex: '#d8c3a5' },
  { name: 'Gris',      hex: '#888888' },
  { name: 'Rose',      hex: '#e91e8c' },
  { name: 'Camel',     hex: '#c19a6b' },
  { name: 'Bordeaux',  hex: '#6d1a2a' },
  { name: 'Kaki',      hex: '#5c5c2e' },
];

const sizesByCategory = {
  'T-shirt':    ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  'T-shirts':   ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  'Pantalon':   ['34', '36', '38', '40', '42', '44', '46', '48'],
  'Pantalons':  ['34', '36', '38', '40', '42', '44', '46', '48'],
  'Robe':       ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Robes':      ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Chemise':    ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Chemises':   ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Veste':      ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Vestes':     ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Sweat':      ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Sweats':     ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Short':      ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Shorts':     ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Chaussure':  ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  'Chaussures': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  'Accessoire': ['Taille unique', 'S/M', 'L/XL'],
  'Accessoires':['Taille unique', 'S/M', 'L/XL'],
  'Ensemble':   ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Ensembles':  ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Pull':       ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Pulls':      ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Jacket':     ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
};

const specsByCategory = {
  'T-shirt': [
    { key: 'matiere', label: 'Matière', type: 'select', options: ['100% Coton', 'Coton/Polyester', 'Lin', 'Bambou', 'Jersey'] },
    { key: 'coupe', label: 'Coupe', type: 'select', options: ['Regular', 'Slim', 'Oversize', 'Loose'] },
    { key: 'manches', label: 'Manches', type: 'select', options: ['Courtes', 'Longues', 'Sans manches'] },
    { key: 'entretien', label: 'Entretien', type: 'text', placeholder: 'Ex: Lavage 30°' },
  ],
  'T-shirts': [
    { key: 'matiere', label: 'Matière', type: 'select', options: ['100% Coton', 'Coton/Polyester', 'Lin', 'Bambou', 'Jersey'] },
    { key: 'coupe', label: 'Coupe', type: 'select', options: ['Regular', 'Slim', 'Oversize', 'Loose'] },
    { key: 'manches', label: 'Manches', type: 'select', options: ['Courtes', 'Longues', 'Sans manches'] },
    { key: 'entretien', label: 'Entretien', type: 'text', placeholder: 'Ex: Lavage 30°' },
  ],
  'Pantalons': [
    { key: 'matiere', label: 'Matière', type: 'select', options: ['Denim', 'Coton', 'Polyester', 'Lin', 'Laine'] },
    { key: 'coupe', label: 'Coupe', type: 'select', options: ['Slim', 'Regular', 'Straight', 'Baggy', 'Skinny'] },
    { key: 'fermeture', label: 'Fermeture', type: 'select', options: ['Bouton', 'Zip', 'Élastique'] },
    { key: 'poches', label: 'Poches', type: 'select', options: ['2 poches', '4 poches', '6 poches'] },
  ],
  'Robes': [
    { key: 'matiere', label: 'Matière', type: 'select', options: ['Soie', 'Coton', 'Polyester', 'Satin', 'Dentelle'] },
    { key: 'longueur', label: 'Longueur', type: 'select', options: ['Mini', 'Mi-longue', 'Longue', 'Maxi'] },
    { key: 'col', label: 'Type de col', type: 'select', options: ['Col rond', 'Col V', 'Décolleté', 'Sans col'] },
    { key: 'occasion', label: 'Occasion', type: 'select', options: ['Casual', 'Soirée', 'Bureau', 'Plage'] },
  ],
  'Chemises': [
    { key: 'matiere', label: 'Matière', type: 'select', options: ['Coton', 'Lin', 'Oxford', 'Popeline', 'Flanelle'] },
    { key: 'coupe', label: 'Coupe', type: 'select', options: ['Regular', 'Slim', 'Oversize'] },
    { key: 'col', label: 'Type de col', type: 'select', options: ['Col classique', 'Col mao', 'Col boutonné'] },
    { key: 'manches', label: 'Manches', type: 'select', options: ['Courtes', 'Longues'] },
  ],
  'Vestes': [
    { key: 'matiere', label: 'Matière', type: 'select', options: ['Cuir', 'Jean', 'Laine', 'Polyester', 'Nylon'] },
    { key: 'type', label: 'Type', type: 'select', options: ['Blazer', 'Bomber', 'Parka', 'Trench', 'Doudoune'] },
    { key: 'fermeture', label: 'Fermeture', type: 'select', options: ['Zip', 'Boutons', 'Sans fermeture'] },
    { key: 'doublure', label: 'Doublure', type: 'select', options: ['Oui', 'Non'] },
  ],
  'Sweats': [
    { key: 'matiere', label: 'Matière', type: 'select', options: ['Coton', 'Polaire', 'Jersey', 'Molleton'] },
    { key: 'type', label: 'Type', type: 'select', options: ['Hoodie', 'Crewneck', 'Zip', 'Polo'] },
    { key: 'coupe', label: 'Coupe', type: 'select', options: ['Regular', 'Oversize', 'Slim'] },
  ],
  'Shorts': [
    { key: 'matiere', label: 'Matière', type: 'select', options: ['Coton', 'Denim', 'Polyester', 'Lin'] },
    { key: 'longueur', label: 'Longueur', type: 'select', options: ['Court', 'Mi-cuisse', 'Bermuda'] },
    { key: 'fermeture', label: 'Fermeture', type: 'select', options: ['Élastique', 'Bouton', 'Zip'] },
  ],
  'Chaussures': [
    { key: 'matiere', label: 'Matière', type: 'select', options: ['Cuir', 'Synthétique', 'Toile', 'Daim'] },
    { key: 'type', label: 'Type', type: 'select', options: ['Sneakers', 'Boots', 'Mocassins', 'Sandales', 'Espadrilles'] },
    { key: 'semelle', label: 'Semelle', type: 'select', options: ['Caoutchouc', 'Cuir', 'EVA'] },
    { key: 'fermeture', label: 'Fermeture', type: 'select', options: ['Lacets', 'Velcro', 'Zip', 'Slip-on'] },
  ],
  'Accessoires': [
    { key: 'type', label: 'Type', type: 'select', options: ['Casquette', 'Sac', 'Ceinture', 'Lunettes', 'Montre', 'Bijou'] },
    { key: 'matiere', label: 'Matière', type: 'text', placeholder: 'Ex: Cuir, Coton, Métal...' },
    { key: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'Ex: 30x20x10 cm' },
  ],
  'Ensembles': [
    { key: 'pieces', label: 'Nombre de pièces', type: 'select', options: ['2 pièces', '3 pièces'] },
    { key: 'matiere', label: 'Matière', type: 'select', options: ['Coton', 'Polyester', 'Laine', 'Lin'] },
    { key: 'occasion', label: 'Occasion', type: 'select', options: ['Sport', 'Casual', 'Bureau', 'Soirée'] },
  ],
};

function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showColorSection, setShowColorSection] = useState(false);

  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    subcategory: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    is_featured: false,
    images: [],
    existingImages: [],
    colors: [],
    specs: {},
  });

  useEffect(() => {
    api.get('/categories?admin=1').then((res) => setCategories(res.data));
    if (isEditing) {
      setLoading(true);
      api.get(`/products/${id}`).then((res) => {
        const p = res.data;
        setForm({
          name: p.name || '',
          brand: p.brand || '',
          category: p.category || '',
          subcategory: p.subcategory || '',
          description: p.description || '',
          price: p.price || '',
          discount: p.discount || '',
          stock: p.stock || '',
          is_featured: !!p.is_featured,
          images: [],
          existingImages: p.images || [],
          colors: p.colors || [],
          specs: p.specs || {},
        });
        if (p.colors && p.colors.length > 0) setShowColorSection(true);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  const selectedCategory = categories.find((c) => c.name === form.category);
  const subcategoryOptions = selectedCategory?.subcategories || [];
  const currentSpecs = specsByCategory[form.category] || [];
  const currentSizes = sizesByCategory[form.category] || [];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else if (type === 'file') {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...Array.from(files)] }));
    } else if (name === 'category') {
      setForm({ ...form, category: value, subcategory: '', specs: {} });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSpecChange = (key, value) => {
    setForm((prev) => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
  };

  const handleImageDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(form.images);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setForm((prev) => ({ ...prev, images: reordered }));
  };

  const handleExistingImageDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(form.existingImages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setForm((prev) => ({ ...prev, existingImages: reordered }));
  };

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const toggleColor = (hex) => {
    setForm((prev) => {
      const exists = prev.colors.find((c) => c.hex === hex);
      if (exists) return { ...prev, colors: prev.colors.filter((c) => c.hex !== hex) };
      return { ...prev, colors: [...prev.colors, { hex, stock: 0, sizes: [], newImages: [] }] };
    });
  };

  const toggleSizeForColor = (hex, size) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => {
        if (c.hex !== hex) return c;
        const existsSize = c.sizes?.find((s) => s.size === size);
        if (existsSize) return { ...c, sizes: c.sizes.filter((s) => s.size !== size) };
        return { ...c, sizes: [...(c.sizes || []), { size, stock: 0 }] };
      }),
    }));
  };

  const setSizeStock = (hex, size, stock) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => {
        if (c.hex !== hex) return c;
        return {
          ...c,
          sizes: c.sizes.map((s) => s.size === size ? { ...s, stock: Number(stock) } : s),
          stock: c.sizes.reduce((sum, s) => sum + (s.size === size ? Number(stock) : (s.stock || 0)), 0),
        };
      }),
    }));
  };

  const setColorImages = (hex, files) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((c) =>
        c.hex === hex ? { ...c, newImages: Array.from(files) } : c
      ),
    }));
  };

  const totalStock = showColorSection && form.colors.length > 0
    ? form.colors.reduce((sum, c) => sum + (c.sizes?.reduce((s, sz) => s + (Number(sz.stock) || 0), 0) || 0), 0)
    : Number(form.stock) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('brand', form.brand);
    formData.append('category', form.category);
    formData.append('subcategory', form.subcategory || '');
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('discount', form.discount || 0);
    formData.append('stock', totalStock);
    formData.append('is_featured', form.is_featured ? 1 : 0);
    formData.append('specs', JSON.stringify(form.specs));

    if (showColorSection && form.colors.length > 0) {
      // Colors sans les newImages pour le JSON
      const colorsForJson = form.colors.map(({ newImages, ...rest }) => rest);
      formData.append('colors', JSON.stringify(colorsForJson));

      // Envoyer les images par couleur séparément
      form.colors.forEach((c) => {
        if (c.newImages && c.newImages.length > 0) {
          const hexKey = c.hex.replace('#', '');
          c.newImages.forEach((file, idx) => {
            formData.append(`color_images_${hexKey}[${idx}]`, file);
          });
        }
      });
    } else {
      formData.append('colors', JSON.stringify([]));
    }

    formData.append('sizes', JSON.stringify([]));

    if (form.images.length > 0) {
      form.images.forEach((file, index) => formData.append(`images[${index}]`, file));
    } else if (form.existingImages.length > 0) {
      formData.append('existing_images_order', JSON.stringify(form.existingImages));
    }

    try {
      if (isEditing) {
        formData.append('_method', 'PUT');
        await api.post(`/products/${id}`, formData);
        setMessage('Produit modifié avec succès !');
        setMessageType('success');
      } else {
        await api.post('/products', formData);
        setMessage('Produit ajouté avec succès !');
        setMessageType('success');
      }
      setTimeout(() => navigate('/admin/produits'), 1000);
    } catch (err) {
      if (err.response?.status === 403) {
        setMessage('🚫 Accès refusé.');
        setMessageType('error');
      } else {
        setMessage("Erreur lors de l'enregistrement.");
        setMessageType('error');
      }
    }
  };

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main"><p className="admin-loading">Chargement...</p></main>
    </div>
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="apf-header">
          <div>
            <h1>{isEditing ? 'Modifier le produit' : 'Ajouter un produit'}</h1>
            <p className="apf-subtitle">Mode & Vêtements — remplissez les informations du produit</p>
          </div>
          <button className="apf-btn-back" onClick={() => navigate('/admin/produits')}>← Retour</button>
        </div>

        {message && (
          <p className={`admin-message ${messageType === 'error' ? 'admin-message-error' : ''}`}>{message}</p>
        )}

        <form className="apf-form" onSubmit={handleSubmit}>
          <div className="apf-left">

            {/* Infos générales */}
            <div className="apf-card">
              <h3>Informations générales</h3>
              <div className="apf-field">
                <label>Nom du produit *</label>
                <input type="text" name="name" placeholder="Ex: T-shirt Col Rond Premium" value={form.name} onChange={handleChange} required />
              </div>
              <div className="apf-field">
                <label>Marque</label>
                <input type="text" name="brand" placeholder="Ex: Nike, Adidas, Zara..." value={form.brand} onChange={handleChange} />
              </div>
              <div className="apf-field-row">
                <div className="apf-field">
                  <label>Catégorie *</label>
                  <select name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                {subcategoryOptions.length > 0 && (
                  <div className="apf-field">
                    <label>Sous-catégorie</label>
                    <select name="subcategory" value={form.subcategory} onChange={handleChange}>
                      <option value="">Sélectionner</option>
                      {subcategoryOptions.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="apf-field">
                <label>Description</label>
                <textarea name="description" placeholder="Décrivez le produit, matière, coupe, style..." value={form.description} onChange={handleChange} rows={4} />
              </div>
            </div>

            {/* Specs */}
            {currentSpecs.length > 0 && (
              <div className="apf-card">
                <h3>👗 Caractéristiques</h3>
                <div className="apf-specs-grid">
                  {currentSpecs.map((spec) => (
                    <div key={spec.key} className="apf-field">
                      <label>{spec.label}</label>
                      {spec.type === 'select' ? (
                        <select value={form.specs[spec.key] || ''} onChange={(e) => handleSpecChange(spec.key, e.target.value)}>
                          <option value="">Sélectionner</option>
                          {spec.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input type="text" placeholder={spec.placeholder} value={form.specs[spec.key] || ''} onChange={(e) => handleSpecChange(spec.key, e.target.value)} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prix */}
            <div className="apf-card">
              <h3>Tarification & Stock</h3>
              <div className="apf-field-row">
                <div className="apf-field">
                  <label>Prix (DH) *</label>
                  <input type="number" name="price" placeholder="0.00" value={form.price} onChange={handleChange} step="0.01" required />
                </div>
                <div className="apf-field">
                  <label>Discount (%)</label>
                  <input type="number" name="discount" placeholder="Ex: 20" value={form.discount} onChange={handleChange} min="0" max="100" />
                </div>
              </div>
              {!showColorSection && (
                <div className="apf-field">
                  <label>Stock disponible</label>
                  <input type="number" name="stock" placeholder="Ex: 50" value={form.stock} onChange={handleChange} min="0" />
                </div>
              )}
              <label className="apf-checkbox">
                <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
                Mettre en vedette sur la page d'accueil
              </label>
            </div>

            {/* Couleurs & Tailles */}
            <div className="apf-card">
              <div className="apf-colors-toggle-header">
                <div>
                  <h3>Couleurs & Tailles</h3>
                  <p className="apf-photo-hint">Gérez le stock par couleur, taille et photos</p>
                </div>
                <label className="apf-toggle">
                  <input type="checkbox" checked={showColorSection} onChange={(e) => {
                    setShowColorSection(e.target.checked);
                    if (!e.target.checked) setForm((prev) => ({ ...prev, colors: [] }));
                  }} />
                  <span className="apf-toggle-slider" />
                </label>
              </div>

              {showColorSection && (
                <>
                  <div className="apf-colors-grid">
                    {availableColors.map((color) => (
                      <button key={color.hex} type="button"
                        className={`apf-color-btn ${form.colors.find((c) => c.hex === color.hex) ? 'selected' : ''}`}
                        onClick={() => toggleColor(color.hex)}
                      >
                        <span className="apf-color-swatch" style={{ backgroundColor: color.hex }} />
                        {color.name}
                      </button>
                    ))}
                  </div>

                  {form.colors.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      {form.colors.map((c) => {
                        const colorInfo = availableColors.find((ac) => ac.hex === c.hex);
                        return (
                          <div key={c.hex} className="apf-color-accordion">
                            <div className="apf-color-accordion-header">
                              <span className="apf-color-swatch" style={{ backgroundColor: c.hex }} />
                              <span style={{ fontWeight: 600, fontSize: '13px' }}>{colorInfo?.name}</span>
                              <span style={{ fontSize: '11px', color: '#888', marginLeft: 'auto' }}>
                                Stock : {c.sizes?.reduce((s, sz) => s + (Number(sz.stock) || 0), 0) || 0}
                              </span>
                            </div>

                            {/* Tailles */}
                            {currentSizes.length > 0 && (
                              <div className="apf-sizes-grid">
                                {currentSizes.map((size) => {
                                  const sizeData = c.sizes?.find((s) => s.size === size);
                                  return (
                                    <div key={size} className="apf-size-item">
                                      <button type="button"
                                        className={`apf-size-chip ${sizeData ? 'selected' : ''}`}
                                        onClick={() => toggleSizeForColor(c.hex, size)}
                                      >
                                        {size}
                                      </button>
                                      {sizeData && (
                                        <input type="number" min="0" placeholder="Stock"
                                          value={sizeData.stock || 0}
                                          onChange={(e) => setSizeStock(c.hex, size, e.target.value)}
                                          className="apf-size-stock-input"
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Photos pour cette couleur */}
                            <div className="apf-color-images">
                              <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>
                                📷 Photos pour la couleur {colorInfo?.name}
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setColorImages(c.hex, e.target.files)}
                                style={{ fontSize: '12px' }}
                              />
                              {/* Aperçu nouvelles photos */}
                              {c.newImages?.length > 0 && (
                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                  {c.newImages.map((file, idx) => (
                                    <img key={idx}
                                      src={URL.createObjectURL(file)}
                                      alt={`new-${idx}`}
                                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #cc0000' }}
                                    />
                                  ))}
                                </div>
                              )}
                              {/* Photos existantes */}
                              {c.images?.length > 0 && (
                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                  {c.images.map((img, idx) => (
                                    <img key={idx}
                                      src={`https://mblifestyle-backend-production.up.railway.app/storage/${img}`}
                                      alt={`color-img-${idx}`}
                                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div className="apf-total-stock-row">
                        <span>Stock total calculé :</span>
                        <strong>{totalStock} unités</strong>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="apf-right">
            {/* Photos générales */}
            <div className="apf-card">
              <h3>Photos générales du produit</h3>
              <p className="apf-photo-hint">Photos principales — la 1ère = photo par défaut</p>
              <label className="apf-upload-zone">
                <input type="file" accept="image/*" multiple onChange={handleChange} style={{ display: 'none' }} />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="32" height="32">
                  <polyline points="16 16 12 12 8 16" strokeWidth="2" />
                  <line x1="12" y1="12" x2="12" y2="21" strokeWidth="2" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" strokeWidth="2" />
                </svg>
                <span>Cliquer pour uploader</span>
                <span className="apf-upload-hint">PNG, JPG, WEBP — max 10MB</span>
              </label>

              {form.existingImages.length > 0 && (
                <div className="apf-existing-images">
                  <p className="apf-photo-hint">Photos enregistrées :</p>
                  <DragDropContext onDragEnd={handleExistingImageDragEnd}>
                    <Droppable droppableId="existing" direction="horizontal">
                      {(provided) => (
                        <div className="apf-images-grid" ref={provided.innerRef} {...provided.droppableProps}>
                          {form.existingImages.map((img, index) => (
                            <Draggable key={img + index} draggableId={img + index} index={index}>
                              {(provided, snapshot) => (
                                <div className={`apf-image-thumb ${snapshot.isDragging ? 'dragging' : ''}`}
                                  ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                  <img src={`https://mblifestyle-backend-production.up.railway.app/storage/${img}`} alt={`img-${index}`} />
                                  <span className="apf-image-badge">{index === 0 ? 'Principal' : index + 1}</span>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}

              {form.images.length > 0 && (
                <DragDropContext onDragEnd={handleImageDragEnd}>
                  <Droppable droppableId="new-images" direction="horizontal">
                    {(provided) => (
                      <div className="apf-images-grid" ref={provided.innerRef} {...provided.droppableProps}>
                        {form.images.map((file, index) => (
                          <Draggable key={file.name + index} draggableId={file.name + index} index={index}>
                            {(provided, snapshot) => (
                              <div className={`apf-image-thumb ${snapshot.isDragging ? 'dragging' : ''}`}
                                ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                <img src={URL.createObjectURL(file)} alt={`new-${index}`} />
                                <span className="apf-image-badge">{index === 0 ? 'Principal' : index + 1}</span>
                                <button type="button" className="apf-image-remove" onClick={() => removeImage(index)}>✕</button>
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

            {/* Submit */}
            <div className="apf-card apf-submit-card">
              <div className="apf-stock-summary">
                <span>Stock total</span>
                <span className="apf-stock-total">{totalStock} unités</span>
              </div>
              <button type="submit" className="apf-btn-submit">
                {isEditing ? 'Enregistrer les modifications' : 'Ajouter le produit'}
              </button>
              <button type="button" className="apf-btn-cancel" onClick={() => navigate('/admin/produits')}>
                Annuler
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AdminProductForm;