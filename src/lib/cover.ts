import "server-only";
import { readFile, mkdir, writeFile, rename, access } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
export const DEFAULT_COVER = "/images/bouquet.svg";
const imagePattern = /^\/api\/images\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;
function directory() { return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"); }
export async function getCover(): Promise<string> {
 try { const settings = JSON.parse(await readFile(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ directory(), "cover.json"), "utf8"));
 return typeof settings.imageUrl === "string" && imagePattern.test(settings.imageUrl) ? settings.imageUrl : DEFAULT_COVER;
 } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("Erro ao ler capa:", error); return DEFAULT_COVER; }
}
export async function writeCover(imageUrl: string) {
 if (imageUrl !== DEFAULT_COVER && !imagePattern.test(imageUrl)) throw new Error("Imagem inválida.");
 const folder = directory();
 if (imageUrl !== DEFAULT_COVER) await access(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ folder, path.basename(imageUrl)));
 await mkdir(folder, {recursive:true});
 const temporary = path.join(folder, "cover-" + randomUUID() + ".tmp");
 await writeFile(temporary, JSON.stringify({imageUrl}), {flag:"wx"});
 await rename(temporary, path.join(folder,"cover.json"));
}
