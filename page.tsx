"use client";

import { useState } from "react";
import { Customizer } from "@/components/Customizer";
import { Button } from "@/components/ui/button";

const MOCKUP_SRC = "/mockups/tshirt-white-front.png";

export default function CustomizerPage() {
  const [designUrl, setDesignUrl] = useState<string | null>(null);

  return (
    <div className="container flex flex-col items-center py-6">
      <h1 className="mb-1 text-xl font-bold">Design your t-shirt</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Upload your artwork and position it exactly how you want it printed.
      </p>

      <Customizer mockupSrc={MOCKUP_SRC} onDesignChange={setDesignUrl} />

      <Button
        className="mt-6 w-full max-w-[420px]"
        disabled={!designUrl}
        onClick={() => {
          sessionStorage.setItem("pod:custom-design", designUrl ?? "");
          window.location.href = "/checkout";
        }}
      >
        Add to cart
      </Button>
    </div>
  );
}
