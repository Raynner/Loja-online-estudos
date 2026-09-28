export type Product = {
    id: number;
    name: string;
    description: string;
    priceCents: number;
    category: 'Cestas' | 'Buquês';
    imageUrl: string;
};