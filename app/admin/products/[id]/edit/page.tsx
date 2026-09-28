import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "../../../../../src/lib/session";
import { getAdminProduct } from "../../../../../src/lib/admin-products";
import { ProductForm } from "../../../../../src/components/ProductForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/login");
  }

  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) {
    notFound();
  }

  const productId = Number(id);

  if (
    !Number.isSafeInteger(productId) ||
    productId > 4294967295
  ) {
    notFound();
  }

  const product = await getAdminProduct(productId);

  if (!product) {
    notFound();
  }

  return (
    <main className="store-page">
      <header className="store-header">
        <h1>Editar produto</h1>
        <p>Atualize os detalhes do presente.</p>
      </header>

      <div className="admin-toolbar">
        <a href="/admin">← Voltar para o painel</a>
      </div>

      <div className="admin-container">
        <ProductForm key={product.id} product={product} />
      </div>
    </main>
  );
}