import type { Product } from "../types/product";

export function ProductCard({ product }: { product: Product }) {
    const price = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(product.priceCents / 100);

    const message = 
    `olá! Quero pedir ${product.name}, no valor de ${price}.` +
    `Código: ${product.id}. Pode confirmar a disponibilidade?`;

    const whatsappUrl  =
    "https://wa.me/5567992133468?text=" + 
    encodeURIComponent(message);

    return (
        <article className="product-card">
            <img className="product-image" src={product.imageUrl} alt={product.name} />

            <div className="product-content">
                <span className="product-category">
                    {product.category}
                </span>

                <h2>{product.name}</h2>
                <p>{product.description}</p>

                <strong className="product-price">{price}</strong>

                <a 
                    className="product-button" 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    >
                      Pedir pelo WhatsApp  
                    </a>
            </div>
        </article>
    );

}