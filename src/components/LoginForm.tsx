"use client";

import { useActionState } from "react";
import { login } from "../actions/auth";

export function LoginForm() {
    const [state, formAction, pending] = useActionState(
        login,
        { error: "" }
    );

    return (
        <form action={formAction} className="login-form">
            <label htmlFor="email">E-mail</label>

            <input
            id="email"
            name="email" 
            type="email" 
            autoCapitalize="username"
            maxLength={254}
            required
            />

            <label htmlFor="password">Senha</label>

            <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            />

            {state.error && (
                <p className="login-error" role="alert">
                    {state.error}
                </p>
            )}

            <button
            type="submit"
            className="product-button"
            disabled={pending}
            >
                {pending ? "Entrando..." : "Entrar"}
            </button>
        </form>
    );
}