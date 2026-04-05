# Soccerville — Guia de Uso

> Plataforma de gestion para canchas de futbol 7 con torneos, reservas, escuela y espacios comerciales.
> Produccion: https://soccerville.prosuite.pro

---

## Accesos Demo

| Rol | Email | Contrasena | URL |
|-----|-------|-----------|-----|
| Admin | admin@soccerville.mx | admin123 | /login?mode=admin |
| Operador Metepec | metepec@soccerville.mx | admin123 | /login?mode=admin |
| Operador Calimaya | calimaya@soccerville.mx | admin123 | /login?mode=admin |
| Capitan (Mineiro) | captain.mineiro@soccerville.mx | equipo123 | /login |
| Capitan (Townie) | captain.townie@soccerville.mx | equipo123 | /login |
| Alumno (Santiago) | santiago.lopez@soccerville.mx | escuela123 | /login |
| Alumno (Sofia) | sofia.martinez@soccerville.mx | escuela123 | /login |

---

## 1. Panel de Administrador

**Acceso:** /login?mode=admin → /admin/dashboard

### 1.1 Dashboard
Vista general con contadores de torneos, equipos, reservas y espacios rentados. Accesos rapidos a torneos abiertos y reservas recientes.

### 1.2 Torneos (/admin/torneos)

**Flujo completo de un torneo:**

1. **Crear torneo** — Nombre, sede, categoria (Varonil/Femenil/Veteranos/Mixto), horario, max equipos, cuota de inscripcion, arbitraje (por partido en efectivo o fijo).
2. **Inscribir equipos** — El admin inscribe equipos manualmente, o los capitanes se auto-inscriben y pagan con Stripe desde su portal.
3. **Generar fixtures** — Cuando hay suficientes equipos, click en "Generar Fixtures" crea automaticamente el calendario round-robin.
4. **Registrar resultados** — En la tab "Partidos", click en un partido abre el panel lateral donde se anota el score y eventos (goles, tarjetas, sanciones).
5. **Finalizar** — Cambiar status a "Finalizado" cuando termine el torneo.

**Barra de progreso:** 4 pasos visuales (Equipos → Fixtures → Resultados → Fin) muestran en que etapa esta cada torneo.

**Filtros:** Buscar por nombre, filtrar por estado (Abierto/Lleno/En curso/Finalizado) y por sede.

### 1.3 Equipos (/admin/equipos)
- Crear equipo (genera cuenta de capitan automaticamente + envia email de bienvenida).
- Editar nombre del equipo (boton de lapiz).
- Ver jugadores y torneos por equipo.
- Eliminar equipo.

### 1.4 Escuela (/admin/escuela)
- Ver programas (Red Diablos, Sirenas FC) con alumnos inscritos.
- **Inscribir alumno:** nombre, edad, padre/tutor, email, contrasena → crea cuenta STUDENT + envia email.
- Suspender/reactivar/eliminar inscripciones.

### 1.5 Reservas (/admin/reservas)
- Ver todas las reservas con estado (Pendiente/Confirmada/Cancelada).
- Crear/editar/eliminar reservas manuales.

### 1.6 Espacios Comerciales (/admin/espacios)
- Ver espacios con estado (Disponible/Rentado).
- Editar datos del inquilino.
- **Suscripcion Stripe:** Para espacios rentados con email, click en "Suscripcion · $X/mes" crea cobro recurrente mensual con 5% de comision Prosuite.

### 1.7 Pagos (/admin/pagos)
- Resumen: total cobrado, comision Prosuite (5%), pagos en linea vs efectivo.
- **Filtros:** por estado, rubro (Inscripcion/Arbitraje/Reserva/Foodtruck/Publicidad/Escuela), sede.
- **Buscador:** por descripcion, nombre, monto.
- **Registrar pago en efectivo:** Boton verde "+ Pago en Efectivo" con selector de rubro, monto, sede y descripcion.

### 1.8 Usuarios (/admin/usuarios)
- Lista de todos los usuarios con filtros por rol, sede, torneo.
- Buscador por nombre, email, telefono, equipo.
- **Editar usuario** — cambiar nombre, email, rol, sede.
- **Reset contrasena** — boton de llave para cambiar contrasena de cualquier usuario.
- **Roles:** Admin (rojo), Operador (azul), Capitan (verde), Alumno (ambar).

### 1.9 Notificaciones (/admin/notificaciones)
Enviar avisos a diferentes audiencias:

| Audiencia | Quien lo ve |
|-----------|-------------|
| Todos | Todos los capitanes y alumnos |
| Por sede | Equipos de una sede especifica |
| Por torneo | Equipos inscritos en un torneo |
| Equipo especifico | Solo un capitan |
| Escuela / Programa | Alumnos de un programa |

Cada notificacion muestra contador de lecturas. Se puede eliminar.

### 1.10 Stripe (/admin/stripe)
- Ver estado de conexion por sede (Activa/Pendiente/No conectada).
- **Conectar sede:** Inicia onboarding de Stripe Express para la sede.
- Metricas: volumen total, comision Prosuite, pagos completados.
- Link al dashboard de Stripe Express por sede.

---

## 2. Portal del Capitan

**Acceso:** /login → /mi-equipo

### 2.1 Dashboard del equipo
- **Logo del equipo** — Click en el circulo para subir imagen (JPG/PNG/WebP, max 2MB).
- **Avisos** — Notificaciones del admin con indicador de no leidas y boton de marcar como leida.
- **Posiciones** — Puntos, victorias, empates, derrotas, diferencia de goles por torneo activo.

### 2.2 Plantilla (Roster)
- Agregar jugador: nombre, numero, posicion (Portero/Defensa/Medio/Delantero).
- Editar jugador inline.
- Eliminar jugador con confirmacion.
- Stats por jugador: goles, tarjetas amarillas, rojas (solo lectura).

### 2.3 Formacion
Media cancha interactiva con 5 formaciones de futbol 7:

| Formacion | Estilo |
|-----------|--------|
| 1-2-3-1 | Equilibrada — control de medio campo |
| 1-3-2-1 | Defensiva — tres defensas |
| 1-2-2-2 | Ofensiva — dos delanteros |
| 1-3-1-2 | Contraataque — defensa solida + puntas rapidas |
| 1-2-1-2-1 | Diamante — medio creativo |

Los jugadores se asignan automaticamente por posicion. Animacion GSAP al cambiar formacion.

### 2.4 Partidos
- **Proximos partidos** con fecha, hora, rival.
- **Resultados recientes** con indicador G/E/P y score.
- Links a la pagina publica del torneo.

### 2.5 Inscribirse a torneo (/mi-equipo/inscribirse)
- **Mis Inscripciones:** torneos inscritos con status de pago (Pagado/Pendiente).
- **Torneos Disponibles:** torneos abiertos, cuota, horario, lugares restantes.
- **Flujo:** Click "Inscribirme · $X" → Enrolla al equipo → Stripe Checkout → Pago → Badge "Pagado".
- Cancelar pago regresa a la pagina de inscripcion.

### 2.6 Celebracion de Campeon
Cuando un equipo es campeon (1er lugar en torneo FINISHED), al iniciar sesion se muestra una animacion fullscreen con:
- Confeti dorado (canvas-confetti)
- Logo del equipo con anillo dorado
- Texto "Felicidades Campeon!"
- Branding Soccerville
- Se muestra 1 vez por sesion.

---

## 3. Portal del Alumno

**Acceso:** /login → /mi-escuela

### 3.1 Mis Programas
- Programas inscritos con horario, sede, cuota mensual, fecha de inscripcion.
- Status: Activo / Inactivo / Suspendido.

### 3.2 Pagar Mensualidad
- Boton "Pagar Mensualidad · $X" con Stripe Checkout.
- Solo disponible para inscripciones activas en sedes con Stripe habilitado.

### 3.3 Historial de Pagos
- Ultimos 10 pagos con monto, fecha, status.

### 3.4 Avisos
- Notificaciones generales (ALL) y del programa especifico (SCHOOL).
- Marcar como leida.

---

## 4. Sitio Publico

### 4.1 Pagina principal (/)
Hero, servicios, estadisticas, sedes, reviews, Instagram, CTA.

### 4.2 Torneos por sede (/torneos/metepec, /torneos/calimaya)
Torneos organizados por status: En Curso (con mini standings), Inscripciones Abiertas (con WhatsApp CTA), Llenos, Finalizados.

### 4.3 Detalle de torneo (/torneos/[sede]/[slug])
4 tabs: Calendario (rol completo o por equipo, filtro por grupo), Posiciones (con logos), Bota de Oro, Amonestaciones.

### 4.4 Perfil de equipo (/torneos/.../equipo/[teamId])
Logo, posiciones, forma (ultimos 5), plantilla con stats, ultimos partidos con eventos, proximos partidos.

### 4.5 Reservar cancha (/reservar)
Wizard de 5 pasos:
1. Seleccionar sede
2. Seleccionar fecha (calendario)
3. Seleccionar hora (slots 8:00-23:00, bloqueados si ocupados)
4. Datos del cliente
5. Confirmar: pagar con tarjeta o confirmar por WhatsApp

### 4.6 Escuela (/escuela)
Programas disponibles con horarios y WhatsApp para inscripcion.

### 4.7 Espacios (/espacios)
Tipos de espacios (Foodtruck, Publicidad, Eventos) con precios y beneficios.

### 4.8 Contacto (/contacto)
Datos de ambas sedes con mapa de Google y link de navegacion.

---

## 5. Modelo de Negocio — Stripe Connect

```
Cliente paga $1,000 (inscripcion torneo)
  → Stripe cobra 3.6% (~$36)
  → Prosuite recibe 5% ($50)
  → Soccerville recibe $914 (91.4%)
```

**Tipos de cobro:**
- **Pagos unicos:** Inscripcion a torneo, reserva de cancha, mensualidad escuela.
- **Suscripciones:** Espacios comerciales (cobro recurrente mensual).
- **Efectivo:** El admin registra pagos en efectivo desde /admin/pagos.

**Configuracion:**
1. Crear cuenta Stripe (Prosuite como plataforma).
2. En /admin/stripe: conectar cada sede con Stripe Express.
3. La sede completa onboarding (datos bancarios, verificacion).
4. Los pagos fluyen automaticamente con 5% de comision.

---

## 6. Seguridad

- Autenticacion: NextAuth.js v5 con JWT.
- 4 roles con acceso restringido (ADMIN, OPERATOR, CAPTAIN, STUDENT).
- Capitanes no pueden acceder al panel admin.
- Montos validados server-side (no confia en el cliente).
- Upload: solo JPG/PNG/WebP, max 2MB, extension derivada del MIME.
- Email: variables HTML escapadas contra XSS.
- Enrollment: transaccion atomica contra race conditions.
- Webhook: verificacion de firma Stripe + idempotencia.
- Contrasenas: bcrypt con salt 12.
- Toggle de visibilidad en todos los campos de contrasena.

---

## 7. Stack Tecnico

| Componente | Tecnologia |
|-----------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma 7 con PrismaPg adapter |
| Auth | NextAuth.js v5 (JWT) |
| Pagos | Stripe Connect (Express accounts) |
| UI | Tailwind CSS 4, Base UI, Lucide icons |
| Animaciones | GSAP, canvas-confetti |
| Email | Nodemailer (SMTP Gmail) |
| Deploy | Docker + Dokploy + Traefik (VPS) |
| Hosting | prosuite.pro VPS |
