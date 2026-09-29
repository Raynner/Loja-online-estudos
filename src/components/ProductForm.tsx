"use client";

import { 
        useActionState,
        type ChangeEvent,
        useEffect,
        useState,
 } from "react";
import { createProduct, updateProduct, type ProductFormState } from "../actions/products";
import type { Product } from "../types/product";

type ProductFormProps = {
    product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
    const initialState: ProductFormState = {
    error: "",
    success: "",
    values: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product
        ? (product.priceCents / 100).toFixed(2)
        : "",
      category: product?.category ?? "Cestas",
      imageUrl: product?.imageUrl ?? "",
    },
  };

  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [state, formAction, pending] = useActionState(
    action,
    initialState
  );

  const [imageUrl, setImageUrl] = useState(
  state.values.imageUrl
);

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    // Sincroniza a imagem com o resultado do cadastro ou da edição.
    useEffect(() => {
    setImageUrl(state.values.imageUrl);
    }, [state]);

    async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
    ) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
        return;
    }

    setUploadError("");

    if (file.size > 5 * 1024 * 1024) {
        setUploadError("Selecione uma imagem de até 5 MB.");
        input.value = "";
        return;
    }

    setUploading(true);

    try {
        const data = new FormData();
        data.append("image", file);

        const response = await fetch("/api/uploads", {
        method: "POST",
        body: data,
        });

        const result = (await response.json()) as {
        imageUrl?: string;
        error?: string;
        };

        if (!response.ok || !result.imageUrl) {
        throw new Error(
            result.error ?? "Não foi possível enviar a imagem."
        );
        }

        setImageUrl(result.imageUrl);
    } catch (error) {
        setUploadError(
        error instanceof Error
            ? error.message
            : "Não foi possível enviar a imagem."
        );
    } finally {
        setUploading(false);
        input.value = "";
    }
    }

    return (
        <form action={formAction} className="admin-form">
            <h2>{product ? "Editar produto" : "Novo produto"}</h2>

            <label htmlFor="product-name">Nome</label>
            <input
                id="product-name"
                name="name"
                maxLength={100}
                defaultValue={state.values.name}
                required
            />

            <label htmlFor="product-description">Descrição</label>
            <textarea
                id="product-description"
                name="description"
                maxLength={2000}
                rows={4}
                defaultValue={state.values.description}
                required
            />

            <label htmlFor="product-price">Preço em reais</label>
            <input 
                id="product-price"
                name="price"
                type="text"
                inputMode="decimal"
                placeholder="169,90"
                maxLength={9}
                defaultValue={state.values.price}
                required
            />

            <label htmlFor="product-category">Categoria</label>
            <select
                id="product-category"
                name="category"
                defaultValue={state.values.category}
            >
                <option value="Cestas">Cestas</option>
                <option value="Buquês">Buquês</option>
            </select>

            <label htmlFor="product-image">Foto do produto</label>

            <input
            id="product-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={uploading || pending}
            />

            <input
            type="hidden"
            name="imageUrl"
            value={imageUrl}
            />

            <p className="admin-help">
            JPG, PNG ou WebP, até 5 MB.
            Depois do envio, salve o produto para aplicar a foto.
            </p>

            {uploading && (
            <p role="status">Enviando imagem…</p>
            )}

            {uploadError && (
            <p className="login-error" role="alert">
                {uploadError}
            </p>
            )}

            {imageUrl && (
            <img
                className="admin-image-preview"
                src={imageUrl}
                alt="Prévia da foto do produto"
                />
            )}

            <p className="admin-help">
                A foto precisa existir na pasta public/images.
                Exemplo: cesta.jpg corresponde a /images/cesta.jpg.
            </p>

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

            <button
                type="submit"
                className="product-button"
                disabled={pending || uploading || !imageUrl}
            >
                {pending ? "Salvando..." : product ? "Salvar alterações" : "Cadastrar produto"}
            </button>
        </form>
    );
}