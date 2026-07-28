import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../hooks/useSettings';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import api from '../api/axios';
import './Cart.css';

const colorNames = {
  '#111111': 'Noir', '#f5f5f5': 'Blanc', '#cc0000': 'Rouge',
  '#1e3a8a': 'Bleu', '#0a1f5c': 'Marine', '#2e7d32': 'Vert',
  '#d8c3a5': 'Beige', '#888888': 'Gris', '#e91e8c': 'Rose',
  '#c19a6b': 'Camel', '#6d1a2a': 'Bordeaux', '#5c5c2e': 'Kaki',
};

function Cart() {
  const settings = useSettings();
  const navigate = useNavigate();
  const whatsappNumber = settings.whatsapp_number || '212786972636';
  const { cartItems, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();

  const [showConfirm, setShowConfirm] = useState(false);
  const [customer, setCustomer] = useState({
    firstName: '', lastName: '', phone: '', address: '', note: '',
  });
  const [errors, setErrors] = useState({});
  const [orderSent, setOrderSent] = useState(false);
  const [suggested, setSuggested] = useState([]);
  const [citySearch, setCitySearch] = useState('');
const [showCityList, setShowCityList] = useState(false);
  useEffect(() => {
    api.get('/products').then((res) => {
      const shuffled = [...res.data].sort(() => Math.random() - 0.5);
      setSuggested(shuffled.slice(0, 4));
    });
  }, []);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  
  useEffect(() => {
    api.get('/delivery-cities').then((res) => setCities(res.data));
  }, []);
  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!customer.firstName.trim()) newErrors.firstName = 'Requis';
    if (!customer.lastName.trim()) newErrors.lastName = 'Requis';
    if (!customer.phone.trim()) newErrors.phone = 'Requis';
    if (!selectedCity) newErrors.city = 'Veuillez choisir votre ville';
    else if (!/^[0-9+\s]{8,15}$/.test(customer.phone.trim())) newErrors.phone = 'Numéro invalide';
    if (!customer.address.trim()) newErrors.address = 'Requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const discountedTotal = cartItems.reduce((sum, item) => {
    const price = item.product.discount > 0
      ? item.product.price - (item.product.price * item.product.discount / 100)
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const handleOrderOnWhatsApp = async () => {
    if (!validateForm()) return;

    try {
      await api.post('/orders', {
        customer_name: `${customer.firstName} ${customer.lastName}`,
        customer_phone: customer.phone,
        customer_address: customer.address,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          price: item.product.discount > 0
            ? (item.product.price - item.product.price * item.product.discount / 100).toFixed(2)
            : item.product.price,
        })),
        total: discountedTotal,
      });
    } catch (err) {
      console.error('Erreur commande:', err);
    }

    let message = '🛍️ *Nouvelle commande MBLifestyle*\n\n';
    message += `👤 *Client :* ${customer.firstName} ${customer.lastName}\n`;
    message += `📞 *Téléphone :* ${customer.phone}\n`;
    message += `📍 *Adresse :* ${customer.address}\n`;
    if (customer.note) message += `📝 *Note :* ${customer.note}\n`;
    message += '\n*─── Articles ───*\n';

    cartItems.forEach((item, index) => {
      const price = item.product.discount > 0
        ? (item.product.price - item.product.price * item.product.discount / 100).toFixed(2)
        : item.product.price;
      message += `\n${index + 1}. *${item.product.name}*`;
      if (item.product.brand) message += ` (${item.product.brand})`;
      if (item.color) message += `\n   🎨 Couleur: ${colorNames[item.color] || item.color}`;
      if (item.size) message += `\n   📏 Taille: ${item.size}`;
      message += `\n   📦 Quantité: ${item.quantity}`;
      message += `\n   💰 Prix: ${price} DH`;
    });

    message += `\n\n*─────────────*`;
    message += `\n💵 *Total : ${discountedTotal.toFixed(2)} DH*`;

    const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
    setOrderSent(true);
    clearCart();
  };

  const getItemImage = (item) => {
    const colorData = item.product.colors?.find((c) => c.hex === item.color);
    if (colorData?.images?.length > 0) return `https://mblifestyle-backend-production.up.railway.app/storage/${colorData.images[0]}`;
    if (item.product.images?.[0]) return `https://mblifestyle-backend-production.up.railway.app/storage/${item.product.images[0]}`;
    return null;
  };

  const getItemPrice = (item) => {
    return item.product.discount > 0
      ? (item.product.price - item.product.price * item.product.discount / 100).toFixed(2)
      : parseFloat(item.product.price).toFixed(2);
  };

  if (orderSent) {
    return (
      <div className="cart-page">
        <Header searchTerm="" onSearchChange={() => {}} />
        <div className="cart-success">
          <div className="cart-success-icon">✅</div>
          <h2>Commande envoyée !</h2>
          <p>Votre commande a été transmise via WhatsApp. Nous vous contacterons très prochainement.</p>
          <div className="cart-success-btns">
            <button onClick={() => { setOrderSent(false); navigate('/'); }} className="cart-success-btn-home">
              Retour à l'accueil
            </button>
            <button onClick={() => { setOrderSent(false); navigate('/catalogue'); }} className="cart-success-btn-shop">
              Continuer mes achats
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Header searchTerm="" onSearchChange={() => {}} />

      <div className="cart-hero">
        <div className="cart-breadcrumb">
          <Link to="/">Accueil</Link>
          <span>/</span>
          <span>Mon Panier</span>
        </div>
        <h1 className="cart-title">Mon Panier <span className="cart-count">({totalItems} article{totalItems > 1 ? 's' : ''})</span></h1>
      </div>

      <div className="cart-container">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Votre panier est vide</h2>
            <p>Découvrez nos produits et ajoutez-les à votre panier</p>
            <Link to="/catalogue" className="cart-empty-btn">Voir nos produits</Link>
          </div>
        ) : (
          <div className="cart-layout">

            {/* Articles */}
            <div className="cart-items-column">
              <div className="cart-items-header">
                <span>Produit</span>
                <span>Prix</span>
                <span>Quantité</span>
                <span>Sous-total</span>
                <span></span>
              </div>

              <div className="cart-items">
                {cartItems.map((item, index) => {
                  const imgUrl = getItemImage(item);
                  const price = getItemPrice(item);
                  const subtotal = (parseFloat(price) * item.quantity).toFixed(2);

                  return (
                    <div className="cart-item" key={index}>
                      <div className="cart-item-left">
                        <div className="cart-item-img">
                          {imgUrl ? <img src={imgUrl} alt={item.product.name} /> : <div className="cart-item-no-img">👕</div>}
                        </div>
                        <div className="cart-item-details">
                          {item.product.brand && <span className="cart-item-brand">{item.product.brand}</span>}
                          <p className="cart-item-name">{item.product.name}</p>
                          <div className="cart-item-variants">
                            {item.color && (
                              <span className="cart-item-variant">
                                <span className="cart-item-color-dot" style={{ backgroundColor: item.color }} />
                                {colorNames[item.color] || item.color}
                              </span>
                            )}
                            {item.size && <span className="cart-item-variant">Taille : {item.size}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="cart-item-price-col">
                        <span className="cart-item-price">{price} DH</span>
                        {item.product.discount > 0 && (
                          <span className="cart-item-price-old">{parseFloat(item.product.price).toFixed(2)} DH</span>
                        )}
                      </div>

                      <div className="cart-item-qty">
                        <button onClick={() => updateQuantity(index, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
                      </div>

                      <div className="cart-item-subtotal">{subtotal} DH</div>

                      <button className="cart-item-remove" onClick={() => removeFromCart(index)}>✕</button>
                    </div>
                  );
                })}
              </div>

              <div className="cart-actions">
                <Link to="/catalogue" className="cart-btn-continue">← Continuer mes achats</Link>
                <button className="cart-btn-clear" onClick={clearCart}>🗑 Vider le panier</button>
              </div>
            </div>

            {/* Checkout */}
            <div className="cart-checkout-column">
              <div className="cart-summary-box">
                <h3 className="cart-summary-title">Résumé de la commande</h3>
                <div className="cart-summary-rows">
                  <div className="cart-summary-row">
                    <span>Articles ({totalItems})</span>
                    <span>{totalPrice.toFixed(2)} DH</span>
                  </div>
                  {discountedTotal < totalPrice && (
                    <div className="cart-summary-row cart-summary-discount">
                      <span>Réduction</span>
                      <span>-{(totalPrice - discountedTotal).toFixed(2)} DH</span>
                    </div>
                  )}
                  <div className="cart-summary-row">
  <span>Livraison {selectedCity ? `(${selectedCity.name})` : ''}</span>
  <span className={deliveryPrice === 0 ? 'cart-summary-free' : ''}>
    {deliveryPrice === 0 ? 'Gratuite' : `${deliveryPrice.toFixed(2)} DH`}
  </span>
</div>
                </div>
                <div className="cart-summary-total">
  <span>Total</span>
  <span>{(discountedTotal + deliveryPrice).toFixed(2)} DH</span>
</div>
              </div>

              <div className="cart-checkout-box">
                <h3 className="cart-checkout-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                    <circle cx="12" cy="7" r="4" strokeWidth="2" />
                  </svg>
                  Vos informations
                </h3>

                <div className="checkout-field-row">
                  <div className="checkout-field">
                    <label>Prénom *</label>
                    <input type="text" name="firstName" placeholder="Mohamed" value={customer.firstName}
                      onChange={handleChange} className={errors.firstName ? 'error' : ''} />
                    {errors.firstName && <span className="checkout-error">{errors.firstName}</span>}
                  </div>
                  <div className="checkout-field">
                    <label>Nom *</label>
                    <input type="text" name="lastName" placeholder="Alami" value={customer.lastName}
                      onChange={handleChange} className={errors.lastName ? 'error' : ''} />
                    {errors.lastName && <span className="checkout-error">{errors.lastName}</span>}
                  </div>
                </div>
                <div className="checkout-field">
  <label>Ville de livraison *</label>
  <input
    type="text"
    placeholder="Cliquez pour choisir votre ville..."
    value={citySearch}
    onChange={(e) => { setCitySearch(e.target.value); setShowCityList(true); }}
    onFocus={() => setShowCityList(true)}
    onBlur={() => setTimeout(() => setShowCityList(false), 200)}
    className={errors.city ? 'error' : ''}
    autoComplete="off"
    readOnly={!showCityList && !!selectedCity}
    onClick={() => { setShowCityList(true); setCitySearch(''); }}
  />
  {showCityList && (
    <div className="city-dropdown">
      {cities
        .filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
        .map((city) => (
          <div key={city.id} className="city-dropdown-item"
            onMouseDown={() => {
              setSelectedCity(city);
              setDeliveryPrice(parseFloat(city.price));
              setCitySearch(city.name);
              setShowCityList(false);
              if (errors.city) setErrors({ ...errors, city: '' });
            }}>
            <span>{city.name}</span>
            <span className="city-dropdown-price">{parseFloat(city.price).toFixed(2)} DH</span>
          </div>
        ))}
      {cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
        <div className="city-dropdown-empty">Aucune ville trouvée</div>
      )}
    </div>
  )}
  {errors.city && <span className="checkout-error">{errors.city}</span>}
</div>
                <div className="checkout-field">
                  <label>Téléphone *</label>
                  <input type="tel" name="phone" placeholder="06 XX XX XX XX" value={customer.phone}
                    onChange={handleChange} className={errors.phone ? 'error' : ''} />
                  {errors.phone && <span className="checkout-error">{errors.phone}</span>}
                </div>

                <div className="checkout-field">
                  <label>Adresse de livraison *</label>
                  <textarea name="address" placeholder="Rue, quartier, ville..." value={customer.address}
                    onChange={handleChange} className={errors.address ? 'error' : ''} rows={3} />
                  {errors.address && <span className="checkout-error">{errors.address}</span>}
                </div>

                <div className="checkout-field">
                  <label>Note (optionnel)</label>
                  <textarea name="note" placeholder="Instructions spéciales, étage, code..." value={customer.note}
                    onChange={handleChange} rows={2} />
                </div>

                <button className="cart-btn-whatsapp" onClick={() => setShowConfirm(true)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Commander via WhatsApp
                </button>

                <div className="cart-checkout-info">
                  <div className="cart-checkout-info-item">✅ Paiement à la livraison</div>
                  <div className="cart-checkout-info-item">🚚 Livraison rapide</div>
                  <div className="cart-checkout-info-item">↩️ Retours sous 30 jours</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Produits suggérés */}
        {suggested.length > 0 && (
          <div className="cart-suggested">
            <h3 className="cart-suggested-title">Vous aimerez aussi</h3>
            <div className="cart-suggested-grid">
              {suggested.map((product) => (
                <div key={product.id} className="cart-suggested-card"
                  onClick={() => navigate(`/produit/${product.id}`)}>
                  <div className="cart-suggested-img">
                    {product.images?.[0] ? (
                      <img src={`https://mblifestyle-backend-production.up.railway.app/storage/${product.images[0]}`} alt={product.name} />
                    ) : <div className="cart-suggested-placeholder">👕</div>}
                  </div>
                  <div className="cart-suggested-info">
                    {product.brand && <span className="cart-suggested-brand">{product.brand}</span>}
                    <p className="cart-suggested-name">{product.name}</p>
                    <p className="cart-suggested-price">
                      {product.discount > 0
                        ? (product.price - product.price * product.discount / 100).toFixed(2)
                        : parseFloat(product.price).toFixed(2)} DH
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popup confirmation */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-title">✅ Confirmer la commande</h3>
            <div className="confirm-client">
              <p><strong>👤 {customer.firstName} {customer.lastName}</strong></p>
              <p>📞 {customer.phone}</p>
              <p>📍 {customer.address}</p>
              {customer.note && <p>📝 {customer.note}</p>}
            </div>
            <div className="confirm-items">
              {cartItems.map((item, i) => {
                const price = getItemPrice(item);
                return (
                  <div key={i} className="confirm-item">
                    <div className="confirm-item-info">
                      <p className="confirm-item-name">{item.product.name}</p>
                      <p className="confirm-item-variant">
                        {item.color && `${colorNames[item.color] || item.color}`}
                        {item.size && ` • Taille ${item.size}`}
                        {` • Qté ${item.quantity}`}
                      </p>
                    </div>
                    <span className="confirm-item-price">{(parseFloat(price) * item.quantity).toFixed(2)} DH</span>
                  </div>
                );
              })}
            </div>
            <div className="confirm-total">
              <span>Total</span>
              <span>{discountedTotal.toFixed(2)} DH</span>
            </div>
            <div className="confirm-btns">
              <button className="confirm-btn-cancel" onClick={() => setShowConfirm(false)}>Modifier</button>
              <button className="confirm-btn-send" onClick={() => { setShowConfirm(false); handleOrderOnWhatsApp(); }}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Envoyer sur WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default Cart;