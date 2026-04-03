import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Soccerville - Futbol 7 en Metepec y Calimaya",
    template: "%s | Soccerville",
  },
  description:
    "La mejor experiencia de futbol 7 en Metepec y Calimaya. Torneos, renta de canchas, escuela de futbol y mas.",
  keywords: [
    "futbol 7",
    "canchas",
    "Metepec",
    "Calimaya",
    "torneos",
    "renta de canchas",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bebasNeue.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
