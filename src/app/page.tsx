import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";

// Fetches and renders the catalog route.
export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="page">
      <section className="page-heading" aria-labelledby="catalog-title">
        <h1 id="catalog-title">Shop Everyday Finds</h1>
        <p>
          Browse the live DummyJSON catalog with product images, ratings, and current API
          prices.
        </p>
      </section>

      {products.length > 0 ? (
        <section className="product-grid" aria-label="Product catalog">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="state-panel" aria-live="polite">
          <h2>No products found</h2>
          <p>The catalog loaded successfully, but the API did not return any products.</p>
        </section>
      )}
    </div>
  );
}
