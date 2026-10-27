import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-provider";
import { CartLink } from "@/components/cart-link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DummyJSON Market",
  description: "A small e-commerce storefront powered by the DummyJSON products API."
};

// Defines the shared application shell and places the cart provider above all routes.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <div className="site-shell">
            <header className="site-header">
              <div className="header-inner">
                <Link className="brand" href="/">
                  DummyJSON Market
                </Link>
                <nav className="nav-links" aria-label="Primary navigation">
                  <Link className="nav-link" href="/">
                    Home
                  </Link>
                  <CartLink />
                </nav>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
