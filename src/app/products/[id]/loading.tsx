// Shows the product detail loading state while its API request is pending.
export default function ProductLoading() {
  return (
    <div className="page" aria-label="Loading product">
      <div className="detail-layout">
        <div className="skeleton-card detail-image" />
        <section className="state-panel">
          <h1>Loading product</h1>
          <p>Fetching the product details.</p>
        </section>
      </div>
    </div>
  );
}
