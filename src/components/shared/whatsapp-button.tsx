"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ phone = "5215551234567" }: { phone?: string }) {
  const url = `https://wa.me/${phone}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
