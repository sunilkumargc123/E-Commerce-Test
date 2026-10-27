# E-commerce Storefront using DummyJSON

A small Next.js storefront backed by the live DummyJSON products API. It includes a product catalog, product detail pages, and a persistent client-side cart.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

By default Next.js serves the app at `http://localhost:3000`. If that port is already in use, run:

```bash
npm run dev -- -p 3003
```

Run verification:

```bash
npm run type-check
npm run lint
npm test
npm run build
npm run smoke:browser
```

`npm run smoke:browser` expects the app at `http://localhost:3003` by default. Override it when needed:

```bash
SMOKE_BASE_URL=http://localhost:3000 npm run smoke:browser
```

## Thought Process And Trade-offs

The app keeps product fetching on the server side with typed API helpers in `src/lib/products.ts`, while cart behavior stays in a small client provider so the header badge, product actions, and cart page share one state source.

Cart persistence stores only a minimal snapshot: product ID, title, price, thumbnail, and quantity. Totals and item counts are always derived from cart lines to avoid duplicated state drifting out of sync.

The UI is intentionally compact : responsive product cards, accessible links/buttons, visible focus states, loading/error/not-found states, and no checkout/auth/payment flow. I avoided extra dependencies except for the test and browser-smoke tooling.

DummyJSON responses are validated at the API boundary. The app distinguishes an empty catalog, missing products, malformed IDs, API failures, and unexpected response shapes.

## Known Limitations

- Product data depends on the live DummyJSON API, so local rendering requires network access.
- Cart data is browser-local via `localStorage`; it is not shared across devices or browsers.
- Removing an item removes the whole cart line. Quantity steppers were left out because the requested behavior only required repeated add and whole-line removal.
- There is no checkout, authentication, payment, search, filtering, or backend persistence.
- `npm run smoke:browser` requires Playwright's Chromium runtime to be installed.
