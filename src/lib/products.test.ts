import { afterEach, describe, expect, it, vi } from "vitest";
import { getProduct, getProducts, parseProductId, type Product } from "./products";

const mascara: Product = {
  id: 1,
  title: "Essence Mascara Lash Princess",
  description: "A popular mascara",
  price: 9.99,
  discountPercentage: 10.48,
  rating: 2.56,
  thumbnail: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
  images: ["https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"]
};

// Stubs fetch with a response shape similar to the browser Fetch API.
function mockFetchResponse(payload: unknown, init: { ok?: boolean; status?: number } = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: init.ok ?? true,
      status: init.status ?? 200,
      json: vi.fn().mockResolvedValue(payload)
    })
  );
}

describe("product API helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the catalog and returns products from a valid response", async () => {
    mockFetchResponse({
      products: [mascara],
      total: 1,
      skip: 0,
      limit: 30
    });

    await expect(getProducts()).resolves.toEqual([mascara]);
    expect(fetch).toHaveBeenCalledWith("https://dummyjson.com/products", {
      next: { revalidate: 300 }
    });
  });

  it("returns an empty catalog when the API returns no products", async () => {
    mockFetchResponse({
      products: [],
      total: 0,
      skip: 0,
      limit: 30
    });

    await expect(getProducts()).resolves.toEqual([]);
  });

  it("throws a ProductApiError for non-OK catalog responses", async () => {
    mockFetchResponse({ message: "Server error" }, { ok: false, status: 500 });

    await expect(getProducts()).rejects.toMatchObject({
      name: "ProductApiError",
      message: "Unable to load products.",
      status: 500
    });
  });

  it("throws a ProductApiError for malformed catalog responses", async () => {
    mockFetchResponse({
      products: [{ ...mascara, images: ["valid", 42] }],
      total: 1,
      skip: 0,
      limit: 30
    });

    await expect(getProducts()).rejects.toThrow("The products API returned an unexpected shape.");
  });

  it("fetches one product by ID", async () => {
    mockFetchResponse(mascara);

    await expect(getProduct(1)).resolves.toEqual(mascara);
    expect(fetch).toHaveBeenCalledWith("https://dummyjson.com/products/1", {
      next: { revalidate: 300 }
    });
  });

  it("returns null for missing product detail responses", async () => {
    mockFetchResponse({ message: "Product not found" }, { ok: false, status: 404 });

    await expect(getProduct(9999)).resolves.toBeNull();
  });

  it("throws a ProductApiError for non-OK product detail responses", async () => {
    mockFetchResponse({ message: "Gateway timeout" }, { ok: false, status: 504 });

    await expect(getProduct(1)).rejects.toMatchObject({
      name: "ProductApiError",
      message: "Unable to load this product.",
      status: 504
    });
  });

  it("throws a ProductApiError for malformed product detail responses", async () => {
    mockFetchResponse({ ...mascara, price: "9.99" });

    await expect(getProduct(1)).rejects.toThrow("The product API returned an unexpected shape.");
  });
});

describe("parseProductId", () => {
  it.each([
    ["1", 1],
    ["42", 42],
    ["001", 1]
  ])("parses %s", (value, expected) => {
    expect(parseProductId(value)).toBe(expected);
  });

  it.each(["", "0", "-1", "1.2", "abc", "12abc", `${Number.MAX_SAFE_INTEGER + 1}`])(
    "rejects %s",
    (value) => {
      expect(parseProductId(value)).toBeNull();
    }
  );
});
