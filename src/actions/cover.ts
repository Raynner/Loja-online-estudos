"use server";
import { getAdminSession } from "../lib/session";
import { writeCover } from "../lib/cover";
import { revalidatePath } from "next/cache";
export async function saveCover(imageUrl: string): Promise<{error?:string; success?:string}> {
 try {
 if (!await getAdminSession()) return {error:"Sua sessão expirou. Entre novamente."};
 if (typeof imageUrl !== "string") return {error:"Selecione uma imagem válida."};
 await writeCover(imageUrl);
 revalidatePath("/"); revalidatePath("/admin");
 return {success:"Capa atualizada com sucesso."};
 } catch (error) {console.error("Erro ao salvar capa:",error);return {error:"Não foi possível salvar a capa. Tente novamente."};}
}
