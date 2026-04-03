"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Banknote } from "lucide-react";
import { markPaymentCash } from "@/app/admin/actions";

export function MarkCashButton({ paymentId }: { paymentId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(() => markPaymentCash(paymentId));
      }}
    >
      <Banknote className="h-3 w-3 mr-1" />
      {pending ? "..." : "Efectivo"}
    </Button>
  );
}
