import { ProductCatalogLoader } from "@/src/components/ProductCatalogLoader";


export default function Home() {
  return (
    <main className="store-page">
      <header className="store-header">
          <h1>Vivi’s Presentes</h1>
          <p>Presentes especiais para quem você ama.</p>
      </header>

      <ProductCatalogLoader />
    </main>
  );
}