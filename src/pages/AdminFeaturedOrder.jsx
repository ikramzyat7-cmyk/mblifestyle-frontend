import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminFeaturedOrder.css';
import { storageUrl } from '../api/config';
function AdminFeaturedOrder() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/products').then((res) => {
      const featured = res.data
        .filter((p) => p.is_featured)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      setProducts(featured);
      setLoading(false);
    });
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(products);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setProducts(reordered);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const orders = products.map((p, index) => ({
        id: p.id,
        display_order: index,
      }));
      await api.post('/products/reorder', { orders });
      setMessage('Ordre sauvegardé avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Erreur lors de la sauvegarde.');
    }
    setSaving(false);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-header-bar">
          <div>
            <h1>Ordre des produits en vedette</h1>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              Glisse les produits pour changer leur ordre d'affichage dans "Nos coups de cœur"
            </p>
          </div>
          <button
            className="btn-add-product"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder l\'ordre'}
          </button>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {loading ? (
          <p className="admin-loading">Chargement...</p>
        ) : products.length === 0 ? (
          <div className="afo-empty">
            <p>Aucun produit en vedette.</p>
            <p style={{ fontSize: '13px', color: '#888' }}>
              Marquez des produits comme "En vedette" depuis la liste des produits.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="featured-products">
              {(provided) => (
                <div
                  className="afo-list"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {products.map((product, index) => (
                    <Draggable
                      key={product.id}
                      draggableId={String(product.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className={`afo-item ${snapshot.isDragging ? 'dragging' : ''}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div className="afo-drag-handle" {...provided.dragHandleProps}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                              <line x1="8" y1="6" x2="21" y2="6" strokeWidth="2" />
                              <line x1="8" y1="12" x2="21" y2="12" strokeWidth="2" />
                              <line x1="8" y1="18" x2="21" y2="18" strokeWidth="2" />
                              <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2" />
                              <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2" />
                              <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2" />
                            </svg>
                          </div>

                          <span className="afo-position">{index + 1}</span>

                          <div className="afo-image">
                            {product.images?.[0] ? (
                              <img
                                src={`${storageUrl(product.images[0])}`}
                                alt={product.name}
                              />
                            ) : (
                              <div className="afo-image-placeholder">—</div>
                            )}
                          </div>

                          <div className="afo-info">
                            <p className="afo-name">{product.name}</p>
                            {product.brand && (
                              <p className="afo-brand">{product.brand}</p>
                            )}
                            <p className="afo-category">{product.category}</p>
                          </div>

                          <div className="afo-price">
                            {product.discount > 0 ? (
                              <>
                                <span className="afo-price-old">
                                  {parseFloat(product.price).toFixed(2)} DH
                                </span>
                                <span className="afo-price-new">
                                  {(product.price - (product.price * product.discount / 100)).toFixed(2)} DH
                                </span>
                              </>
                            ) : (
                              <span className="afo-price-new">{product.price} DH</span>
                            )}
                          </div>

                          <div className="afo-colors">
                            {(product.colors || []).map((c) => (
                              <span
                                key={c.hex}
                                className="afo-color-dot"
                                style={{ backgroundColor: c.hex }}
                                title={c.hex}
                              ></span>
                            ))}
                          </div>

                          <span className={`afo-stock ${product.stock <= 0 ? 'out' : ''}`}>
                            {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
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
        )}
      </main>
    </div>
  );
}

export default AdminFeaturedOrder;