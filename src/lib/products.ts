import "server-only";

import type { RowDataPacket } from "mysql2";
import { Product } from "../types/product";
import { db } from "./db"


interface ProductRow extends RowDataPacket, Product {}

export async function listProducts(): Promise<Product[]> {
    const [rows] = await db.execute<ProductRow[]>(
        `SELECT
       id,
       name,
       description,
       price_cents AS priceCents,
       category,
       image_url AS imageUrl
     FROM products
     WHERE active = ?
     ORDER BY id DESC`,
    [1]
    );

    return rows;
}