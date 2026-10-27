import { describe, expect, it } from "vitest";
import {
  addProductToCart,
  EMPTY_CART,
  getCartItemCount,
  getCartTotal,
  removeProductFromCart,
  sanitizeCart
} from "./cart";
import type { Product } from "./products";

const phone: Product = {
  id: 1,
  title: "Essence Mascara Lash Princess",
  description: "A popular mascara",
  price: 9.99,
  discountPercentage: 7.17,
  rating: 4.94,
  thumbnail: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
  images: ["https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"]
};

const perfume: Product = {
  ...phone,
  id: 2,
  title: "Calvin Klein CK One",
  price: 49.99
};

describe("cart helpers", () => {
  it("adds products, increments an existing product, and derives totals", () => {
    const withPhone = addProductToCart(EMPTY_CART, phone);
    const withTwoPhones = addProductToCart(withPhone, phone);
    const withPerfume = addProductToCart(withTwoPhones, perfume);

    expect(withPerfume.lines).toHaveLength(2);
    expect(withPerfume.lines[0]).toMatchObject({ productId: 1, quantity: 2 });
    expect(getCartItemCount(withPerfume)).toBe(3);
    expect(getCartTotal(withPerfume)).toBeCloseTo(69.97);
  });

  it("removes a whole product line", () => {
    const state = addProductToCart(addProductToCart(EMPTY_CART, phone), perfume);

    expect(removeProductFromCart(state, phone.id).lines).toEqual([
      expect.objectContaining({ productId: perfume.id })
    ]);
  });

  it("sanitizes persisted cart data", () => {
    expect(
      sanitizeCart({
        lines: [
          {
            productId: 1,
            title: "Valid",
            price: 12,
            thumbnail: "https://example.com/product.webp",
            quantity: 2
          },
          {
            productId: "bad",
            title: "Invalid",
            price: 10,
            thumbnail: "x",
            quantity: 1
          }
        ]
      })
    ).toEqual({
      lines: [
        {
          productId: 1,
          title: "Valid",
          price: 12,
          thumbnail: "https://example.com/product.webp",
          quantity: 2
        }
      ]
    });
  });

  it("falls back to an empty cart for invalid persisted cart roots", () => {
    expect(sanitizeCart(null)).toEqual(EMPTY_CART);
    expect(sanitizeCart({})).toEqual(EMPTY_CART);
    expect(sanitizeCart({ lines: "not-lines" })).toEqual(EMPTY_CART);
  });

  it("drops persisted lines with invalid quantities", () => {
    expect(
      sanitizeCart({
        lines: [
          {
            productId: 1,
            title: "Zero quantity",
            price: 12,
            thumbnail: "https://example.com/product.webp",
            quantity: 0
          },
          {
            productId: 2,
            title: "Fraction quantity",
            price: 12,
            thumbnail: "https://example.com/product.webp",
            quantity: 1.5
          }
        ]
      })
    ).toEqual({ lines: [] });
  });
});
