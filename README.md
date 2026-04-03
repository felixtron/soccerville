# Soccerville

Plataforma web de gestion deportiva para negocio de renta de canchas de futbol 7 con dos sedes: Metepec y Calimaya.

**Produccion:** https://soccerville.prosuite.pro

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Base de datos:** PostgreSQL 16 + Prisma ORM
- **Auth:** NextAuth.js v5 (Credentials, JWT, 3 roles)
- **Pagos:** Stripe Connect (destination charges, 5% platform fee)
- **UI:** Tailwind CSS 4 + shadcn/ui + GSAP
- **Deploy:** Docker + Dokploy (Traefik) en VPS

## Fases de desarrollo

### Phase 1: Public Site ✅
Sitio publico mobile-first con info de torneos, sedes y contacto.
- Home con hero animado, stats, venue showcase
- Torneos por sede (Metepec/Calimaya) desde BD
- Paginas: Reservar, Escuela, Espacios, Contacto
- SEO basico, meta tags

### Phase 2: Admin Panel + Auth ✅
Panel administrativo con CRUD completo.
- Auth con NextAuth.js v5 (email/password, JWT)
- 3 roles: ADMIN, OPERATOR, CAPTAIN
- Middleware de proteccion de rutas
- CRUD: Torneos, Equipos, Reservas, Espacios Comerciales, Usuarios
- Server Actions con validacion de permisos
- Dialog forms con shadcn/ui

### Phase 3: Tournament Engine ✅
Sistema completo de torneos con fixtures automaticos.
- Motor round-robin (soporta equipos impares con bye)
- Generacion automatica de fixtures por grupo
- Registro de resultados con calculo automatico de standings
- Eventos de partido: goles, tarjetas, sanciones
- Tabla de posiciones: 3/1/0 pts, desempate por GD
- Pagina publica de detalle de torneo con calendario y posiciones
- Portal de capitan: gestion de roster, formacion tactica, logos
- Top goleadores y resumen de tarjetas

### Phase 4: Payments (Stripe Connect) ✅
Pagos en linea con modelo de comision de plataforma.
- **Modelo:** Prosuite = plataforma, Soccerville = cuenta Express conectada
- **Comision:** 5% application fee via destination charges
- Checkout Sessions con tarjeta + OXXO
- Webhook handler para confirmacion asincrona
- Admin: conexion de cuentas por sede, dashboard de revenue
- Admin: historial de pagos, marcar pagos en efectivo
- PayButton reutilizable para cualquier flujo de pago
- Paginas de exito/cancelacion de pago

### Phase 5: Bookings System ✅
Sistema de reservas online con disponibilidad en tiempo real.
- Wizard interactivo: sede → calendario → horario → datos → pago
- Calendario con navegacion por mes
- Disponibilidad en tiempo real (fetch de slots ocupados)
- Deteccion de conflictos server-side (sin doble reserva)
- Pago con Stripe (si sede conectada) o confirmacion por WhatsApp
- API: GET /api/bookings (disponibilidad), POST (reservar)

### Phase 6: Polish & Extras (pendiente)
- Notificaciones WhatsApp (API o links directos)
- PWA setup
- Reportes financieros en admin
- Optimizacion de performance

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/          # Sitio publico (sin auth)
│   │   ├── page.tsx       # Home
│   │   ├── torneos/       # Torneos por sede + detalle
│   │   ├── reservar/      # Reserva online
│   │   ├── escuela/       # Escuela de futbol
│   │   ├── espacios/      # Foodtrucks, publicidad
│   │   ├── contacto/      # Contacto
│   │   └── pago/          # Exito/cancelacion de pago
│   ├── (auth)/
│   │   ├── login/         # Login (admin + capitan)
│   │   └── mi-equipo/     # Portal del capitan
│   ├── admin/             # Panel administrativo
│   │   ├── dashboard/     # Metricas
│   │   ├── torneos/       # CRUD + detalle con fixtures
│   │   ├── equipos/       # CRUD equipos
│   │   ├── reservas/      # CRUD reservas
│   │   ├── espacios/      # CRUD espacios comerciales
│   │   ├── pagos/         # Historial de pagos
│   │   ├── usuarios/      # CRUD usuarios
│   │   ├── notificaciones/# Sistema de notificaciones
│   │   └── stripe/        # Configuracion Stripe Connect
│   └── api/
│       ├── auth/          # NextAuth endpoints
│       ├── bookings/      # Reservas publicas
│       └── stripe/        # Connect, Checkout, Webhook
├── components/
│   ├── ui/                # shadcn/ui (17 componentes)
│   ├── admin/             # Componentes del panel admin
│   ├── captain/           # Portal del capitan
│   ├── public/            # Sitio publico
│   └── shared/            # Compartidos (PayButton, WhatsApp, etc)
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   ├── auth.ts            # NextAuth config
│   ├── stripe.ts          # Stripe Connect client + fee calc
│   ├── fixtures.ts        # Motor de fixtures + standings
│   ├── venues.ts          # Datos de sedes
│   └── utils.ts           # cn() helper
└── generated/prisma/      # Prisma Client generado
```

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Levantar PostgreSQL
docker compose up -d db

# Sincronizar schema y sembrar datos
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# Iniciar servidor de desarrollo
npm run dev
```

## Deploy (VPS con Dokploy)

```bash
# En el VPS (/opt/soccerville)
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build

# Sincronizar DB (desde contenedor temporal)
docker run --rm --network soccerville_soccerville-net \
  -v /opt/soccerville:/app -w /app \
  -e "DATABASE_URL=postgresql://user:pass@db:5432/soccerville" \
  node:20-alpine sh -c "npx prisma generate && npx prisma db push"
```

## Credenciales de acceso

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@soccerville.mx | admin123 |
| Operador Metepec | metepec@soccerville.mx | operator123 |
| Operador Calimaya | calimaya@soccerville.mx | operator123 |

## Variables de entorno (produccion)

```
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_URL=https://soccerville.prosuite.pro
AUTH_TRUST_HOST=true
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

Desarrollado por [Prosuite](https://prosuite.pro) con [Claude Code](https://claude.ai/claude-code).
