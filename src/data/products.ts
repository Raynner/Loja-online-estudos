import type { Product } from "../types/product";

export const products: Product[] = [
    {
        id: 1,
        name: "Doce Paixão",
        description: "Uma cesta de chocolates para surpreender.",
        priceCents: 28590,
        category: "Cestas",
        imageUrl: "/images/cesta.jpg",
    },
    {
        id: 2,
        name: "Amor em Detalhes",
        description: "Uma combinação especial de chocolates e carinho.",
        priceCents: 16990,
        category: "Cestas",
        imageUrl: "/images/cesta.jpg",
    },
    {
        id: 3,
        name: "Buquê Delicado",
        description: "Rosas para transformar o dia de alguém especial.",
        priceCents: 11290,
        category: "Buquês",
        imageUrl: "/images/cesta.jpg",
    },
];