import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/products";

// Renders one catalog card with required product fields and detail navigation.
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link className="product-card" href={`/products/${product.id}`}>
      <div className="product-media">
        <Image
          src={product.thumbnail}
          alt={`${product.title} product image`}
          fill
          sizes="(max-width: 760px) 100vw, (max-width: 1200px) 33vw, 260px"
        />
      </div>
      <div className="product-copy">
        <h2 className="product-title">{product.title}</h2>
        <div className="product-meta">
          <span className="price">{formatMoney(product.price)}</span>
          <span className="rating" aria-label={`Rated ${product.rating} out of 5`}>
            {product.rating.toFixed(1)} / 5
          </span>
        </div>
      </div>
    </Link>
  );
}
