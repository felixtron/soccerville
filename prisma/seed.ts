import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { generateRoundRobin } from "../src/lib/fixtures";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ───────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate a date for a given matchDay, starting from a base date, one week apart */
function matchDate(base: Date, matchDay: number, dayOfWeek: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + (matchDay - 1) * 7);
  // Adjust to the desired day of week (1=Mon)
  const diff = dayOfWeek - d.getDay();
  d.setDate(d.getDate() + diff);
  return d;
}

// ─── Data ──────────────────────────────────────────────────

const TEAM_NAMES = [
  "Mineiro", "Milperos", "Ultras", "Real Mandil", "Townie", "Liverpool",
  "Brasil 1530", "Deportivo La Joya", "Barrio Unido", "Libertadores",
  "Aguacateros", "Deportivo Sao", "Botaneros", "Leones", "Drink Team",
  "Modelos Especiales", "Lomecanes", "Lyon", "PSG", "Milan",
];

const FIRST_NAMES = [
  "Carlos", "Miguel", "Jose", "Luis", "Juan", "Diego", "Fernando", "Ricardo",
  "Alejandro", "Eduardo", "Roberto", "Andres", "Daniel", "Gabriel", "Sergio",
  "Pablo", "Adrian", "Oscar", "Victor", "Raul", "Marco", "Ivan", "Jesus",
  "Hector", "Francisco", "Manuel", "Antonio", "Jorge", "David", "Pedro",
  "Enrique", "Armando", "Rafael", "Gerardo", "Arturo", "Guillermo", "Alfredo",
  "Ignacio", "Salvador", "Ernesto",
];

const LAST_NAMES = [
  "Garcia", "Lopez", "Martinez", "Rodriguez", "Hernandez", "Gonzalez",
  "Perez", "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Gomez",
  "Diaz", "Cruz", "Morales", "Reyes", "Gutierrez", "Ortiz", "Ramos",
  "Mendoza", "Castillo", "Romero", "Alvarez", "Jimenez", "Ruiz", "Vargas",
  "Aguilar", "Medina", "Herrera",
];

const POSITIONS = ["Portero", "Defensa", "Medio", "Delantero"];
const MATCH_TIMES = ["20:00", "21:00", "22:00"];

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log("Cleaning database...");

  await prisma.notificationRead.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.schoolEnrollment.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.standing.deleteMany();
  await prisma.match.deleteMany();
  await prisma.tournamentTeam.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.program.deleteMany();
  await prisma.commercialSpace.deleteMany();
  await prisma.user.deleteMany();
  await prisma.venue.deleteMany();

  // ─── Venues ────────────────────────────────────────────

  console.log("Creating venues...");

  const metepec = await prisma.venue.create({
    data: {
      name: "Soccerville Metepec",
      slug: "metepec",
      address: "Metepec, Estado de Mexico",
      phone: "55 1234 5678",
      whatsapp: "5215551234567",
      fieldRentalPrice: 550,
      hasParking: true,
      hasBathrooms: true,
      hasLockers: true,
      hasLighting: true,
      operatingHours: "Lunes a Domingo 8:00 AM - 11:00 PM",
    },
  });

  const calimaya = await prisma.venue.create({
    data: {
      name: "Soccerville Calimaya",
      slug: "calimaya",
      address: "Calimaya, Estado de Mexico",
      phone: "55 8765 4321",
      whatsapp: "5215551234567",
      fieldRentalPrice: 550,
      hasParking: true,
      hasBathrooms: true,
      hasLockers: true,
      hasLighting: true,
      operatingHours: "Lunes a Domingo 8:00 AM - 10:00 PM",
    },
  });

  // ─── Users ─────────────────────────────────────────────

  console.log("Creating users...");

  const hashedPassword = await bcrypt.hash("admin123", 12);
  const captainPassword = await bcrypt.hash("equipo123", 12);

  await prisma.user.create({
    data: {
      email: "admin@soccerville.mx",
      name: "Admin Soccerville",
      phone: "5215551234567",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "metepec@soccerville.mx",
      name: "Operador Metepec",
      phone: "5215551234568",
      password: hashedPassword,
      role: "OPERATOR",
      venueId: metepec.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "calimaya@soccerville.mx",
      name: "Operador Calimaya",
      phone: "5215551234569",
      password: hashedPassword,
      role: "OPERATOR",
      venueId: calimaya.id,
    },
  });

  // ─── Empty tournaments (other venues / statuses) ───────

  console.log("Creating tournaments...");

  // Metepec tournaments (no teams, various statuses)
  await prisma.tournament.createMany({
    data: [
      {
        name: "Intersemanal Vespertino",
        slug: "metepec-intersemanal-vespertino",
        venueId: metepec.id,
        category: "VARONIL",
        schedule: "VESPERTINO",
        maxTeams: 8,
        inscriptionFee: 1000,
        refereeFee: 550,
        status: "OPEN",
      },
      {
        name: "Sabatino",
        slug: "metepec-sabatino",
        venueId: metepec.id,
        category: "VARONIL",
        schedule: "SABATINO",
        maxTeams: 12,
        inscriptionFee: 800,
        refereeFee: 450,
        status: "OPEN",
      },
      {
        name: "Dominical",
        slug: "metepec-dominical",
        venueId: metepec.id,
        category: "VARONIL",
        schedule: "DOMINICAL",
        maxTeams: 12,
        inscriptionFee: 800,
        refereeFee: 450,
        status: "OPEN",
      },
      {
        name: "Femenil",
        slug: "metepec-femenil",
        venueId: metepec.id,
        category: "FEMENIL",
        schedule: "SABATINO",
        maxTeams: 12,
        inscriptionFee: 800,
        refereeFee: 450,
        status: "OPEN",
      },
      {
        name: "Veteranos",
        slug: "metepec-veteranos",
        venueId: metepec.id,
        category: "VETERANOS",
        schedule: "DOMINICAL",
        maxTeams: 12,
        inscriptionFee: 800,
        refereeFee: 450,
        status: "OPEN",
      },
    ],
  });

  // Calimaya empty tournaments
  await prisma.tournament.createMany({
    data: [
      {
        name: "Sabatino",
        slug: "calimaya-sabatino",
        venueId: calimaya.id,
        category: "VARONIL",
        schedule: "SABATINO",
        maxTeams: 12,
        inscriptionFee: 600,
        refereeFee: 400,
        status: "OPEN",
      },
      {
        name: "Femenil Sabatino",
        slug: "calimaya-femenil-sabatino",
        venueId: calimaya.id,
        category: "FEMENIL",
        schedule: "SABATINO",
        maxTeams: 12,
        inscriptionFee: 600,
        refereeFee: 400,
        status: "OPEN",
      },
      {
        name: "Dominical Vespertino",
        slug: "calimaya-dominical-vespertino",
        venueId: calimaya.id,
        category: "VARONIL",
        schedule: "DOMINICAL",
        maxTeams: 12,
        inscriptionFee: 600,
        refereeFee: 400,
        status: "OPEN",
      },
    ],
  });

  // ─── MAIN TOURNAMENT: Calimaya Intersemanal (with full data) ─

  console.log("Creating main tournament with teams and fixtures...");

  const mainTournament = await prisma.tournament.create({
    data: {
      name: "Intersemanal Nocturno",
      slug: "calimaya-intersemanal",
      venueId: calimaya.id,
      category: "VARONIL",
      schedule: "NOCTURNO",
      maxTeams: 24,
      inscriptionFee: 800,
      refereeFee: 550,
      status: "IN_PROGRESS",
      startDate: new Date("2026-01-05"),
    },
  });

  // ─── SECOND TOURNAMENT: Metepec Nocturno (also with data) ─

  const metepecTournament = await prisma.tournament.create({
    data: {
      name: "Intersemanal Nocturno",
      slug: "metepec-intersemanal-nocturno",
      venueId: metepec.id,
      category: "VARONIL",
      schedule: "NOCTURNO",
      maxTeams: 24,
      inscriptionFee: 1000,
      refereeFee: 550,
      status: "IN_PROGRESS",
      startDate: new Date("2026-01-12"),
    },
  });

  // ─── Create teams with captains and players ────────────

  console.log("Creating 20 teams with players...");

  const usedNames = new Set<string>();
  function uniqueName(): string {
    let name: string;
    do {
      name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
  }

  const teamRecords: { id: string; name: string; playerIds: string[] }[] = [];

  for (let i = 0; i < TEAM_NAMES.length; i++) {
    const teamName = TEAM_NAMES[i];
    const captainName = uniqueName();

    // Create captain user
    const captain = await prisma.user.create({
      data: {
        email: `captain.${teamName.toLowerCase().replace(/\s+/g, "")}@soccerville.mx`,
        name: captainName,
        phone: `52155${String(1000000 + i).slice(1)}`,
        password: captainPassword,
        role: "CAPTAIN",
      },
    });

    // Create team
    const team = await prisma.team.create({
      data: {
        name: teamName,
        captainId: captain.id,
      },
    });

    // Create 8-10 players per team
    const numPlayers = rand(8, 10);
    const playerIds: string[] = [];
    for (let j = 0; j < numPlayers; j++) {
      const player = await prisma.player.create({
        data: {
          name: uniqueName(),
          number: j + 1,
          position: POSITIONS[j < 1 ? 0 : j < 3 ? 1 : j < 6 ? 2 : 3],
          teamId: team.id,
        },
      });
      playerIds.push(player.id);
    }

    teamRecords.push({ id: team.id, name: teamName, playerIds });
  }

  // ─── Enroll teams in tournaments ───────────────────────

  console.log("Enrolling teams...");

  // Calimaya: all 20 teams
  for (const t of teamRecords) {
    await prisma.tournamentTeam.create({
      data: { tournamentId: mainTournament.id, teamId: t.id },
    });
  }

  // Metepec: first 12 teams
  for (const t of teamRecords.slice(0, 12)) {
    await prisma.tournamentTeam.create({
      data: { tournamentId: metepecTournament.id, teamId: t.id },
    });
  }

  // ─── Generate fixtures for Calimaya ────────────────────

  console.log("Generating fixtures for Calimaya Intersemanal...");

  const calimayaTeamIds = teamRecords.map((t) => t.id);
  const calimayaFixtures = generateRoundRobin(calimayaTeamIds);
  const baseDate = new Date("2026-01-05");
  const JORNADAS_PLAYED = 9; // 9 of 19 jornadas played

  const calimayaMatches: {
    id: string;
    matchDay: number;
    homeTeamId: string;
    awayTeamId: string;
    status: string;
    homeScore: number | null;
    awayScore: number | null;
  }[] = [];

  for (const f of calimayaFixtures) {
    const date = matchDate(baseDate, f.matchDay, 1); // Monday
    const isPlayed = f.matchDay <= JORNADAS_PLAYED;

    let homeScore: number | null = null;
    let awayScore: number | null = null;
    let status = "SCHEDULED";

    if (isPlayed) {
      homeScore = rand(0, 8);
      awayScore = rand(0, 8);
      status = "PLAYED";
      // Occasional cancelled/defaulted games
      if (Math.random() < 0.03) {
        status = "CANCELLED";
        homeScore = null;
        awayScore = null;
      } else if (Math.random() < 0.02) {
        status = "DEFAULTED";
        homeScore = 3;
        awayScore = 0;
      }
    }

    const match = await prisma.match.create({
      data: {
        tournamentId: mainTournament.id,
        matchDay: f.matchDay,
        homeTeamId: f.homeTeamId,
        awayTeamId: f.awayTeamId,
        homeScore,
        awayScore,
        date,
        time: pick(MATCH_TIMES),
        fieldNumber: rand(1, 2),
        status: status as any,
      },
    });

    calimayaMatches.push({
      id: match.id,
      matchDay: f.matchDay,
      homeTeamId: f.homeTeamId,
      awayTeamId: f.awayTeamId,
      status,
      homeScore,
      awayScore,
    });
  }

  // ─── Generate match events for played matches ─────────

  console.log("Creating match events (goals, cards)...");

  const teamPlayerMap = new Map(teamRecords.map((t) => [t.id, t.playerIds]));

  for (const m of calimayaMatches) {
    if (m.status !== "PLAYED" && m.status !== "DEFAULTED") continue;

    const homePlayers = teamPlayerMap.get(m.homeTeamId) ?? [];
    const awayPlayers = teamPlayerMap.get(m.awayTeamId) ?? [];

    // Create goal events matching the score
    if (m.homeScore !== null) {
      for (let g = 0; g < m.homeScore; g++) {
        if (homePlayers.length === 0) break;
        // Bias towards forwards (last players in array)
        const scorerIdx = Math.random() < 0.6 ? rand(Math.max(0, homePlayers.length - 3), homePlayers.length - 1) : rand(0, homePlayers.length - 1);
        await prisma.matchEvent.create({
          data: {
            matchId: m.id,
            playerId: homePlayers[scorerIdx],
            teamId: m.homeTeamId,
            type: "GOAL",
            minute: rand(1, 60),
          },
        });
      }
    }

    if (m.awayScore !== null) {
      for (let g = 0; g < m.awayScore; g++) {
        if (awayPlayers.length === 0) break;
        const scorerIdx = Math.random() < 0.6 ? rand(Math.max(0, awayPlayers.length - 3), awayPlayers.length - 1) : rand(0, awayPlayers.length - 1);
        await prisma.matchEvent.create({
          data: {
            matchId: m.id,
            playerId: awayPlayers[scorerIdx],
            teamId: m.awayTeamId,
            type: "GOAL",
            minute: rand(1, 60),
          },
        });
      }
    }

    // Random yellow cards (0-3 per match)
    const yellowCount = rand(0, 3);
    for (let c = 0; c < yellowCount; c++) {
      const isHome = Math.random() < 0.5;
      const players = isHome ? homePlayers : awayPlayers;
      if (players.length === 0) continue;
      await prisma.matchEvent.create({
        data: {
          matchId: m.id,
          playerId: pick(players),
          teamId: isHome ? m.homeTeamId : m.awayTeamId,
          type: "YELLOW_CARD",
          minute: rand(1, 60),
        },
      });
    }

    // Occasional red card (~10% of matches)
    if (Math.random() < 0.1) {
      const isHome = Math.random() < 0.5;
      const players = isHome ? homePlayers : awayPlayers;
      if (players.length > 0) {
        await prisma.matchEvent.create({
          data: {
            matchId: m.id,
            playerId: pick(players),
            teamId: isHome ? m.homeTeamId : m.awayTeamId,
            type: "RED_CARD",
            minute: rand(20, 60),
          },
        });
      }
    }
  }

  // ─── Calculate and save standings for Calimaya ─────────

  console.log("Calculating standings...");

  const standingsMap = new Map<
    string,
    {
      points: number;
      gamesPlayed: number;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      defaultWins: number;
      defaultLosses: number;
    }
  >();

  for (const t of teamRecords) {
    standingsMap.set(t.id, {
      points: 0,
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      defaultWins: 0,
      defaultLosses: 0,
    });
  }

  for (const m of calimayaMatches) {
    if (m.status !== "PLAYED" && m.status !== "DEFAULTED") continue;
    if (m.homeScore === null || m.awayScore === null) continue;

    const home = standingsMap.get(m.homeTeamId)!;
    const away = standingsMap.get(m.awayTeamId)!;

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

    if (m.status === "DEFAULTED") {
      if (m.homeScore > m.awayScore) {
        home.defaultWins++;
        away.defaultLosses++;
      } else {
        away.defaultWins++;
        home.defaultLosses++;
      }
    }
  }

  for (const [teamId, s] of standingsMap) {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
    await prisma.standing.create({
      data: {
        tournamentId: mainTournament.id,
        teamId,
        ...s,
      },
    });
  }

  // ─── Generate fixtures + standings for Metepec ─────────

  console.log("Generating fixtures for Metepec Intersemanal...");

  const metepecTeamIds = teamRecords.slice(0, 12).map((t) => t.id);
  const metepecFixtures = generateRoundRobin(metepecTeamIds);
  const metBaseDate = new Date("2026-01-12");
  const MET_JORNADAS_PLAYED = 5;

  const metStandingsMap = new Map<string, {
    points: number; gamesPlayed: number; wins: number; draws: number;
    losses: number; goalsFor: number; goalsAgainst: number; goalDifference: number;
    defaultWins: number; defaultLosses: number;
  }>();

  for (const id of metepecTeamIds) {
    metStandingsMap.set(id, {
      points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, defaultWins: 0, defaultLosses: 0,
    });
  }

  for (const f of metepecFixtures) {
    const date = matchDate(metBaseDate, f.matchDay, 3); // Wednesday
    const isPlayed = f.matchDay <= MET_JORNADAS_PLAYED;

    let homeScore: number | null = null;
    let awayScore: number | null = null;
    let status = "SCHEDULED";

    if (isPlayed) {
      homeScore = rand(0, 7);
      awayScore = rand(0, 7);
      status = "PLAYED";
    }

    await prisma.match.create({
      data: {
        tournamentId: metepecTournament.id,
        matchDay: f.matchDay,
        homeTeamId: f.homeTeamId,
        awayTeamId: f.awayTeamId,
        homeScore,
        awayScore,
        date,
        time: pick(MATCH_TIMES),
        fieldNumber: rand(1, 3),
        status: status as any,
      },
    });

    if (isPlayed && homeScore !== null && awayScore !== null) {
      const home = metStandingsMap.get(f.homeTeamId)!;
      const away = metStandingsMap.get(f.awayTeamId)!;
      home.gamesPlayed++; away.gamesPlayed++;
      home.goalsFor += homeScore; home.goalsAgainst += awayScore;
      away.goalsFor += awayScore; away.goalsAgainst += homeScore;
      if (homeScore > awayScore) { home.wins++; home.points += 3; away.losses++; }
      else if (homeScore < awayScore) { away.wins++; away.points += 3; home.losses++; }
      else { home.draws++; away.draws++; home.points++; away.points++; }
    }
  }

  for (const [teamId, s] of metStandingsMap) {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
    await prisma.standing.create({
      data: { tournamentId: metepecTournament.id, teamId, ...s },
    });
  }

  // ─── Programs ──────────────────────────────────────────

  console.log("Creating programs and school students...");

  const redDiablos = await prisma.program.create({
    data: {
      name: "Red Diablos",
      type: "SCHOOL",
      venueId: metepec.id,
      schedule: "Lunes a Jueves, 4:00 PM - 6:00 PM",
      monthlyFee: 500,
      maxStudents: 30,
      description: "Escuela de futbol con formacion integral para ninos y jovenes.",
    },
  });

  const sirenas = await prisma.program.create({
    data: {
      name: "Sirenas FC",
      type: "FIXED_TEAM",
      venueId: calimaya.id,
      schedule: "Martes y Jueves, 4:00 PM - 6:00 PM",
      monthlyFee: 450,
      maxStudents: 20,
      description: "Equipo femenino con entrenamientos regulares y preparacion para torneos.",
    },
  });

  // ─── School students (demo) ────────────────────────────

  const studentPassword = await bcrypt.hash("escuela123", 12);

  const students = [
    { name: "Santiago Lopez", age: 10, parent: "Maria Lopez", parentPhone: "722 111 2233", program: redDiablos },
    { name: "Valentina Torres", age: 8, parent: "Roberto Torres", parentPhone: "722 222 3344", program: redDiablos },
    { name: "Mateo Garcia", age: 12, parent: "Ana Garcia", parentPhone: "722 333 4455", program: redDiablos },
    { name: "Sofia Martinez", age: 14, parent: "Carlos Martinez", parentPhone: "722 444 5566", program: sirenas },
    { name: "Isabella Hernandez", age: 13, parent: "Laura Hernandez", parentPhone: "722 555 6677", program: sirenas },
  ];

  for (const s of students) {
    const emailSlug = s.name.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const student = await prisma.user.create({
      data: {
        name: s.name,
        email: `${emailSlug}@soccerville.mx`,
        phone: s.parentPhone,
        password: studentPassword,
        role: "STUDENT",
      },
    });

    await prisma.schoolEnrollment.create({
      data: {
        programId: s.program.id,
        studentId: student.id,
        studentName: s.name,
        studentAge: s.age,
        parentName: s.parent,
        parentPhone: s.parentPhone,
      },
    });
  }

  // ─── Commercial Spaces ─────────────────────────────────

  for (let i = 1; i <= 4; i++) {
    await prisma.commercialSpace.create({
      data: {
        venueId: metepec.id,
        type: "FOODTRUCK",
        label: `Espacio Foodtruck ${i}`,
        price: 2500,
        contractMonths: 6,
        status: "AVAILABLE",
      },
    });
  }

  for (let i = 1; i <= 4; i++) {
    await prisma.commercialSpace.create({
      data: {
        venueId: metepec.id,
        type: "ADVERTISING",
        label: `Espacio Publicitario ${i}`,
        price: 1500,
        contractMonths: 6,
        status: "AVAILABLE",
      },
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
