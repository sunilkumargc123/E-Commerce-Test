"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { useCart } from "./cart-provider";

// Renders the interactive cart page using hydrated client-side cart state.
export function CartPageClient() {
  const { state, hydrated, itemCount, total, removeProduct } = useCart();

  if (!hydrated) {
    return (
      <div className="cart-list" aria-label="Loading cart">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    );
  }

  if (state.lines.length === 0) {
    return (
      <section className="state-panel">
        <h2>Your cart is empty</h2>
        <p>Products you add from the catalog will stay here after a reload.</p>
        <Link className="button" href="/">
          Start shopping
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="cart-list" aria-label="Cart lines">
        {state.lines.map((line) => (
          <article className="cart-line" key={line.productId}>
            <Link className="cart-thumb" href={`/products/${line.productId}`}>
              <Image
                src={line.thumbnail}
                alt={`${line.title} product image`}
                fill
                sizes="92px"
              />
            </Link>
            <div>
              <h2>
                <Link href={`/products/${line.productId}`}>{line.title}</Link>
              </h2>
              <p>
                {formatMoney(line.price)} x {line.quantity} ={" "}
                <strong>{formatMoney(line.price * line.quantity)}</strong>
              </p>
            </div>
            <div className="cart-actions">
              <strong>{formatMoney(line.price * line.quantity)}</strong>
              <button
                className="button danger"
                type="button"
                onClick={() => removeProduct(line.productId)}
                aria-label={`Remove ${line.title} from cart`}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </section>
      <section className="cart-summary" aria-label="Cart summary">
        <span>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
        <strong>Total {formatMoney(total)}</strong>
      </section>
    </>
  );
}
