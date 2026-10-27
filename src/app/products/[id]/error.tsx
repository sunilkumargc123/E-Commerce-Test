"use client";

// Shows a retryable product detail error state for server or API failures.
export default function ProductError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page">
      <section className="state-panel" role="alert">
        <h1>Product could not load</h1>
        <p>{error.message || "Something went wrong while loading this product."}</p>
        <button className="button" type="button" onClick={reset}>
          Try again
        </button>
      </section>
    </div>
  );
}
