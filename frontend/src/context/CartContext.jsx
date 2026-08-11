import { createContext, useContext, useState, useEffect } from "react";

const CART_KEY = "soundforge_cart";
const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  // Sync to localStorage whenever the cart changes.
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: Number(product.price),
          cover_image_url: product.cover_image_url || null,
          creator_name: product.creator_name || null,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const isInCart = (productId) => cart.some((item) => item.id === productId);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const value = { cart, addToCart, removeFromCart, clearCart, isInCart, cartTotal };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
