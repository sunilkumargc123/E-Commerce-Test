import Link from "next/link";

// Shows the shared not-found state for missing or invalid products.
export default function NotFound() {
  return (
    <div className="page">
      <section className="state-panel">
        <h1>Product not found</h1>
        <p>This product does not exist in the DummyJSON catalog.</p>
        <Link className="button" href="/">
          Back to products
        </Link>
      </section>
    </div>
  );
}
