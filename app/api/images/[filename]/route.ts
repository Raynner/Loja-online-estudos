import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

type ImageRouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(
  _request: Request,
  { params }: ImageRouteContext
) {
  const { filename } = await params;

  const validFilename =
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;

  if (!validFilename.test(filename)) {
    return new Response("Imagem não encontrada.", { status: 404 });
  }

  try {
    const filePath = path.join(/* turbopackIgnore: true */
      process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"),
      filename
    );

    const bytes = await readFile(/* turbopackIgnore: true */ filePath);

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return new Response("Imagem não encontrada.", { status: 404 });
    }

    console.error("Erro ao ler imagem:", error);

    return new Response("Imagem indisponível.", { status: 500 });
  }
}