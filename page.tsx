"use client";

import { useEffect, useState } from "react";
import { CheckoutForm } from "@/components/CheckoutForm";
import type { OrderItem } from "@/lib/types";

export default function CheckoutPage() {
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    // In a full build this reads a persisted cart (Zustand/Supabase);
    // here we fall back to whatever design was just customized.
    const customDesign = sessionStorage.getItem("pod:custom-design");
    setItems([
      {
        product_id: "custom-tee",
        product_name: "Custom Design T-Shirt",
        quantity: 1,
        unit_price: 2500,
        size: "M",
        color: "White",
        custom_design_url: customDesign || null,
      },
    ]);
  }, []);

  return (
    <div className="container max-w-lg py-6">
      <h1 className="mb-6 text-xl font-bold">Checkout</h1>
      <CheckoutForm items={items} />
    </div>
  );
}
