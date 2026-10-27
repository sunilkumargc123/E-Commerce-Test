"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

// Renders the header cart link with a badge derived from shared cart state.
export function CartLink() {
  const { itemCount, hydrated } = useCart();
  const countLabel = hydrated ? itemCount : 0;

  return (
    <Link className="nav-link cart-link" href="/cart" aria-label={`Cart with ${countLabel} items`}>
      <span aria-hidden="true">Cart</span>
      <span className="cart-badge" aria-hidden="true">
        {countLabel}
      </span>
    </Link>
  );
}
