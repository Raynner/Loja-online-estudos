import { listProducts } from "@/src/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const products = await listProducts();

        return Response.json(products, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Erro ao consultar os produtos:", error);

        return Response.json(
            {
                 error: "Não foi possível carregar os produtos."
            },
            {
                status: 503,
                headers: {
                    "Cache-Control": "no-store",
            },
        }
        );

    }
    
}