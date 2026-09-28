import { redirect } from "next/navigation";
import { LoginForm } from "@/src/components/LoginForm";
import { getAdminSession } from "@/src/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LoginPage() {
    const admin = await getAdminSession();

    if (admin) {
        redirect("/admin");
    }

    return (
        <main className="store-page">
            <section className="login-card">
                <h1>Área da loja</h1>
                <p>Entre com sua conta para administrar os produtos.</p>

                <LoginForm />

                <a className="login-back" href="/">
                    Voltar para a loja
                </a>
            </section>
        </main>
    );
}