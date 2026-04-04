"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, UserPlus, Loader2 } from "lucide-react";

export function InscriptionButton({
  tournamentId,
  teamId,
  venueId,
  amount,
  tournamentName,
  venueName,
  stripeEnabled = true,
  enroll = false,
}: {
  tournamentId: string;
  teamId: string;
  venueId: string;
  amount: number;
  tournamentName: string;
  venueName: string;
  stripeEnabled?: boolean;
  enroll?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleInscribe() {
    setError(null);

    // Step 1: Enroll team if not already enrolled
    if (enroll) {
      const enrollRes = await fetch("/api/captain/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, teamId }),
      });
      if (!enrollRes.ok) {
        const data = await enrollRes.json();
        setError(data.error || "Error al inscribirse");
        return;
      }
    }

    // Step 2: Create Stripe checkout for inscription
    if (stripeEnabled) {
      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "INSCRIPTION",
          venueId,
          amount,
          description: `Inscripcion ${tournamentName} — ${venueName}`,
          metadata: { tournamentId, teamId },
        }),
      });
      const data = await checkoutRes.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Error al crear pago");
      }
    } else {
      // No Stripe — just enroll and redirect
      window.location.href = "/mi-equipo";
    }
  }

  return (
    <div>
      <Button
        disabled={pending}
        onClick={() => startTransition(handleInscribe)}
        className={enroll
          ? "w-full bg-emerald-600 hover:bg-emerald-500"
          : "bg-emerald-600 hover:bg-emerald-500"
        }
        size={enroll ? "default" : "sm"}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : stripeEnabled ? (
          <CreditCard className="h-4 w-4 mr-2" />
        ) : (
          <UserPlus className="h-4 w-4 mr-2" />
        )}
        {enroll
          ? stripeEnabled
            ? `Inscribirme · $${amount.toLocaleString()}`
            : "Inscribirme"
          : `Pagar $${amount.toLocaleString()}`}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
