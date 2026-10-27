import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatMoney } from "@/lib/money";
import { getProduct, parseProductId } from "@/lib/products";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Fetches and renders one product detail route from the dynamic product ID.
export default async function ProductPage({ params }: ProductPageProps) {
  const { id: rawId } = await params;
  const id = parseProductId(rawId);

  if (!id) {
    notFound();
  }

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const mainImage = product.images[0] ?? product.thumbnail;

  return (
    <div className="page">
      <article className="detail-layout">
        <div className="detail-image">
          <Image
            src={mainImage}
            alt={`${product.title} product image`}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 58vw"
          />
        </div>
        <div className="detail-panel">
          <h1>{product.title}</h1>
          <p className="description">{product.description}</p>
          <dl className="detail-facts">
            <div className="fact">
              <span>Price</span>
              <strong>{formatMoney(product.price)}</strong>
            </div>
            <div className="fact">
              <span>Discount</span>
              <strong>{product.discountPercentage.toFixed(2)}%</strong>
            </div>
            <div className="fact">
              <span>Rating</span>
              <strong>{product.rating.toFixed(1)} / 5</strong>
            </div>
          </dl>
          <AddToCartButton product={product} />
        </div>
      </article>
    </div>
  );
}
