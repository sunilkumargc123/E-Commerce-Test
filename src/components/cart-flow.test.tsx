import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddToCartButton } from "./add-to-cart-button";
import { CartLink } from "./cart-link";
import { CartPageClient } from "./cart-page-client";
import { CartProvider } from "./cart-provider";
import type { Product } from "@/lib/products";

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...props
  }: {
    alt: string;
    src: string;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />
  )
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

const mascara: Product = {
  id: 1,
  title: "Essence Mascara Lash Princess",
  description: "A popular mascara",
  price: 9.99,
  discountPercentage: 7.17,
  rating: 4.94,
  thumbnail: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
  images: ["https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"]
};

const lipstick: Product = {
  ...mascara,
  id: 2,
  title: "Red Lipstick",
  price: 12.99
};

// Renders the shared cart components together so provider synchronization is tested.
function renderCartHarness() {
  return render(
    <CartProvider>
      <CartLink />
      <AddToCartButton product={mascara} />
      <AddToCartButton product={lipstick} />
      <CartPageClient />
    </CartProvider>
  );
}

describe("cart flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds repeated and different products, updates header count, and removes lines", async () => {
    const user = userEvent.setup();
    renderCartHarness();

    await screen.findByText("Your cart is empty");

    await user.click(screen.getAllByRole("button", { name: "Add to cart" })[0]);
    await user.click(screen.getAllByRole("button", { name: "Add to cart" })[0]);
    await user.click(screen.getAllByRole("button", { name: "Add to cart" })[1]);

    expect(screen.getByRole("link", { name: "Cart with 3 items" })).toBeInTheDocument();
    expect(screen.getByText("Essence Mascara Lash Princess")).toBeInTheDocument();
    expect(screen.getByText("$9.99 x 2 =")).toBeInTheDocument();
    expect(screen.getByText("3 items")).toBeInTheDocument();
    expect(screen.getByText("Total $32.97")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove Essence Mascara Lash Princess from cart" }));

    expect(screen.queryByText("Essence Mascara Lash Princess")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cart with 1 items" })).toBeInTheDocument();
    expect(screen.getByText("Total $12.99")).toBeInTheDocument();
  });

  it("hydrates from localStorage and persists removals", async () => {
    window.localStorage.setItem(
      "dummyjson-market-cart",
      JSON.stringify({
        lines: [
          {
            productId: 1,
            title: "Essence Mascara Lash Princess",
            price: 9.99,
            thumbnail: mascara.thumbnail,
            quantity: 2
          }
        ]
      })
    );

    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartLink />
        <CartPageClient />
      </CartProvider>
    );

    expect(await screen.findByText("Essence Mascara Lash Princess")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cart with 2 items" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove Essence Mascara Lash Princess from cart" }));

    await waitFor(() => {
      expect(window.localStorage.getItem("dummyjson-market-cart")).toBe(JSON.stringify({ lines: [] }));
    });
  });
});
