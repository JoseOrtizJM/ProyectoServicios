import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { addCartItem, emptyCart as emptyCartRequest, getCart, removeCartItem, updateCartItem } from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    const data = await addCartItem(productId, quantity);
    setCart(data);
    return data;
  }, []);

  const updateItem = useCallback(async (productId, quantity) => {
    const data = await updateCartItem(productId, quantity);
    setCart(data);
    return data;
  }, []);

  const removeItem = useCallback(
    async (productId) => {
      await removeCartItem(productId);
      await refreshCart();
    },
    [refreshCart],
  );

  const emptyCart = useCallback(async () => {
    await emptyCartRequest();
    await refreshCart();
  }, [refreshCart]);

  const value = {
    cart,
    loading,
    itemCount: cart?.total_items || 0,
    refreshCart,
    addItem,
    updateItem,
    removeItem,
    emptyCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>.");
  }
  return ctx;
}
