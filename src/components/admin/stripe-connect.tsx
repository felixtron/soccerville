"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";

export function StripeConnectButton({
  venueId,
  venueName,
}: {
  venueId: string;
  venueName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const res = await fetch("/api/stripe/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ venueId }),
              });
              const data = await res.json();
              if (data.url) {
                window.location.href = data.url;
              } else {
                setError(data.error || "Error al conectar");
              }
            } catch {
              setError("Error de conexion");
            }
          });
        }}
        className="w-full"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4 mr-2" />
        )}
        Conectar {venueName} a Stripe
      </Button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-muted-foreground mt-2">
        Se abrira el formulario de Stripe para configurar la cuenta bancaria y datos fiscales
      </p>
    </div>
  );
}

export function StripeDashboardLink({ accountId }: { accountId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          // Create a login link for the Express dashboard
          const res = await fetch(`/api/stripe/connect/dashboard`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountId }),
          });
          const data = await res.json();
          if (data.url) window.open(data.url, "_blank");
        });
      }}
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      Ver Dashboard de Stripe
    </Button>
  );
}
