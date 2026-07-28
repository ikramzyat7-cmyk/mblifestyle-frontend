import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import './AdminDashboard.css';

const COLORS = ['#111111', '#1e3a8a', '#2e7d32', '#e74c3c', '#f59e0b', '#888888', '#d8c3a5'];

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/orders'),
    ]).then(([productsRes, ordersRes]) => {
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const totalProducts = products.length;
  const inStock = products.filter((p) => p.stock > 0).length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;
  const featured = products.filter((p) => p.is_featured).length;

  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Chiffre d'affaires par jour
  const getRevenueData = () => {
    const days = parseInt(period);
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const dayOrders = confirmedOrders.filter((o) => {
        const orderDate = new Date(o.created_at);
        return orderDate.toDateString() === date.toDateString();
      });
      const revenue = dayOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
      data.push({ date: dateStr, revenue: Math.round(revenue) });
    }
    return data;
  };

  // Produits les plus commandés
  const getTopProducts = () => {
    const productCount = {};
    confirmedOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!productCount[item.product_name]) {
          productCount[item.product_name] = 0;
        }
        productCount[item.product_name] += item.quantity;
      });
    });
    return Object.entries(productCount)
      .map(([name, qty]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  };

  // Catégories les plus vendues
  const getTopCategories = () => {
    const catCount = {};
    confirmedOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const product = products.find((p) => p.id === item.product_id);
        if (product) {
          catCount[product.category] = (catCount[product.category] || 0) + item.quantity;
        }
      });
    });
    return Object.entries(catCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const revenueData = getRevenueData();
  const topProducts = getTopProducts();
  const topCategories = getTopCategories();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          <p className="chart-tooltip-value">{payload[0].value} DH</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-main-header">
          <h1>Dashboard</h1>
        </div>

        {loading ? (
          <p className="admin-loading">Chargement...</p>
        ) : (
          <>
            {/* Stats cards */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-top"><span>Total produits</span></div>
                <p className="admin-stat-value">{totalProducts}</p>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-top"><span>En stock</span></div>
                <p className="admin-stat-value">{inStock}</p>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-top"><span>Rupture de stock</span></div>
                <p className="admin-stat-value admin-stat-danger">{outOfStock}</p>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-top"><span>En vedette</span></div>
                <p className="admin-stat-value admin-stat-accent">{featured}</p>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-top"><span>Chiffre d'affaires</span></div>
                <p className="admin-stat-value" style={{ fontSize: '22px' }}>
                  {totalRevenue.toFixed(0)} DH
                </p>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-top"><span>Commandes en attente</span></div>
                <p className="admin-stat-value admin-stat-danger">{pendingOrders}</p>
              </div>
            </div>

            {/* Graphiques */}
            <div className="dashboard-charts">

              {/* Chiffre d'affaires */}
              <div className="dashboard-chart-card dashboard-chart-wide">
                <div className="dashboard-chart-header">
                  <h3>Chiffre d'affaires</h3>
                  <div className="dashboard-period-selector">
                    {['7', '14', '30'].map((d) => (
                      <button
                        key={d}
                        className={`dashboard-period-btn ${period === d ? 'active' : ''}`}
                        onClick={() => setPeriod(d)}
                      >
                        {d}j
                      </button>
                    ))}
                  </div>
                </div>
                {revenueData.some((d) => d.revenue > 0) ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#1e3a8a"
                        strokeWidth={2.5}
                        dot={{ fill: '#1e3a8a', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-empty">Aucune vente sur cette période</div>
                )}
              </div>

              {/* Produits les plus commandés */}
              <div className="dashboard-chart-card">
                <div className="dashboard-chart-header">
                  <h3>Top produits</h3>
                </div>
                {topProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="qty" fill="#111111" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-empty">Aucune commande confirmée</div>
                )}
              </div>

              {/* Catégories les plus vendues */}
              <div className="dashboard-chart-card">
                <div className="dashboard-chart-header">
                  <h3>Catégories vendues</h3>
                </div>
                {topCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={topCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {topCategories.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span style={{ fontSize: '11px' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-empty">Aucune commande confirmée</div>
                )}
              </div>
            </div>

            {/* Produits récents */}
            <div className="admin-recent-section">
              <div className="admin-recent-header">
                <h2>Produits récents</h2>
                <Link to="/admin/produits" className="admin-view-all">Voir tout →</Link>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Prix</th>
                      <th>Couleurs</th>
                      <th>Tailles</th>
                      <th>Stock</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((product) => {
                      const thumbUrl = product.images?.[0]
                        ? `http://127.0.0.1:8000/storage/${product.images[0]}`
                        : null;

                      return (
                        <tr key={product.id}>
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
                          <td>
                            {product.colors && product.colors.length > 0 ? (
                              <div className="admin-table-colors">
                                {product.colors.map((c) => (
                                  <span
                                    key={c.hex}
                                    className={`admin-table-color-dot ${c.stock <= 0 ? 'out-of-stock' : ''}`}
                                    style={{ backgroundColor: c.hex }}
                                    title={`${c.hex} — ${c.stock > 0 ? c.stock + ' en stock' : 'Rupture'}`}
                                  ></span>
                                ))}
                              </div>
                            ) : '—'}
                          </td>
                          <td>
                            {product.sizes && product.sizes.length > 0 ? (
                              <div className="admin-dashboard-sizes">
                                {product.sizes.map((s) => (
                                  <span
                                    key={s.size}
                                    className={`admin-dashboard-size-tag ${s.stock <= 0 ? 'out-of-stock' : ''}`}
                                  >
                                    {s.size}
                                  </span>
                                ))}
                              </div>
                            ) : '—'}
                          </td>
                          <td>{product.stock}</td>
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
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;