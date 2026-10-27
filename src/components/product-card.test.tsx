import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductCard } from "./product-card";
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
  discountPercentage: 10.48,
  rating: 2.56,
  thumbnail: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
  images: ["https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"]
};

describe("ProductCard", () => {
  it("renders required catalog fields and links to product detail", () => {
    render(<ProductCard product={mascara} />);

    const card = screen.getByRole("link", { name: /Essence Mascara Lash Princess/ });

    expect(card).toHaveAttribute("href", "/products/1");
    expect(screen.getByRole("heading", { name: "Essence Mascara Lash Princess" })).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
    expect(screen.getByLabelText("Rated 2.56 out of 5")).toHaveTextContent("2.6 / 5");
    expect(screen.getByAltText("Essence Mascara Lash Princess product image")).toHaveAttribute(
      "src",
      mascara.thumbnail
    );
  });
});
