import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, MapPin, Clock, Users, DollarSign } from "lucide-react";
import { EnrollStudentButton, EnrollmentActions } from "@/components/admin/school-enrollment";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: "Activo", class: "bg-emerald-100 text-emerald-700" },
  INACTIVE: { label: "Inactivo", class: "bg-gray-100 text-gray-600" },
  SUSPENDED: { label: "Suspendido", class: "bg-red-100 text-red-700" },
};

export default async function EscuelaAdmin() {
  const programs = await prisma.program.findMany({
    include: {
      venue: { select: { name: true } },
      enrollments: {
        include: {
          student: { select: { email: true, phone: true } },
        },
        orderBy: { enrolledAt: "desc" },
      },
      _count: { select: { enrollments: true } },
    },
    orderBy: { name: "asc" },
  });

  const totalStudents = programs.reduce((s, p) => s + p._count.enrollments, 0);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
            Escuela
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {programs.length} programas &middot; {totalStudents} alumnos
          </p>
        </div>
      </div>

      {programs.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No hay programas registrados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {programs.map((program) => (
            <Card key={program.id} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-xl uppercase tracking-tight">
                      {program.name}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {program.venue.name.replace("Soccerville ", "")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {program.schedule}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {program._count.enrollments}/{program.maxStudents} alumnos
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${program.monthlyFee}/mes
                      </span>
                    </div>
                  </div>
                  <EnrollStudentButton programId={program.id} programName={program.name} />
                </div>
              </CardHeader>
              <CardContent>
                {program.enrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No hay alumnos inscritos.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                          <th className="p-2 text-left">Alumno</th>
                          <th className="p-2 text-left">Edad</th>
                          <th className="p-2 text-left">Padre/Tutor</th>
                          <th className="p-2 text-left">Contacto</th>
                          <th className="p-2 text-center">Estado</th>
                          <th className="p-2 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {program.enrollments.map((e) => {
                          const st = statusLabels[e.status] ?? statusLabels.ACTIVE;
                          return (
                            <tr key={e.id} className="border-b hover:bg-[#fafafa] transition-colors">
                              <td className="p-2">
                                <div>
                                  <p className="font-medium">{e.studentName}</p>
                                  <p className="text-xs text-muted-foreground">{e.student.email}</p>
                                </div>
                              </td>
                              <td className="p-2 text-muted-foreground">
                                {e.studentAge ? `${e.studentAge} anos` : "—"}
                              </td>
                              <td className="p-2 text-muted-foreground">
                                {e.parentName || "—"}
                              </td>
                              <td className="p-2 text-muted-foreground text-xs">
                                {e.parentPhone || e.student.phone || "—"}
                              </td>
                              <td className="p-2 text-center">
                                <Badge className={`text-[10px] ${st.class}`}>{st.label}</Badge>
                              </td>
                              <td className="p-2 text-center">
                                <EnrollmentActions enrollmentId={e.id} currentStatus={e.status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
