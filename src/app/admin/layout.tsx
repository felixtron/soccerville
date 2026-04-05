import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session?.user) redirect("/login?mode=admin");
  if (role === "CAPTAIN") redirect("/mi-equipo");

  return (
    <SessionProvider>
      <div className="min-h-screen bg-[#f5f5f5]">
        <AdminSidebar />
        <main className="lg:pl-64 transition-all duration-300">
          <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 md:py-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
