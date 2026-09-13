import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminProductDetail.css';
import { storageUrl } from '../api/config';
function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <p className="admin-loading">Chargement...</p>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <p className="admin-loading">Produit introuvable.</p>
        </main>
      </div>
    );
  }

  const images = product.images || [];
  const selectedColorData = product.colors?.find((c) => c.hex === selectedColor);
  const mainImage = selectedColorData?.image
    ? `${storageUrl(selectedColorData.image)}`
    : images[activeImage]
    ? `${storageUrl(images[activeImage])}`
    : 'https://via.placeholder.com/500x600/f5f5f5/999999?text=Pas+d%27image';

  const inStockSizes = (product.sizes || []).filter((s) => s.stock > 0);
  const outOfStockSizes = (product.sizes || []).filter((s) => s.stock <= 0);
  const inStockColors = (product.colors || []).filter((c) => c.stock > 0);
  const outOfStockColors = (product.colors || []).filter((c) => c.stock <= 0);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="apd-header">
          <div>
            <button className="apf-btn-back" onClick={() => navigate('/admin/produits')}>
              ← Retour
            </button>
          </div>
          <Link
            to={`/admin/produits/modifier/${product.id}`}
            className="apd-btn-edit"
          >
            Modifier ce produit
          </Link>
        </div>

        <div className="apd-layout">
          <div className="apd-gallery">
            <div className="apd-main-image">
              <img src={mainImage} alt={product.name} />
              {product.stock <= 0 && (
                <div className="apd-out-of-stock-overlay">Rupture de stock</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="apd-thumbnails">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`apd-thumb ${activeImage === index && !selectedColor ? 'active' : ''}`}
                    onClick={() => { setActiveImage(index); setSelectedColor(null); }}
                  >
                    <img
                      src={`${storageUrl(img)}`}
                      alt={`thumb-${index}`}
                    />
                    <span className="apd-thumb-label">
                      {index === 0 ? 'Recto' : index === 1 ? 'Verso' : index + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="apd-info">
            <div className="apd-info-header">
              {product.brand && <p className="apd-brand">{product.brand}</p>}
              <h1 className="apd-name">{product.name}</h1>
              <p className="apd-price">{product.price} DH</p>
              {product.subcategory && (
                <span className="apd-badge">{product.subcategory}</span>
              )}
            </div>

            <div className="apd-section">
              <h3>Informations générales</h3>
              <div className="apd-info-grid">
                <div className="apd-info-item">
                  <span className="apd-info-label">Catégorie</span>
                  <span className="apd-info-value">{product.category}</span>
                </div>
                <div className="apd-info-item">
                  <span className="apd-info-label">Stock global</span>
                  <span className={`apd-info-value ${product.stock <= 0 ? 'text-danger' : 'text-success'}`}>
                    {product.stock > 0 ? `${product.stock} unités` : 'Rupture de stock'}
                  </span>
                </div>
                <div className="apd-info-item">
                  <span className="apd-info-label">En vedette</span>
                  <span className="apd-info-value">
                    {product.is_featured ? (
                      <span className="admin-badge-yes">Oui</span>
                    ) : (
                      <span className="admin-badge-no">Non</span>
                    )}
                  </span>
                </div>
                <div className="apd-info-item">
                  <span className="apd-info-label">Ajouté le</span>
                  <span className="apd-info-value">
                    {new Date(product.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {product.description && (
              <div className="apd-section">
                <h3>Description</h3>
                <p className="apd-description">{product.description}</p>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="apd-section">
                <h3>Couleurs</h3>

                {inStockColors.length > 0 && (
                  <div className="apd-subsection">
                    <p className="apd-subsection-label text-success">
                      ✓ En stock ({inStockColors.length})
                    </p>
                    <div className="apd-colors-row">
                      {inStockColors.map((c) => (
                        <button
                          key={c.hex}
                          className={`apd-color-dot ${selectedColor === c.hex ? 'active' : ''}`}
                          style={{ backgroundColor: c.hex }}
                          onClick={() => setSelectedColor(selectedColor === c.hex ? null : c.hex)}
                          title={`${c.hex} — ${c.stock} en stock`}
                        >
                          {selectedColor === c.hex && (
                            <span className="apd-color-check">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="apd-color-stocks">
                      {inStockColors.map((c) => (
                        <div key={c.hex} className="apd-color-stock-row">
                          <span className="apd-color-swatch" style={{ backgroundColor: c.hex }}></span>
                          <span>{c.hex}</span>
                          <span className="text-success">{c.stock} en stock</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {outOfStockColors.length > 0 && (
                  <div className="apd-subsection">
                    <p className="apd-subsection-label text-danger">
                      ✕ Rupture de stock ({outOfStockColors.length})
                    </p>
                    <div className="apd-colors-row">
                      {outOfStockColors.map((c) => (
                        <div
                          key={c.hex}
                          className="apd-color-dot out-of-stock"
                          style={{ backgroundColor: c.hex }}
                          title={`${c.hex} — Rupture`}
                        ></div>
                      ))}
                    </div>
                    <div className="apd-color-stocks">
                      {outOfStockColors.map((c) => (
                        <div key={c.hex} className="apd-color-stock-row">
                          <span className="apd-color-swatch out-of-stock" style={{ backgroundColor: c.hex }}></span>
                          <span>{c.hex}</span>
                          <span className="text-danger">Rupture</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="apd-section">
                <h3>Tailles</h3>

                {inStockSizes.length > 0 && (
                  <div className="apd-subsection">
                    <p className="apd-subsection-label text-success">
                      ✓ En stock ({inStockSizes.length})
                    </p>
                    <div className="apd-sizes-row">
                      {inStockSizes.map((s) => (
                        <div key={s.size} className="apd-size-tag">
                          <span className="apd-size-label">{s.size}</span>
                          <span className="apd-size-stock text-success">{s.stock}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {outOfStockSizes.length > 0 && (
                  <div className="apd-subsection">
                    <p className="apd-subsection-label text-danger">
                      ✕ Rupture de stock ({outOfStockSizes.length})
                    </p>
                    <div className="apd-sizes-row">
                      {outOfStockSizes.map((s) => (
                        <div key={s.size} className="apd-size-tag out-of-stock">
                          <span className="apd-size-label">{s.size}</span>
                          <span className="apd-size-stock text-danger">0</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminProductDetail;