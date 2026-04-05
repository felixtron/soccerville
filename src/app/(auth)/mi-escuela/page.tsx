import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Clock,
  MapPin,
  LogOut,
  CreditCard,
  CalendarDays,
} from "lucide-react";
import { NotificationsFeed } from "@/components/captain/notifications-feed";
import { SchoolPayButton } from "@/components/student/school-pay-button";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: "Activo", class: "bg-emerald-100 text-emerald-700" },
  INACTIVE: { label: "Inactivo", class: "bg-gray-100 text-gray-600" },
  SUSPENDED: { label: "Suspendido", class: "bg-red-100 text-red-700" },
};

export default async function MiEscuelaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;

  if (role === "ADMIN" || role === "OPERATOR") redirect("/admin/dashboard");
  if (role === "CAPTAIN") redirect("/mi-equipo");

  // Get student enrollments
  const enrollments = await prisma.schoolEnrollment.findMany({
    where: { studentId: userId },
    include: {
      program: {
        include: { venue: { select: { id: true, name: true, slug: true, stripeOnboarded: true } } },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  // Get recent payments
  const payments = await prisma.payment.findMany({
    where: { userId, type: "SCHOOL_FEE" },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      amount: true,
      status: true,
      description: true,
      createdAt: true,
    },
  });

  // Get notifications
  const programIds = enrollments.map((e) => e.programId);
  const rawNotifications = await prisma.notification.findMany({
    where: {
      OR: [
        { audience: "ALL" },
        { audience: "SCHOOL", programId: { in: programIds } },
      ],
    },
    include: {
      author: { select: { name: true } },
      reads: { where: { userId }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const notifications = rawNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    authorName: n.author.name,
    createdAt: n.createdAt.toISOString(),
    isRead: n.reads.length > 0,
  }));

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-5xl px-4 pt-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <Image src="/images/soccerville-w.svg" alt="Soccerville" width={28} height={28} className="h-6 w-6 object-contain" />
            <span className="font-display text-sm uppercase tracking-tight hidden sm:inline">Soccerville</span>
          </Link>
          <form action="/api/auth/signout" method="POST">
            <input type="hidden" name="callbackUrl" value="/" />
            <button className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </form>
        </div>
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-amber-500/20 flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-amber-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">Escuela de Futbol</p>
              <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
                {session.user.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* Notifications */}
        <NotificationsFeed notifications={notifications} />

        {/* Enrollments */}
        {enrollments.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="font-display text-xl uppercase tracking-tight mb-2">Sin inscripciones</h2>
              <p className="text-sm text-muted-foreground">
                No tienes inscripciones activas. Contacta al administrador para inscribirte.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {enrollments.map((e) => {
              const st = statusLabels[e.status] ?? statusLabels.ACTIVE;
              return (
                <Card key={e.id} className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{e.program.name}</CardTitle>
                      <Badge className={st.class}>{st.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {e.program.venue.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {e.program.schedule}
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5" />
                        Mensualidad: ${e.program.monthlyFee.toLocaleString()} MXN
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Inscrito: {new Date(e.enrolledAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                    {e.status === "ACTIVE" && e.program.venue.stripeOnboarded && (
                      <SchoolPayButton
                        programId={e.programId}
                        venueId={e.program.venue.id}
                        amount={e.program.monthlyFee}
                        programName={e.program.name}
                        venueName={e.program.venue.name}
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Payment history */}
        {payments.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Historial de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-[#f5f5f5]">
                    <div>
                      <p className="text-sm font-medium">{p.description || "Mensualidad"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">${p.amount.toLocaleString()}</span>
                      <Badge className={p.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                        {p.status === "COMPLETED" ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
