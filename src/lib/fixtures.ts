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
 * Default win = 3pts + 3-0 score. Abandoned = result stands if played, otherwise 0-0.
 */

/** Statuses that count as a completed match for standings */
const COUNTED_STATUSES = new Set(["PLAYED", "DEFAULTED", "ABANDONED"]);

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
  penaltyPoints: number;
  defaultWins: number;
  defaultLosses: number;
};

type MatchInput = {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
};

export function calculateStandings(
  teamIds: string[],
  matches: MatchInput[]
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
      penaltyPoints: 0,
      defaultWins: 0,
      defaultLosses: 0,
    });
  }

  for (const m of matches) {
    if (!COUNTED_STATUSES.has(m.status)) continue;

    const home = map.get(m.homeTeamId);
    const away = map.get(m.awayTeamId);
    if (!home || !away) continue;

    let hScore: number;
    let aScore: number;

    if (m.status === "DEFAULTED") {
      // Default: 3-0 to the team that showed up (winner gets non-null score or home by default)
      // If scores are set, use them; otherwise award 3-0 to home
      hScore = m.homeScore ?? 3;
      aScore = m.awayScore ?? 0;
      if (hScore > aScore) {
        home.defaultWins++;
        away.defaultLosses++;
      } else {
        away.defaultWins++;
        home.defaultLosses++;
      }
    } else {
      // PLAYED or ABANDONED — use recorded scores
      if (m.homeScore === null || m.awayScore === null) continue;
      hScore = m.homeScore;
      aScore = m.awayScore;
    }

    home.gamesPlayed++;
    away.gamesPlayed++;
    home.goalsFor += hScore;
    home.goalsAgainst += aScore;
    away.goalsFor += aScore;
    away.goalsAgainst += hScore;

    if (hScore > aScore) {
      home.wins++;
      home.points += 3;
      away.losses++;
    } else if (hScore < aScore) {
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
    // Subtract penalty points (from accumulated cards/sanctions)
    s.points = Math.max(0, s.points - s.penaltyPoints);
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor
  );
}

/**
 * Top scorers from match events.
 */
export type TopScorer = {
  playerId: string;
  playerName: string;
  teamName: string;
  goals: number;
  ownGoals: number;
};

export function calculateTopScorers(
  events: { playerId: string; playerName: string; teamName: string; type: string }[]
): TopScorer[] {
  const map = new Map<string, TopScorer>();

  for (const e of events) {
    if (e.type !== "GOAL" && e.type !== "OWN_GOAL") continue;

    let scorer = map.get(e.playerId);
    if (!scorer) {
      scorer = {
        playerId: e.playerId,
        playerName: e.playerName,
        teamName: e.teamName,
        goals: 0,
        ownGoals: 0,
      };
      map.set(e.playerId, scorer);
    }

    if (e.type === "GOAL") scorer.goals++;
    else scorer.ownGoals++;
  }

  return Array.from(map.values()).sort((a, b) => b.goals - a.goals);
}

/**
 * Card/sanction summary per player.
 */
export type CardSummary = {
  playerId: string;
  playerName: string;
  teamName: string;
  yellowCards: number;
  redCards: number;
  sanctions: number;
};

export function calculateCardSummary(
  events: { playerId: string; playerName: string; teamName: string; type: string }[]
): CardSummary[] {
  const map = new Map<string, CardSummary>();

  for (const e of events) {
    if (e.type !== "YELLOW_CARD" && e.type !== "RED_CARD" && e.type !== "SANCTION") continue;

    let entry = map.get(e.playerId);
    if (!entry) {
      entry = {
        playerId: e.playerId,
        playerName: e.playerName,
        teamName: e.teamName,
        yellowCards: 0,
        redCards: 0,
        sanctions: 0,
      };
      map.set(e.playerId, entry);
    }

    if (e.type === "YELLOW_CARD") entry.yellowCards++;
    else if (e.type === "RED_CARD") entry.redCards++;
    else entry.sanctions++;
  }

  return Array.from(map.values()).sort(
    (a, b) => b.redCards - a.redCards || b.yellowCards - a.yellowCards || b.sanctions - a.sanctions
  );
}
