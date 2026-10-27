"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { useCart } from "./cart-provider";

// Renders the product detail action that adds the current product to the cart.
export function AddToCartButton({ product }: { product: Product }) {
  const { addProduct } = useCart();
  const [status, setStatus] = useState("Ready to add");

  return (
    <div>
      <button
        className="button"
        type="button"
        onClick={() => {
          addProduct(product);
          setStatus(`${product.title} added to cart.`);
        }}
      >
        Add to cart
      </button>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
