// Shows the cart route loading state before client cart hydration completes.
export default function CartLoading() {
  return (
    <div className="page" aria-label="Loading cart">
      <div className="page-heading">
        <h1>Your Cart</h1>
        <p>Loading saved cart lines.</p>
      </div>
      <div className="cart-list">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
}
