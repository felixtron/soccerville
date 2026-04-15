import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "uploads", "player-photos");

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("photo") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Solo se permiten imagenes JPG, PNG o WebP" },
        { status: 400 }
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Maximo 5MB" }, { status: 400 });
    }

    const filename = `player-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(join(UPLOAD_DIR, filename), bytes);

    const url = `/api/uploads/player-photos/${filename}`;
    return NextResponse.json({ url });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
