import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { CheckCircle } from "lucide-react";

export default function PagoExitoso() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="border-0 shadow-lg max-w-md w-full">
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="font-display text-3xl uppercase tracking-tight mb-2">
            Pago Exitoso
          </h1>
          <p className="text-muted-foreground mb-6">
            Tu pago ha sido procesado correctamente. Recibiras un correo de confirmacion.
          </p>
          <LinkButton href="/" className="rounded-full">
            Volver al inicio
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
}
