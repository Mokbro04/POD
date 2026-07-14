import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/ProductGrid";
import type { Product } from "@/lib/types";

export const revalidate = 60; // ISR: refresh catalog every minute

async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load products:", error);
    return [];
  }
  return data as Product[];
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="container py-6">
      <section className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Your design. Your t-shirt.
        </h1>
        <p className="mt-1 max-w-prose text-muted-foreground">
          Upload any artwork, preview it live on a mockup, and get it
          delivered to any of Algeria's 58 wilayas — cash on delivery.
        </p>
        <a
          href="/customizer"
          className="mt-4 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Start designing
        </a>
      </section>

      <ProductGrid products={products} />
    </div>
  );
}
