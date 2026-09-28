import { getAdminSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { logout } from "@/src/actions/auth";
import { listAdminProducts } from "@/src/lib/admin-products";
import { ProductForm } from "@/src/components/ProductForm";
import { ProductStatusButton } from "@/src/components/ProductStatusButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const admin = await getAdminSession();

    if(!admin) {
        redirect("/login");
    }

    const products = await listAdminProducts();

    const currency = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    return (
        <main className="store-page">
            <header className="store-header">
                <h1>Área administrativa</h1>
                <p>Olá, {admin.name}.</p>
            </header>

            <div className="admin-toolbar">
                <a href="/">Ver catálogo</a>

                <form action={logout}>
                    <button type="submit" className="category-button">
                        Sair
                    </button>
                </form>
            </div>

            <div className="admin-container">
                <ProductForm />

                <section className="admin-products">
                    <h2>Produtos cadastrados</h2>

                    {products.length === 0 ? (
                        <p>Nenhum produto cadastrado.</p>
                    ) : (
                        <ul className="admin-product-list">
                            {products.map((product) => (
                                <li key={product.id}>
                                    <div>
                                        <h3>{product.name}</h3>

                                        <p>
                                            {product.category} ·{" "}
                                            {currency.format(product.priceCents / 100)}
                                        </p>
                                    </div>

                                    <div className="admin-product-actions">
                                        <span className={
                                            product.active === 1
                                            ? "product-status active"
                                            : "product-status inactive"
                                        }
                                        >
                                            {product.active === 1 ? "Ativo" : "Inativo"}
                                        </span>

                                        <a
                                            href={`/admin/products/${product.id}/edit`}
                                            className="category-button"
                                        >
                                            Editar
                                        </a>

                                        <ProductStatusButton
                                            id={product.id}
                                            active={product.active}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}