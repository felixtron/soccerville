"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const lines = [
  { text: "La Mejor", color: "text-white" },
  {
    text: "Experiencia",
    color:
      "text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500",
  },
  { text: "De Futbol 7", color: "text-white", hasAccent: true },
];

export function HeroTitle() {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const spans = el.querySelectorAll<HTMLElement>(".hero-line");
    const chars = el.querySelectorAll<HTMLElement>(".hero-char");

    // Set initial state
    gsap.set(spans, { y: 80, opacity: 0, rotateX: -40 });
    gsap.set(chars, { opacity: 0, y: 20 });

    // Timeline
    const tl = gsap.timeline({ delay: 0.3 });

    // Lines slide up with stagger
    tl.to(spans, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: "power3.out",
    });

    // Then chars in "Futbol 7" pop in
    tl.to(
      chars,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.04,
        ease: "back.out(2)",
      },
      "-=0.3"
    );

    // Subtle float on the green line
    gsap.to(spans[1], {
      y: -4,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1.5,
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <h1
      ref={containerRef}
      className="text-center uppercase"
      style={{
        fontFamily: "'Sports World', var(--font-display), sans-serif",
        perspective: "800px",
      }}
    >
      {/* La Mejor */}
      <span
        className="hero-line block text-white text-[clamp(3rem,11vw,9rem)] leading-[1.1] tracking-wider"
        style={{ willChange: "transform, opacity" }}
      >
        La Mejor
      </span>

      {/* Experiencia */}
      <span
        className="hero-line block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 text-[clamp(2.2rem,9vw,7.5rem)] leading-[1.1] tracking-wider"
        style={{ willChange: "transform, opacity" }}
      >
        Experiencia
      </span>

      {/* De Futbol 7 */}
      <span
        className="hero-line block text-[clamp(3rem,11vw,9rem)] leading-[1.1] tracking-wider"
        style={{ willChange: "transform, opacity" }}
      >
        <span className="text-white">De </span>
        {/* Each char of "Futbol 7" animates individually */}
        {"Futbol 7".split("").map((char, i) => (
          <span
            key={i}
            className="hero-char inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-orange-400"
            style={{ willChange: "transform, opacity" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </h1>
  );
}
