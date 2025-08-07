import ProductList from '@/components/shared/product/product-list';
import {
  getLatestProducts,
  getFeaturedProducts,
} from '@/lib/actions/product.actions';
import ProductCarousel from '@/components/shared/product/product-carousel';
import ViewAllProductsButton from '@/components/view-all-products-button';
import IconBoxes from '@/components/icon-boxes';
import DealCountdown from '@/components/deal-countdown';
import { getStores } from '@/lib/actions/store.actions';
import { StoreCard } from '@/components/store-card'; 
import Link from 'next/link';

const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();
  const { data: stores } = await getStores({ query: '', page: 1 });

  if (!latestProducts || !featuredProducts || !stores) {
    return <p>Loading...</p>;
  }

  if (latestProducts.length === 0 && featuredProducts.length === 0 && stores.length === 0) {
    return <p>No products or stores available.</p>;
  }

  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts} title='Newest Arrivals' limit={4} />
      <h1 className='text-3xl font-bold mb-6'>All Shops</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {stores.length > 0 ? (
          stores.map((store: { id: string; createdAt: Date; name: string; slug: string; description: string | null; ownerId: string; updatedAt: Date; }) => (
            <Link key={store.id} href={`/stores/${store.slug}`}>
              <StoreCard store={store} />
            </Link>
          ))
        ) : (
          <p>No stores found.</p>
        )}
      </div>
      <ViewAllProductsButton />
      <DealCountdown />
      <IconBoxes />
    </>
  );
};

export default Homepage;
