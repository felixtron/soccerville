import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "uploads", "logos");

// Map MIME type to safe extension — SVG excluded to prevent stored XSS
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
    const file = formData.get("logo") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    // Validate MIME type — derive extension from MIME, not filename
    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Solo se permiten imagenes JPG, PNG o WebP" },
        { status: 400 }
      );
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Maximo 2MB" }, { status: 400 });
    }

    const filename = `${(session.user as any).id}-${Date.now()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(join(UPLOAD_DIR, filename), bytes);

    const url = `/api/uploads/logos/${filename}`;
    return NextResponse.json({ url });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
