import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('mblifestyle_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('mblifestyle_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Ajoute un article au panier (ou augmente la quantité si déjà présent avec la même taille)
  const addToCart = (product, size, quantity, color = null) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && item.size === size && item.color === color
      );
  
      if (existingIndex !== -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
  
      return [...prevItems, { product, size, quantity, color }];
    });
  };

  // Modifie la quantité d'un article
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prevItems) => {
      const updated = [...prevItems];
      updated[index].quantity = newQuantity;
      return updated;
    });
  };

  // Supprime un article du panier
  const removeFromCart = (index) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  // Vide complètement le panier
  const clearCart = () => {
    setCartItems([]);
  };

  // Nombre total d'articles (pour le badge)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (totalItems > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [totalItems]);

  // Prix total estimé
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}