// Shows the catalog-level loading state while product data is being fetched.
export default function Loading() {
  return (
    <div className="page" aria-label="Loading catalog">
      <div className="page-heading">
        <h1>Shop Everyday Finds</h1>
        <p>Loading the latest products.</p>
      </div>
      <div className="skeleton-grid">
        {Array.from({ length: 8 }, (_, index) => (
          <div className="skeleton-card" key={index} />
        ))}
      </div>
    </div>
  );
}
