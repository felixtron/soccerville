"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

export function PayButton({
  type,
  venueId,
  amount,
  description,
  metadata,
  className,
  children,
}: {
  type: string;
  venueId: string;
  amount: number;
  description: string;
  metadata?: Record<string, string>;
  className?: string;
  children?: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        disabled={pending}
        className={className}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, venueId, amount, description, metadata }),
              });
              const data = await res.json();
              if (data.url) {
                window.location.href = data.url;
              } else {
                setError(data.error || "Error al crear pago");
              }
            } catch {
              setError("Error de conexion");
            }
          });
        }}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4 mr-2" />
        )}
        {children || `Pagar $${amount.toLocaleString()} MXN`}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
