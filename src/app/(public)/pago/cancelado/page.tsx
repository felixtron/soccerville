import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { XCircle } from "lucide-react";

export default function PagoCancelado() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="border-0 shadow-lg max-w-md w-full">
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="font-display text-3xl uppercase tracking-tight mb-2">
            Pago Cancelado
          </h1>
          <p className="text-muted-foreground mb-6">
            El pago fue cancelado. No se realizo ningun cargo. Puedes intentar de nuevo cuando quieras.
          </p>
          <LinkButton href="/" className="rounded-full">
            Volver al inicio
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
}
