"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

const stats = [
  { target: 2, label: "Sedes", suffix: "" },
  { target: 10, label: "Torneos", suffix: "+" },
  { target: 100, label: "Equipos", suffix: "+" },
  { target: 1000, label: "Jugadores", suffix: "+" },
];

export function HeroCounter() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
      {stats.map((stat) => (
        <CounterItem key={stat.label} {...stat} />
      ))}
    </div>
  );
}

function CounterItem({
  target,
  label,
  suffix,
}: {
  target: number;
  label: string;
  suffix: string;
}) {
  const { value, ref } = useCountUp(target);
  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-5xl md:text-7xl leading-none tracking-tight">
        {value}
        {suffix}
      </p>
      <p className="text-sm uppercase tracking-[0.2em] text-white/60 mt-2">
        {label}
      </p>
    </div>
  );
}
