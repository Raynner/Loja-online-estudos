"use client";

import { useActionState } from "react";
import { setProductStatus } from "../actions/products";


type ProductStatusButtonProps = {
    id: number;
    active: number;
};

export function ProductStatusButton ({
    id,
    active,
}: ProductStatusButtonProps) {
    const [state, formAction, pending] = useActionState(
        setProductStatus,
        {
            error: "",
            success: "",
        }
    );

    const isActive = active === 1;
    const nextActive = isActive ? "0" : "1";

    return (
        <form action={formAction} className="product-status-form">
            <input type="hidden" name="id" value={id} />

            <input
                 type="hidden"
                 name="active"
                 value={nextActive}
            />

            <button
                type="submit"
                className="category-button"
                disabled={pending}
            >
                {pending
                    ? "Salvando..."
                    : isActive
                        ? "Desativar"
                        : "Reativar"
                }
            </button>

            {state.error && (
                <p className="login-error" role="alert">
                    {state.error}
                </p>
            )}

            {state.success && (
                <p className="admin-success" role="status">
                    {state.success}
                </p>
            )}
        </form>
    );
}