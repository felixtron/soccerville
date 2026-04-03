/**
 * Round-robin fixture generator.
 * Given N teams, generates (N-1) match days where each team plays every other team once.
 * Supports odd number of teams (one team gets a bye each round).
 */

export type FixtureMatch = {
  matchDay: number;
  homeTeamId: string;
  awayTeamId: string;
};

export function generateRoundRobin(teamIds: string[]): FixtureMatch[] {
  if (teamIds.length < 2) return [];

  // For odd number of teams, add a BYE placeholder
  const teams = [...teamIds];
  const hasBye = teams.length % 2 !== 0;
  if (hasBye) teams.push("BYE");

  const n = teams.length;
  const rounds = n - 1;
  const matchesPerRound = n / 2;
  const fixtures: FixtureMatch[] = [];

  // Circle method: fix first team, rotate the rest
  const fixed = teams[0];
  const rotating = teams.slice(1);

  for (let round = 0; round < rounds; round++) {
    const currentOrder = [fixed, ...rotating];

    for (let i = 0; i < matchesPerRound; i++) {
      const home = currentOrder[i];
      const away = currentOrder[n - 1 - i];

      // Skip matches involving the BYE placeholder
      if (home === "BYE" || away === "BYE") continue;

      fixtures.push({
        matchDay: round + 1,
        homeTeamId: home,
        awayTeamId: away,
      });
    }

    // Rotate: move last element to second position
    rotating.unshift(rotating.pop()!);
  }

  return fixtures;
}

/**
 * Calculate standings from match results.
 * Win = 3pts, Draw = 1pt, Loss = 0pts.
 */
export type StandingCalc = {
  teamId: string;
  points: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

export function calculateStandings(
  teamIds: string[],
  matches: { homeTeamId: string; awayTeamId: string; homeScore: number | null; awayScore: number | null; status: string }[]
): StandingCalc[] {
  const map = new Map<string, StandingCalc>();

  for (const id of teamIds) {
    map.set(id, {
      teamId: id,
      points: 0,
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    });
  }

  for (const m of matches) {
    if (m.status !== "PLAYED" || m.homeScore === null || m.awayScore === null) continue;

    const home = map.get(m.homeTeamId);
    const away = map.get(m.awayTeamId);
    if (!home || !away) continue;

    home.gamesPlayed++;
    away.gamesPlayed++;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.wins++;
      home.points += 3;
      away.losses++;
    } else if (m.homeScore < m.awayScore) {
      away.wins++;
      away.points += 3;
      home.losses++;
    } else {
      home.draws++;
      away.draws++;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const s of map.values()) {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  }

  return Array.from(map.values()).sort(
    (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
  );
}
