import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "uploads", "logos");

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("logo") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo invalido" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Maximo 2MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "png";
    const filename = `${(session.user as any).id}-${Date.now()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(join(UPLOAD_DIR, filename), bytes);

    // Serve via API route instead of /public
    const url = `/api/uploads/logos/${filename}`;
    return NextResponse.json({ url });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
