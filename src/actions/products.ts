"use server";

import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { getAdminSession } from "../lib/session";
import type { ResultSetHeader } from "mysql2";
import { getAdminProduct } from "../lib/admin-products";

type ProductValues = {
    name: string;
    description: string;
    price: string;
    category: string;
    imageUrl: string;
}

export type ProductFormState = {
    error: string;
    success: string;
    values: ProductValues;
}

export async function createProduct(
    _previousState: ProductFormState,
    formData: FormData
): Promise<ProductFormState> {
    function readText(field: string) {
        const value = formData.get(field);
        return typeof value === "string" ? value.trim() : "";
    }

    const values: ProductValues = {
        name: readText("name"),
        description: readText("description"),
        price: readText("price"),
        category: readText("category"),
        imageUrl: readText("imageUrl"),
    };

    function fail(message: string): ProductFormState {
        return {
            error: message,
            success: "",
            values,
        };
    }

    try {
        const admin = await getAdminSession();

        if (!admin) {
            return fail("Sua sessão expirou. Entre novamente.");
        }

        if (!values.name || values.name.length > 100) {
            return fail("Informe um nome com até 100 caracteres.");
        }

        if (
            !values.description ||
            values.description.length > 2000
        ) {
            return fail("Informe uma descrição com até 2.000 caracteres.");
        }

        const normalizedPrice = values.price.replace(",", ".");

        if (!/^\d{1,6}(\.\d{1,2})?$/.test(normalizedPrice)) {
            return fail("Informe um preço válido, como 169,90.");
        }

        const [whole, decimal = ""] = normalizedPrice.split(".");

        const priceCents =
        Number(whole) * 100 +
        Number(decimal.padEnd(2, "0"));

        if (priceCents <= 0) {
            return fail("O preço deve ser maior que zero.")
        }

        if (!["Cestas", "Buquês"].includes(values.category)) {
            return fail("Selecione uma categoria válida.");
        }

        const isExistingImage =
            /^\/images\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(
                values.imageUrl
        );

        const isUploadedImage =
            /^\/api\/images\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/.test(
                values.imageUrl
        );

        if (
            values.imageUrl.length > 500 ||
            (!isExistingImage && !isUploadedImage)
            ) {
            return fail("Selecione uma imagem válida para o produto.");
        }

            await db.execute(
                `INSERT INTO products (
                name,
                description,
                price_cents,
                category,
                image_url,
                active
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                values.name,
                values.description,
                priceCents,
                values.category,
                values.imageUrl,
                1,
            ]
        );
    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);

        return fail("Não foi possível salvar o produto. Tente novamente.");
    }

    revalidatePath("/admin");

    return {
        error: "",
        success:"Produto cadastrado com sucesso!",
        values: {
            name: "",
            description: "",
            price: "",
            category: "Cestas",
            imageUrl: "",
        },
    };
}

type ProductStatusState = {
    error : string;
    success: string;
};

export async function setProductStatus(
    _previousState: ProductStatusState,
    formData: FormData
): Promise<ProductStatusState>{
    const idValue = formData.get("id");
    const activeValue = formData.get("active");

    if (
        typeof idValue !== "string" ||
        !/^[1-9]\d*$/.test(idValue) ||
        (activeValue !== "0" && activeValue !== "1")
    ) {
        return {
            error: "Dados do produto inválidos.",
            success: "",
        }
    }
    
    const id = Number(idValue);
    const active = Number(activeValue);

    if (!Number.isSafeInteger(id) || id > 4294967295) {
        return {
            error: "Identificador do produto inválido.",
            success: "",
        };
    }

    let changed = false;

    try {
        const admin = await getAdminSession();

        if (!admin) {
            return {
                error: "Sua sessão expirou. Entre novamente.",
                success: "",
            };
        }

        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE products
                SET active = ?
                WHERE id = ?
                    AND active = ?`,
            [active, id, active === 1 ? 0 : 1]
        );

        changed = result.affectedRows > 0;
    } catch (error) {
        console.error("Erro ao alterar status do produto:", error);

        return {
            error: "Não foi possível alterar o produto. Tente novamente.",
            success: "",
        };
    }

    revalidatePath("/admin");

    if (!changed) {
        return {
            error: "O produto já foi alterado ou não está mais disponível. Confira a lista atualizada.",
            success: "",
        }
    }

    return {
        error: "",
        success:
         active === 1
         ? "Produto reativado."
         : "Produto desativado.",
    }
}

export async function updateProduct(
  id: number,
  _previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  function readText(field: string) {
    const value = formData.get(field);
    return typeof value === "string" ? value.trim() : "";
  }

  const values: ProductValues = {
    name: readText("name"),
    description: readText("description"),
    price: readText("price"),
    category: readText("category"),
    imageUrl: readText("imageUrl"),
  };

  function fail(message: string): ProductFormState {
    return {
      error: message,
      success: "",
      values,
    };
  }

  try {
    const admin = await getAdminSession();

    if (!admin) {
      return fail("Sua sessão expirou. Entre novamente.");
    }

    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      id > 4294967295
    ) {
      return fail("Identificador do produto inválido.");
    }

    if (!values.name || values.name.length > 100) {
      return fail("Informe um nome com até 100 caracteres.");
    }

    if (
      !values.description ||
      values.description.length > 2000
    ) {
      return fail("Informe uma descrição com até 2.000 caracteres.");
    }

    const normalizedPrice = values.price.replace(",", ".");

    if (!/^\d{1,6}(\.\d{1,2})?$/.test(normalizedPrice)) {
      return fail("Informe um preço válido, como 169,90.");
    }

    const [whole, decimal = ""] = normalizedPrice.split(".");

    const priceCents =
      Number(whole) * 100 +
      Number(decimal.padEnd(2, "0"));

    if (priceCents <= 0) {
      return fail("O preço deve ser maior que zero.");
    }

    if (!["Cestas", "Buquês"].includes(values.category)) {
      return fail("Selecione uma categoria válida.");
    }

    const isExistingImage =
        /^\/images\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(
        values.imageUrl
    );

    const isUploadedImage =
        /^\/api\/images\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/.test(
        values.imageUrl
    );

    if (
        values.imageUrl.length > 500 ||
        (!isExistingImage && !isUploadedImage)
        ) {
        return fail("Selecione uma imagem válida para o produto.");
    }

    const existing = await getAdminProduct(id);

    if (!existing) {
      return fail("Produto não encontrado.");
    }

    await db.execute(
      `UPDATE products
       SET
         name = ?,
         description = ?,
         price_cents = ?,
         category = ?,
         image_url = ?
       WHERE id = ?`,
      [
        values.name,
        values.description,
        priceCents,
        values.category,
        values.imageUrl,
        id,
      ]
    );
  } catch (error) {
    console.error("Erro ao editar produto:", error);

    return fail(
      "Não foi possível salvar as alterações. Tente novamente."
    );
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/products/${id}/edit`);

  return {
    error: "",
    success: "Produto atualizado com sucesso!",
    values,
  };
}