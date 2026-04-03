"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function useCountUp(target: number, duration = 1800) {
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

const stats = [
  { target: 2, label: "Sedes", suffix: "" },
  { target: 10, label: "Torneos Activos", suffix: "+" },
  { target: 100, label: "Equipos Inscritos", suffix: "+" },
  { target: 24, label: "Red Diablos", suffix: "", isTeam: true },
  { target: 1000, label: "Jugadores", suffix: "+" },
  { target: 7, label: "Dias a la Semana", suffix: "", isSchedule: true },
];

// Floating ball positions — predefined to avoid hydration mismatch
const balls = [
  { top: "8%", left: "5%", size: 28, delay: 0, duration: 4.5 },
  { top: "65%", left: "12%", size: 18, delay: 1.2, duration: 5.2 },
  { top: "20%", left: "88%", size: 24, delay: 0.8, duration: 3.8 },
  { top: "70%", left: "92%", size: 20, delay: 2.1, duration: 4.8 },
  { top: "45%", left: "50%", size: 14, delay: 1.5, duration: 5.5 },
  { top: "15%", left: "72%", size: 16, delay: 0.4, duration: 4.2 },
];

export function StatsBar() {
  return (
    <section className="relative bg-primary text-white overflow-hidden">
      {/* Floating soccer balls */}
      {balls.map((ball, i) => (
        <div
          key={i}
          className="absolute pointer-events-none opacity-[0.12] animate-float"
          style={{
            top: ball.top,
            left: ball.left,
            animationDelay: `${ball.delay}s`,
            animationDuration: `${ball.duration}s`,
          }}
        >
          <Image
            src="/images/soccer-ball-svgrepo-com.svg"
            alt=""
            width={ball.size}
            height={ball.size}
            className="brightness-0 invert"
            style={{ width: ball.size, height: ball.size }}
            aria-hidden="true"
          />
        </div>
      ))}

      {/* Subtle top/bottom diagonal cuts */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-600 via-primary to-emerald-800" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-10">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {stats.map((stat) => (
            <CounterItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-800 via-primary to-emerald-600" />
    </section>
  );
}

function CounterItem({
  target,
  label,
  suffix,
  isTeam,
  isSchedule,
}: {
  target: number;
  label: string;
  suffix: string;
  isTeam?: boolean;
  isSchedule?: boolean;
}) {
  const { value, ref } = useCountUp(target);
  return (
    <div ref={ref} className="text-center group">
      <p className="font-display text-3xl md:text-4xl leading-none tracking-tight transition-transform duration-300 group-hover:scale-110">
        {isTeam ? (
          <span className="text-yellow-300">{value}</span>
        ) : isSchedule ? (
          <span className="text-emerald-300">{value}</span>
        ) : (
          <>
            {value}
            <span className="text-white/50">{suffix}</span>
          </>
        )}
      </p>
      <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-white/50 mt-1.5 leading-tight">
        {label}
      </p>
    </div>
  );
}
