import "server-only";

import type { RowDataPacket } from "mysql2";
import type { Product } from "../types/product";
import { db } from "./db";
import { getAdminSession } from "./session";

interface AdminProductRow extends RowDataPacket, Product {
    active: number;
}

export async function listAdminProducts() {
    const admin = await getAdminSession();

    if (!admin) {
        throw new Error ("Acesso não autorizado.");
    }

    const [rows] = await db.execute<AdminProductRow[]>(
        `SELECT
            id,
            name,
            description,
            price_cents AS priceCents,
            category,
            image_url AS imageUrl,
            active
            FROM products
            ORDER BY id DESC`
    );

    return rows;
}

export async function getAdminProduct(id: number) {
  const admin = await getAdminSession();

  if (!admin) {
    throw new Error("Acesso não autorizado.");
  }

  const [rows] = await db.execute<AdminProductRow[]>(
    `SELECT
       id,
       name,
       description,
       price_cents AS priceCents,
       category,
       image_url AS imageUrl,
       active
     FROM products
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}