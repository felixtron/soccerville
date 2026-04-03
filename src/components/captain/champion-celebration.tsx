"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import Image from "next/image";
import { TeamLogo } from "@/components/shared/team-logo";

export function ChampionCelebration({
  teamName,
  logoUrl,
  tournamentName,
  onClose,
}: {
  teamName: string;
  logoUrl: string | null;
  tournamentName: string;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;

    const tl = gsap.timeline();

    // Overlay fade in
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });

    // Trophy + logo entrance
    tl.fromTo(
      trophyRef.current,
      { scale: 0, rotation: -30 },
      { scale: 1, rotation: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" },
      0.2
    );

    // Text entrance
    tl.fromTo(
      textRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      0.5
    );

    // Confetti bursts
    const fireConfetti = () => {
      // Gold + team colors
      const colors = ["#FFD700", "#FFA500", "#FF6347", "#FFFFFF", "#4CAF50"];

      // Center burst
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5, x: 0.5 },
        colors,
        scalar: 1.2,
      });

      // Side cannons
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors,
        });
      }, 300);

      // Second wave
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.4, x: 0.5 },
          colors,
          scalar: 1.5,
          gravity: 0.8,
        });
      }, 800);

      // Stars
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 360,
          origin: { y: 0.3, x: 0.5 },
          shapes: ["star"],
          colors: ["#FFD700", "#FFC107"],
          scalar: 2,
          gravity: 0.4,
        });
      }, 1200);
    };

    // Fire confetti after content appears
    const timer = setTimeout(fireConfetti, 600);

    // Pulsing glow on trophy
    gsap.to(trophyRef.current, {
      boxShadow: "0 0 60px 20px rgba(255,215,0,0.3)",
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: "sine.inOut",
      delay: 1,
    });

    return () => {
      clearTimeout(timer);
      tl.kill();
    };
  }, []);

  function handleClose() {
    if (!overlayRef.current) {
      onClose();
      return;
    }

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setVisible(false);
        onClose();
      },
    });
  }

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="flex flex-col items-center gap-6 px-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Trophy + Logo */}
        <div ref={trophyRef} className="relative rounded-full">
          <div className="relative">
            {/* Gold ring */}
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 p-1.5 shadow-2xl">
              <div className="h-full w-full rounded-full bg-black/40 flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={teamName}
                    width={160}
                    height={160}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl md:text-5xl font-bold text-white/80">
                    {teamName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                )}
              </div>
            </div>
            {/* Trophy emoji */}
            <div className="absolute -top-3 -right-3 text-4xl md:text-5xl animate-bounce">
              🏆
            </div>
          </div>
        </div>

        {/* Text */}
        <div ref={textRef}>
          <p className="text-amber-400 text-sm uppercase tracking-[0.3em] font-medium mb-2">
            Felicidades
          </p>
          <h2 className="font-display text-4xl md:text-6xl text-white uppercase tracking-tight leading-none mb-2">
            Campeon!
          </h2>
          <p className="text-white/60 text-lg font-medium">{teamName}</p>
          <p className="text-white/40 text-sm mt-1">{tournamentName}</p>

          {/* Soccerville branding */}
          <div className="mt-6 flex items-center justify-center gap-2 opacity-40">
            <Image
              src="/images/soccerville-w.svg"
              alt="Soccerville"
              width={24}
              height={24}
              className="h-5 w-5 object-contain"
            />
            <span className="text-white text-xs font-display uppercase tracking-wider">
              Soccerville
            </span>
          </div>
        </div>

        {/* Dismiss hint */}
        <p className="text-white/20 text-xs mt-4">Toca para continuar</p>
      </div>
    </div>
  );
}
