"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

export function SubscriptionButton({
  spaceId,
  label,
  price,
}: {
  spaceId: string;
  label: string;
  price: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        size="sm"
        className="w-full bg-blue-600 hover:bg-blue-500 text-xs"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const res = await fetch("/api/stripe/subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ spaceId }),
              });
              const data = await res.json();
              if (data.url) {
                window.location.href = data.url;
              } else {
                setError(data.error || "Error al crear suscripcion");
              }
            } catch {
              setError("Error de conexion");
            }
          });
        }}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <CreditCard className="h-3.5 w-3.5 mr-1.5" />
        )}
        Suscripcion · ${price.toLocaleString()}/mes
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
