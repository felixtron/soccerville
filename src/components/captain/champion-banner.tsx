"use client";

import { useState, useEffect } from "react";
import { ChampionCelebration } from "./champion-celebration";

export function ChampionBanner({
  teamName,
  logoUrl,
  tournamentName,
}: {
  teamName: string;
  logoUrl: string | null;
  tournamentName: string;
}) {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Only show once per session
    const key = `champion-seen-${teamName}`;
    if (!sessionStorage.getItem(key)) {
      setShowCelebration(true);
      sessionStorage.setItem(key, "1");
    }
  }, [teamName]);

  if (!showCelebration) return null;

  return (
    <ChampionCelebration
      teamName={teamName}
      logoUrl={logoUrl}
      tournamentName={tournamentName}
      onClose={() => setShowCelebration(false)}
    />
  );
}
