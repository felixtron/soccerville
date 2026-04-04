"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function PagoExitoso() {
  return (
    <Suspense>
      <PagoExitosoContent />
    </Suspense>
  );
}

function PagoExitosoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirect");
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!redirectTo) return;

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.push(redirectTo);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [redirectTo, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="max-w-sm w-full text-center">
        {/* Soccerville logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/soccerville-w.svg"
            alt="Soccerville"
            width={60}
            height={60}
            className="h-14 w-14 object-contain"
          />
        </div>

        {/* Success icon */}
        <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </div>

        <h1 className="font-display text-4xl text-white uppercase tracking-tight mb-3">
          Pago Exitoso
        </h1>
        <p className="text-white/50 mb-8">
          Tu pago ha sido procesado correctamente.
        </p>

        {redirectTo ? (
          <div>
            <p className="text-white/30 text-sm mb-4">
              Regresando a tu panel en {countdown}...
            </p>
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-emerald-500 transition-colors"
            >
              Ir a Mi Equipo
            </button>
          </div>
        ) : (
          <a
            href="/"
            className="inline-block w-full h-11 leading-[44px] rounded-xl bg-white/10 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/20 transition-colors"
          >
            Volver al inicio
          </a>
        )}

        <p className="text-white/20 text-xs mt-8">
          Soccerville &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
