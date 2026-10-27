"use client";

// Shows a retryable catalog error state for server or API failures.
export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page">
      <section className="state-panel" role="alert">
        <h1>Products could not load</h1>
        <p>{error.message || "Something went wrong while loading the catalog."}</p>
        <button className="button" type="button" onClick={reset}>
          Try again
        </button>
      </section>
    </div>
  );
}
