"use client";

import { useState } from "react";
import { Product } from "../types/product";
import { ProductCard } from "./ProductCard";


type CategoryFilter = "Todos" | Product["category"];

const categories: CategoryFilter[] = [
    "Todos",
    "Cestas",
    "Buquês",
];

type ProductCatalogProps = {
    products: Product[];
};

export function ProductCatalog({ products }: ProductCatalogProps) {
    const [selectedCategory, setSelectedCategory] =
        useState<CategoryFilter>("Todos");

    const filteredProducts = products.filter((product) => {
        return (
            selectedCategory === "Todos" ||
            product.category === selectedCategory
        );
    });

    return (
        <>
            <div className="category-filters" role="group" aria-label="Filtrar produtos">
                {categories.map((category) => (
                    <button
                        key={category}
                        type="button"
                        className={
                            selectedCategory === category
                            ? "category-button active"
                            : "category-button"
                        }
                        aria-pressed={selectedCategory === category}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <p className="product-count" role="status">
                {filteredProducts.length} produto(s) encontrado(s)
            </p>

            <section className="product-grid" aria-label="Produtos">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </section>

            {filteredProducts.length === 0 && (
                <p className="catalog-empty">
                    Nenhum produto disponível nesta categoria.
                </p>
            )}
        </>
    );
}