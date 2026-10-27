"use client";

import {
  addProductToCart,
  EMPTY_CART,
  getCartItemCount,
  getCartTotal,
  removeProductFromCart,
  sanitizeCart,
  type CartState
} from "@/lib/cart";
import type { Product } from "@/lib/products";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

type CartContextValue = {
  state: CartState;
  hydrated: boolean;
  itemCount: number;
  total: number;
  addProduct: (product: Product) => void;
  removeProduct: (productId: number) => void;
};

const CART_STORAGE_KEY = "dummyjson-market-cart";
const CartContext = createContext<CartContextValue | null>(null);

// Provides shared cart state, derived totals, and localStorage persistence.
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(EMPTY_CART);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Defer localStorage hydration until after the first client render.
    queueMicrotask(() => {
      const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);

      if (storedValue) {
        try {
          setState(sanitizeCart(JSON.parse(storedValue)));
        } catch {
          setState(EMPTY_CART);
        }
      }

      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    // Persist only the minimal serializable cart snapshot from lib/cart.
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const addProduct = useCallback((product: Product) => {
    setState((current) => addProductToCart(current, product));
  }, []);

  const removeProduct = useCallback((productId: number) => {
    setState((current) => removeProductFromCart(current, productId));
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      hydrated,
      // Counts and totals stay derived so they cannot drift from cart lines.
      itemCount: getCartItemCount(state),
      total: getCartTotal(state),
      addProduct,
      removeProduct
    }),
    [addProduct, hydrated, removeProduct, state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Reads the shared cart context and fails fast if it is used outside the provider.
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}
