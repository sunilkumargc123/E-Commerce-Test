import { CartPageClient } from "@/components/cart-page-client";

// Renders the cart route shell and delegates interactive cart state to the client.
export default function CartPage() {
  return (
    <div className="page">
      <section className="page-heading" aria-labelledby="cart-title">
        <h1 id="cart-title">Your Cart</h1>
        <p>Review products, derived quantities, and saved cart totals.</p>
      </section>
      <CartPageClient />
    </div>
  );
}
