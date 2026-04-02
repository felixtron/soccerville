# Soccerville - Design Document

## Understanding Summary

### What
Plataforma web completa de gestion deportiva para negocio de renta de canchas de futbol 7 con dos sedes (Metepec y Calimaya). Incluye cara publica mobile-first y panel administrativo.

### Why
- Reemplazar gestion manual (Excel, WhatsApp, libreta) con sistema centralizado
- Facilitar inscripciones y pagos online para reducir friccion
- Generar automaticamente calendarios de torneos (fixtures)
- Mostrar disponibilidad y generar urgencia/prueba social

### Who
- **Publico general** — ve info de torneos, precios, sedes sin cuenta
- **Capitanes de equipo** — cuenta basica para inscribir equipo, ver calendario y tabla de posiciones
- **Admin principal** — control total de ambas sedes
- **Operadores de sede (1-2 por sede)** — permisos limitados

### Revenue Streams
1. **Torneos** — inscripcion + arbitraje (multiples formatos/categorias por sede)
2. **Renta de cancha** — $550/hora con reserva online
3. **Escuela de futbol** — Red Diablos (Metepec), Sirenas FC (Calimaya)
4. **Foodtrucks** — 4 espacios, $2,500/mes, contrato 6 meses (pago recurrente)
5. **Publicidad** — $1,500/mes, contrato 6 meses (pago recurrente)
6. **Eventos especiales** — bazares, calistenia, inflables, etc.

### Non-Goals
- App nativa (PWA posible a futuro)
- Stats individuales por jugador
- Facturacion fiscal CFDI (por ahora)
- Ecommerce / tienda de productos

### Assumptions
1. Un solo dominio con secciones por sede
2. Stripe Mexico (requiere RFC y cuenta bancaria)
3. Sin facturacion CFDI — recibos de Stripe suficientes
4. Contenido (fotos, textos) proporcionados por el cliente
5. Espanol unicamente

---

## Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|----------|------------------------|-----------|
| 1 | Monolito Next.js (App Router) | Frontend+API separados, WordPress | Un solo codebase, rapido de desarrollar, SSR para SEO, API Routes integradas, Dokploy lo despliega trivialmente |
| 2 | PostgreSQL + Prisma | MySQL, MongoDB | Relaciones complejas (equipos-torneos-partidos), Prisma tipado, migraciones faciles |
| 3 | Stripe para pagos | Conekta, MercadoPago | El cliente lo eligio. Soporta tarjeta, SPEI, OXXO, subscriptions |
| 4 | NextAuth.js v5 | Clerk, Auth0, custom JWT | Gratis, integrado con Next.js, suficiente para auth basica |
| 5 | Tailwind + shadcn/ui | MUI, Chakra, Ant Design | Ligero, mobile-first nativo, componentes copiables sin dependencia |
| 6 | Mobile-first publico, responsive admin | Responsive uniforme, app nativa | 90% del publico entra desde celular, admin usa escritorio |
| 7 | Generacion automatica de fixtures | CRUD manual de partidos | Ahorra tiempo significativo al admin, diferenciador clave |
| 8 | Lanzamiento por fases | Big bang release | Permite entregar valor incremental, lo urgente primero |

---

## Architecture

### Stack
- **Runtime**: Node.js 20+
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Auth**: NextAuth.js v5 (credentials + optional Google)
- **Payments**: Stripe SDK (Checkout Sessions, Subscriptions, Webhooks)
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Deployment**: Dokploy (Docker) on VPS
- **Image Storage**: Docker volume (migrable to S3 later)

### Project Structure
```
soccerville/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (public)/           # Cara publica (no auth)
│   │   │   ├── page.tsx        # Home
│   │   │   ├── torneos/        # Torneos por sede
│   │   │   ├── reservar/       # Reserva de cancha
│   │   │   ├── escuela/        # Escuela de futbol
│   │   │   ├── espacios/       # Foodtrucks, publicidad, eventos
│   │   │   └── contacto/       # Contacto + mapa
│   │   ├── (auth)/             # Paginas con auth
│   │   │   ├── equipo/         # Dashboard del capitan
│   │   │   ├── login/
│   │   │   └── registro/
│   │   ├── admin/              # Panel administrativo
│   │   │   ├── dashboard/
│   │   │   ├── torneos/
│   │   │   ├── reservas/
│   │   │   ├── equipos/
│   │   │   ├── pagos/
│   │   │   ├── espacios/
│   │   │   └── usuarios/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── stripe/
│   │   │   │   └── webhook/
│   │   │   ├── torneos/
│   │   │   ├── reservas/
│   │   │   ├── equipos/
│   │   │   └── espacios/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── public/             # Componentes cara publica
│   │   ├── admin/              # Componentes panel admin
│   │   └── shared/             # Componentes compartidos
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── stripe.ts           # Stripe client config
│   │   ├── auth.ts             # NextAuth config
│   │   ├── fixtures.ts         # Motor de generacion de calendarios
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

### Data Model (Core Entities)

```
Venue (Sede)
├── id, name, slug, address, phone, whatsapp, googleMapsUrl
├── amenities (parking, bathrooms, lockers, lighting)
├── fieldRentalPrice, operatingHours
│
├── Tournament[] ──── TournamentTeam[] ──── Team[]
│   ├── name, type (intersemanal/sabatino/dominical/femenil/veteranos)
│   ├── schedule (nocturno/vespertino/matutino)
│   ├── maxTeams, currentTeams
│   ├── inscriptionFee, refereeFee
│   ├── status (open/full/in_progress/finished)
│   ├── startDate, endDate
│   │
│   ├── Match[]
│   │   ├── homeTeam, awayTeam
│   │   ├── date, time, field
│   │   ├── homeScore, awayScore
│   │   ├── status (scheduled/played/cancelled)
│   │   └── matchDay (jornada)
│   │
│   └── Standing[] (tabla de posiciones)
│       ├── team, points, wins, draws, losses
│       ├── goalsFor, goalsAgainst, goalDifference
│       └── gamesPlayed
│
├── Booking[] (reservas de cancha)
│   ├── date, startTime, endTime
│   ├── customerName, customerPhone
│   ├── status (pending/confirmed/cancelled)
│   └── paymentStatus
│
├── Program[] (escuelas / equipos fijos)
│   ├── name, schedule, description
│   └── type (school/fixed_team)
│
└── CommercialSpace[] (foodtrucks, publicidad, eventos)
    ├── type (foodtruck/advertising/event)
    ├── price, contractMonths
    ├── status (available/rented)
    └── tenant info

Team
├── id, name, captainId
├── players[] (nombre, numero, posicion)
└── tournaments[]

User
├── id, email, name, phone, role
├── role: ADMIN | OPERATOR | CAPTAIN
├── venueId (for operators)
└── teamId (for captains)

Payment
├── id, stripePaymentId, stripeSubscriptionId
├── amount, currency, status
├── type (inscription/referee/booking/rental/advertising)
├── userId, venueId
└── metadata (tournamentId, bookingId, spaceId)
```

### Fixture Generation Engine
El motor de calendarios soporta:
- **Round-robin** (todos contra todos) — para torneos de liga
- Genera automaticamente jornadas al inscribir todos los equipos
- Admin puede ajustar fechas/horarios antes de publicar
- Soporte para numero impar de equipos (bye/descanso)
- Calculo automatico de tabla de posiciones al registrar resultados

### Stripe Integration
- **Checkout Sessions**: Pago unico para inscripciones y reservas
- **Subscriptions**: Pago recurrente para foodtrucks y publicidad
- **Webhooks**: Confirmacion asincrona de pagos
- **Metodos**: Tarjeta, SPEI, OXXO (via Stripe Mexico)
- **Admin override**: Marcar pagos en efectivo manualmente

### Auth & Roles
| Role | Permissions |
|------|------------|
| ADMIN | Todo — ambas sedes, config, usuarios, pagos, reportes |
| OPERATOR | Su sede — registrar pagos efectivo, gestionar partidos, reservas |
| CAPTAIN | Su equipo — ver calendario, tabla, historial de pagos |

---

## Phase Plan

### Phase 1: Foundation + Public Site (MVP)
**Goal**: Sitio publico visible con info de torneos, sedes, y contacto WhatsApp.
- Setup proyecto (Next.js, Prisma, PostgreSQL, Docker)
- Data model base (Venue, Tournament, Team)
- Paginas publicas: Home, Torneos (por sede), Renta de cancha, Escuela, Espacios, Contacto
- Mobile-first responsive design
- SEO basico (meta tags, sitemap)
- Deploy en Dokploy

### Phase 2: Admin Panel + Auth
**Goal**: Panel admin funcional para gestionar contenido.
- Auth system (NextAuth.js) con roles
- Admin dashboard con metricas basicas
- CRUD: Torneos, Equipos, Sedes, Programas, Espacios comerciales
- Gestion de usuarios y operadores

### Phase 3: Tournaments Engine
**Goal**: Sistema completo de torneos con fixtures automaticos.
- Inscripcion de equipos (capitan crea cuenta)
- Generacion automatica de fixtures (round-robin)
- Registro de resultados por admin/operador
- Tabla de posiciones automatica
- Vista publica de calendario y standings

### Phase 4: Payments (Stripe)
**Goal**: Pagos online funcionando.
- Stripe integration (Checkout Sessions)
- Pago de inscripcion a torneo
- Pago de reserva de cancha
- Stripe Subscriptions para foodtrucks/publicidad
- Webhook handling
- Admin: marcar pagos en efectivo

### Phase 5: Bookings System
**Goal**: Reservas de cancha online.
- Calendario de disponibilidad por sede
- Flujo de reserva con pago integrado
- Confirmacion automatica
- Admin: gestionar reservas, bloquear horarios

### Phase 6: Polish & Extras
**Goal**: Refinamiento y features secundarios.
- Notificaciones WhatsApp (API o links directos)
- PWA setup (installable en celular)
- Reportes financieros en admin
- Optimizacion de performance
- Torneo privado (cotizacion para empresas/amigos)

---

## Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| Stripe Mexico approval delay | Empezar con pagos manuales (efectivo), integrar Stripe cuando este aprobado |
| Complejidad de fixtures para formatos raros | Empezar con round-robin simple, extender despues |
| Fotos/contenido no listo | Usar placeholders, estructura lista para swap |
| Operadores no tecnicos | UI admin simple, capacitacion basica |
