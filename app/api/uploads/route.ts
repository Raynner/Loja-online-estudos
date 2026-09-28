import { randomUUID } from "crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getAdminSession } from "@/src/lib/session";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
    // Nosso formulário deve enviar arquivos da própria origem.
    if (request.headers.get("origin") !== new URL(request.url).origin) {
        return Response.json(
            { error: "Origem da requisição não permitida."},
            { status: 403 }
        );
    }

    try {
        const admin = await getAdminSession();

        if (!admin) {
            return Response.json(
                { error: "Sua sessão expirou. Entre novamente."},
                { status: 401 }
            );
        }

        const contentLength = Number(request.headers.get("content-length") ?? 0);

        if (contentLength > MAX_FILE_SIZE + 100_000) {
            return Response.json(
                { error: "Envie uma imagem de até 5 MB."},
                { status: 413 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("image");

        if (!(file instanceof File) || file.size === 0){
           return Response.json(
                { error: "Selecione uma imagem."},
                { status: 400 }
            ); 
        }

        if (file.size > MAX_FILE_SIZE) {
            return Response.json(
                { error: "A imagem deve ter até 5 MB."},
                { status: 413 }
            );
        }

        const input = Buffer.from(await file.arrayBuffer());

        let output: Buffer;

        try {
            const image = sharp(input, {
                limitInputPixels: 25_000_000,
            });

            const metadata = await image.metadata();

            if (
                !metadata.format ||
                !["jpeg", "png", "webp"].includes(metadata.format) ||
                (metadata.pages ?? 1) > 1
            ) {
                return Response.json(
                    { error: "Use uma imagem JPG, PNG ou WebP sem animação."},
                    { status: 400 }
                ); 
            }

            output = await image
                .rotate()
                .resize({
                    width: 1600,
                    height: 1600,
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality: 85 })
                .toBuffer();
        } catch {
            return Response.json(
                {
                    error: "Imagem inválida ou grande demais em dimensões. Use outra foto.",
                },
                { status: 400 }
            );
        }

        const filename = `${randomUUID()}.webp`;
        const directory = path.join(process.cwd(), "uploads");

        await mkdir (directory, { recursive: true });

        await writeFile (
            path.join(directory, filename),
            output,
            { flag: "wx" }
        );

        return Response.json(
            { imageUrl: `/api/images/${filename}` },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erro no upload", error);

        return Response.json(
            { error: "Não foi possível enviar a imagem. Tente novamente." },
            { status: 500 }
        );
    }
}