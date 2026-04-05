"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

export function SchoolPayButton({
  programId,
  venueId,
  amount,
  programName,
  venueName,
}: {
  programId: string;
  venueId: string;
  amount: number;
  programName: string;
  venueName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        disabled={pending}
        className="w-full bg-emerald-600 hover:bg-emerald-500"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "SCHOOL_FEE",
                  venueId,
                  amount,
                  description: `Mensualidad ${programName} — ${venueName}`,
                  metadata: { programId },
                }),
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
        Pagar Mensualidad · ${amount.toLocaleString()}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
