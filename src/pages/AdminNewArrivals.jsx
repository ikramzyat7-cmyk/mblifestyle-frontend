import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminDashboard.css';
import { storageUrl } from '../api/config';
import LoadingScreen from '../components/LoadingScreen';
function AdminNewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };
  
  const handleDeleteSelected = async () => {
    if (!window.confirm(`Supprimer ${selectedIds.length} produit(s) ?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/products/${id}`)));
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setProducts(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-main-header">
          <h1>Nouveautés</h1>
        </div>

        {loading ? (
          <LoadingScreen />
        ) : (
          <div className="admin-recent-section">
            <div className="admin-recent-header">
  <h2>Tous les produits, du plus récent au plus ancien</h2>
  {selectedIds.length > 0 && (
    <button className="btn-delete-selected" onClick={handleDeleteSelected}>
      🗑 Supprimer la sélection ({selectedIds.length})
    </button>
  )}
</div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                <tr>
  <th>
    <input
      type="checkbox"
      checked={selectedIds.length === products.length && products.length > 0}
      onChange={toggleSelectAll}
      className="admin-checkbox"
    />
  </th>
  <th>Photo</th>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Ajouté le</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const thumbUrl = product.images?.[0]
                      ? `${storageUrl(product.images[0])}`
                      : null;

                    const formattedDate = new Date(product.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });

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
                        <td>{product.category}</td>
                        <td className="admin-table-price">{product.price} DH</td>
                        <td>{product.stock}</td>
                        <td>{formattedDate}</td>
                        <td>
                          {product.stock > 0 ? (
                            <span className="admin-badge-yes">En stock</span>
                          ) : (
                            <span className="admin-badge-stock-out">Rupture</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminNewArrivals;