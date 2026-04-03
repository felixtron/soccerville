import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean
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

  // Venues
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

  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      email: "admin@soccerville.mx",
      name: "Admin Soccerville",
      phone: "5215551234567",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Operator Metepec
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

  // Operator Calimaya
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

  // Tournaments - Metepec
  await prisma.tournament.createMany({
    data: [
      {
        name: "Intersemanal Nocturno",
        slug: "metepec-intersemanal-nocturno",
        venueId: metepec.id,
        category: "VARONIL",
        schedule: "NOCTURNO",
        maxTeams: 24,
        inscriptionFee: 1000,
        refereeFee: 550,
        status: "FULL",
      },
      {
        name: "Intersemanal Vespertino",
        slug: "metepec-intersemanal-vespertino",
        venueId: metepec.id,
        category: "VARONIL",
        schedule: "VESPERTINO",
        maxTeams: 8,
        inscriptionFee: 1000,
        refereeFee: 550,
        status: "FULL",
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
        status: "FULL",
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

  // Tournaments - Calimaya
  await prisma.tournament.createMany({
    data: [
      {
        name: "Intersemanal",
        slug: "calimaya-intersemanal",
        venueId: calimaya.id,
        category: "VARONIL",
        schedule: "NOCTURNO",
        maxTeams: 24,
        inscriptionFee: 800,
        refereeFee: 550,
        status: "OPEN",
      },
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

  // Programs
  await prisma.program.createMany({
    data: [
      {
        name: "Red Diablos",
        type: "SCHOOL",
        venueId: metepec.id,
        schedule: "Lunes a Jueves, 4:00 PM - 6:00 PM",
        description:
          "Escuela de futbol con formacion integral para ninos y jovenes.",
      },
      {
        name: "Sirenas FC",
        type: "FIXED_TEAM",
        venueId: calimaya.id,
        schedule: "Martes y Jueves, 4:00 PM - 6:00 PM",
        description:
          "Equipo femenino con entrenamientos regulares y preparacion para torneos.",
      },
    ],
  });

  // Commercial Spaces - Metepec
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

  // Advertising spaces
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
