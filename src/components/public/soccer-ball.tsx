"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export function SoccerBall() {
  const ballRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!ballRef.current) return;
          const scrollY = window.scrollY;
          const viewH = window.innerHeight;
          const progress = Math.min(scrollY / viewH, 1);

          // Move horizontally across the screen and rotate as it rolls
          const translateX = progress * (window.innerWidth + 200) - 150;
          const rotation = progress * 720;
          const translateY = Math.sin(progress * Math.PI) * -80;

          ballRef.current.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`;
          ballRef.current.style.opacity = `${1 - progress * 0.8}`;

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ballRef}
      className="absolute bottom-16 -left-[100px] z-10 pointer-events-none will-change-transform"
      style={{ transform: "translate(-150px, 0) rotate(0deg)" }}
    >
      <Image
        src="/images/soccer-ball-svgrepo-com.svg"
        alt=""
        width={80}
        height={80}
        className="h-16 w-16 md:h-20 md:w-20 opacity-40"
        aria-hidden="true"
      />
    </div>
  );
}

export function SoccerBallFloat() {
  const ballRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!ballRef.current) return;
          const rect = ballRef.current.parentElement?.getBoundingClientRect();
          if (!rect) return;

          const viewH = window.innerHeight;
          const sectionProgress = Math.max(
            0,
            Math.min(1, 1 - (rect.top + rect.height) / (viewH + rect.height))
          );

          const rotation = sectionProgress * 360;
          const translateY = Math.sin(sectionProgress * Math.PI * 2) * 30;

          ballRef.current.style.transform = `translateY(${translateY}px) rotate(${rotation}deg)`;

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ballRef}
      className="absolute pointer-events-none will-change-transform"
      style={{ transform: "translateY(0) rotate(0deg)" }}
    >
      <Image
        src="/images/soccer-ball-svgrepo-com.svg"
        alt=""
        width={60}
        height={60}
        className="h-12 w-12 md:h-16 md:w-16 opacity-20"
        aria-hidden="true"
      />
    </div>
  );
}
