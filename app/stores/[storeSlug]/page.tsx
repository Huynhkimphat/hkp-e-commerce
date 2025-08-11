// app/stores/[storeSlug]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/db/db';
import ProductCard from '@/components/shared/product/product-card';

const fetchStoreData = async (slug: string) => {
  return db.store.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          store: true,
        },
      },
    },
  });
};

type StorePageProps = {
  params: {
    storeSlug: string;
  };
};

export default async function StorePage({ params }: StorePageProps) {
  const { storeSlug } = await params;
  const storeData = await fetchStoreData(storeSlug);

  if (!storeData) {
    notFound();
  }

  // Transform products to match ProductWithStore type (convert Decimal to string)
  const transformedProducts = storeData.products.map((product) => ({
    ...product,
    price: product.price.toString(),
    rating: product.rating.toString(),
    store: product.store ? { name: product.store.name } : null,
  }));

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{storeData.name}</h1>
        <p className="text-gray-500 mb-6">Welcome to our store</p>

        <h2 className="text-2xl font-semibold text-gray-700 mb-4">List Products:</h2>
        {transformedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No products found!</p>
        )}
      </div>
    </div>
  );
}