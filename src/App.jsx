import ProductDetail from './pages/ProductDetail';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Cart from './pages/Cart';
import TrackOrder from './pages/TrackOrder'; 
import ProtectedRoute from './components/ProtectedRoute';
import CategoryPage from './pages/CategoryPage';
import SearchResults from './pages/SearchResults';
import NewArrivals from './pages/NewArrivals';
import AllProducts from './pages/AllProducts';
import Contact from './pages/Contact';
import OutfitBuilder from './pages/OutfitBuilder';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import AdminNewArrivals from './pages/AdminNewArrivals';
import AdminProductForm from './pages/AdminProductForm';
import AdminProductDetail from './pages/AdminProductDetail';
import AllCategories from './pages/AllCategories';
import AdminPopup from './pages/AdminPopup';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';
import AdminReviews from './pages/AdminReviews';
import AdminSlides from './pages/AdminSlides';
import AdminFeaturedOrder from './pages/AdminFeaturedOrder';
import AdminActivityLog from './pages/AdminActivityLog';
import AdminUsers from './pages/AdminUsers';
import RoleGuard from './components/RoleGuard';
import AdminBanners from './pages/AdminBanners';
import AdminDelivery from './pages/AdminDelivery';
import NotFound from './pages/NotFound';
import Welcome from './pages/Welcome';
import CookieBanner from './components/CookieBanner';
import CGV from './pages/CGV';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import Wishlist from './pages/Wishlist';
import { WishlistProvider } from './context/WishlistContext';




function App() {
  return (
    <WishlistProvider>
    <CartProvider>
      <CookieBanner />
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/mb-gestion-2026" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/panier" element={<Cart />} />
          <Route path="/suivre-commande" element={<TrackOrder />} />
          <Route path="/produit/:id" element={<ProductDetail />} />
          <Route path="/categorie/:slug" element={<CategoryPage />} />
          <Route path="/recherche" element={<SearchResults />} />
          <Route path="/nouveautes" element={<NewArrivals />} />
          <Route path="/catalogue" element={<AllProducts />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/compose-ton-look" element={<OutfitBuilder />} />
          <Route path="/categories" element={<AllCategories />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/favoris" element={<Wishlist />} />
<Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          {/* Routes admin — toutes enveloppées dans ThemeProvider */}
          <Route path="/admin/*" element={
            <AuthProvider>
  <ThemeProvider>
              <Routes>
                <Route index element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="produits" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="produits/ajouter" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
                <Route path="produits/modifier/:id" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
                <Route path="produits/detail/:id" element={<ProtectedRoute><AdminProductDetail /></ProtectedRoute>} />
                <Route path="categories" element={
  <ProtectedRoute>
    <RoleGuard allow={['super_admin', 'stock_manager']}>
      <AdminCategories />
    </RoleGuard>
  </ProtectedRoute>
} />
                <Route path="nouveautes" element={
  <ProtectedRoute>
    <RoleGuard allow={['super_admin', 'stock_manager']}>
      <AdminNewArrivals />
    </RoleGuard>
  </ProtectedRoute>
} />
                <Route path="popup" element={
  <ProtectedRoute>
    <RoleGuard allow={['super_admin', 'stock_manager']}>
      <AdminPopup />
    </RoleGuard>
  </ProtectedRoute>
} />
<Route path="livraison" element={
  <ProtectedRoute>
    <AdminDelivery />
  </ProtectedRoute>
} />
                <Route path="commandes" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                <Route path="parametres" element={
  <ProtectedRoute>
    <RoleGuard allow={['super_admin']}>
      <AdminSettings />
    </RoleGuard>
  </ProtectedRoute>
} />
                <Route path="avis" element={
  <ProtectedRoute>
    <RoleGuard allow={['super_admin', 'stock_manager']}>
      <AdminReviews />
    </RoleGuard>
  </ProtectedRoute>
} />
                <Route path="slides" element={
  <ProtectedRoute>
    <RoleGuard allow={['super_admin', 'stock_manager']}>
      <AdminSlides />
    </RoleGuard>
  </ProtectedRoute>
} />
                <Route path="vedette-ordre" element={<ProtectedRoute><AdminFeaturedOrder /></ProtectedRoute>} />
                <Route path="historique" element={
  <ProtectedRoute>
    <RoleGuard allow={['super_admin']}>
      <AdminActivityLog />
    </RoleGuard>
  </ProtectedRoute>
} />
                <Route path="admins" element={
  <ProtectedRoute>
    <RoleGuard allow={['super_admin']}>
      <AdminUsers />
    </RoleGuard>
  </ProtectedRoute>
} />
<Route path="banners" element={
  <ProtectedRoute>
    <RoleGuard allow={['super_admin', 'stock_manager']}>
      <AdminBanners />
    </RoleGuard>
  </ProtectedRoute>
} />
              </Routes>
              </ThemeProvider>
              </AuthProvider>
          } />
        </Routes>
      </BrowserRouter>
          </CartProvider>
    </WishlistProvider>
  );
}

export default App;