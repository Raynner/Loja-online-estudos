"use client";

import { useEffect, useState } from "react";
import { Product } from "../types/product";
import { ProductCatalog } from "./ProductCatalog";



export function ProductCatalogLoader () {
    const [products , setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadProducts() {
            try {
                const response = await fetch("/api/products", {
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Não foi possível carregar os produtos.");
                }

                const data: Product[] = await response.json();

                if (!controller.signal.aborted) {
                    setProducts(data);
                }
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                console.error("Erro ao carregar catálogo:", error);
                setError (
                    "Não foi possível carregar os produtos. Tente novamente."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadProducts();

        return () => {
            controller.abort();
        };
    }, [attempt]);

    function retry() {
        setError("");
        setLoading(true);
        setAttempt((previous) => previous + 1);
    }

    if (loading) {
        return (
            <p className="catalog-status" role="status">
                Carregando produtos…
            </p>
        );
    }

    if (error) {
        return (
            <div className="catalog-status">
                <p role="alert">{error}</p>

                <button type="button" className="category-button" onClick={retry}>
                    Tentar novamente
                </button>
            </div>
        );
    }
    return <ProductCatalog products={products} />
}