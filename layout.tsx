import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DZ Print — Custom T-Shirts, Made in Algeria",
  description:
    "Design your own print-on-demand t-shirts and get them delivered anywhere in Algeria, 58 wilayas covered.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <div className="container flex h-14 items-center justify-between">
            <a href="/" className="text-lg font-bold tracking-tight">
              DZ<span className="text-primary">Print</span>
            </a>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <a href="/customizer" className="hover:text-primary">
                Customize
              </a>
              <a href="/checkout" className="hover:text-primary">
                Cart
              </a>
            </nav>
          </div>
        </header>
        <main className="pb-24">{children}</main>
      </body>
    </html>
  );
}
