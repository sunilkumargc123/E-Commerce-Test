import type { Product } from "./products";

export type CartLine = {
  productId: number;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
};

export type CartState = {
  lines: CartLine[];
};

export const EMPTY_CART: CartState = { lines: [] };

// Adds a product snapshot to the cart or increments its existing quantity.
export function addProductToCart(state: CartState, product: Product): CartState {
  const existingLine = state.lines.find((line) => line.productId === product.id);

  // Repeated adds increase quantity instead of creating duplicate cart rows.
  if (existingLine) {
    return {
      lines: state.lines.map((line) =>
        line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line
      )
    };
  }

  return {
    lines: [
      ...state.lines,
      {
        productId: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: 1
      }
    ]
  };
}

// Removes the entire cart line for a product ID.
export function removeProductFromCart(state: CartState, productId: number): CartState {
  return {
    lines: state.lines.filter((line) => line.productId !== productId)
  };
}

// Calculates the total number of items across all cart lines.
export function getCartItemCount(state: CartState): number {
  return state.lines.reduce((total, line) => total + line.quantity, 0);
}

// Calculates the total cart price from each line's price and quantity.
export function getCartTotal(state: CartState): number {
  return state.lines.reduce((total, line) => total + line.price * line.quantity, 0);
}

// Converts unknown persisted data into a safe cart state.
export function sanitizeCart(value: unknown): CartState {
  // localStorage is user-editable, so only trusted cart lines are hydrated.
  if (typeof value !== "object" || value === null || !("lines" in value)) {
    return EMPTY_CART;
  }

  const lines = (value as { lines: unknown }).lines;

  if (!Array.isArray(lines)) {
    return EMPTY_CART;
  }

  return {
    lines: lines.filter(isCartLine)
  };
}

// Checks whether an unknown value is a valid persisted cart line.
function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const line = value as Record<string, unknown>;

  return (
    typeof line.productId === "number" &&
    Number.isSafeInteger(line.productId) &&
    typeof line.title === "string" &&
    typeof line.price === "number" &&
    typeof line.thumbnail === "string" &&
    typeof line.quantity === "number" &&
    Number.isSafeInteger(line.quantity) &&
    line.quantity > 0
  );
}
