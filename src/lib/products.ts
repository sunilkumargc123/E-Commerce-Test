export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  thumbnail: string;
  images: string[];
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export class ProductApiError extends Error {
  // Creates an API-specific error that can carry the HTTP status code.
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ProductApiError";
  }
}

const API_BASE_URL = "https://dummyjson.com";

// Keep response validation at the API boundary so UI code can rely on Product.
// Checks whether an unknown value is a non-null object.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Checks whether an unknown API payload has the product fields the UI needs.
function isProduct(value: unknown): value is Product {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.price === "number" &&
    typeof value.discountPercentage === "number" &&
    typeof value.rating === "number" &&
    typeof value.thumbnail === "string" &&
    Array.isArray(value.images) &&
    value.images.every((image) => typeof image === "string")
  );
}

// Checks whether an unknown catalog payload matches DummyJSON's list response.
function isProductsResponse(value: unknown): value is ProductsResponse {
  if (!isRecord(value) || !Array.isArray(value.products)) {
    return false;
  }

  return (
    value.products.every(isProduct) &&
    typeof value.total === "number" &&
    typeof value.skip === "number" &&
    typeof value.limit === "number"
  );
}

// Fetches the product catalog from DummyJSON and returns validated products.
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    // The catalog can be cached briefly; cart behavior remains fully client-side.
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new ProductApiError("Unable to load products.", response.status);
  }

  const payload: unknown = await response.json();

  if (!isProductsResponse(payload)) {
    throw new ProductApiError("The products API returned an unexpected shape.");
  }

  return payload.products;
}

// Fetches one product by ID and returns null when DummyJSON reports it missing.
export async function getProduct(id: number): Promise<Product | null> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    next: { revalidate: 300 }
  });

  // Missing products are a valid route outcome and map to notFound() upstream.
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new ProductApiError("Unable to load this product.", response.status);
  }

  const payload: unknown = await response.json();

  if (!isProduct(payload)) {
    throw new ProductApiError("The product API returned an unexpected shape.");
  }

  return payload;
}

// Parses a dynamic route segment into a positive safe product ID.
export function parseProductId(value: string): number | null {
  // Dynamic route params arrive as strings; reject decimals, signs, and unsafe IDs.
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
