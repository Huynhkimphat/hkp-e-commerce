import { Metadata } from 'next';
import StoreForm from '@/components/admin/store-form'; 
import { requireAdmin } from '@/lib/auth-guard';
import { getStoreById } from '@/lib/actions/store.actions'; 
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Edit Store',
};


const EditStorePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  await requireAdmin();

  const { id } = await params; 

  const store = await getStoreById(id);

  if (!store) {
    notFound();
  }

  return (
    <>
      <h2 className='h2-bold'>Edit Store</h2>
      <div className='my-8'>
        <StoreForm type='Edit' store={{ ...store, storeName: store.name, description: store.description ?? undefined }} />
      </div>
      <Link href={`/admin/products/create?storeId=${store.id}`}>
        <Button>Add New Product</Button>
      </Link>
    </>
  );
};

export default EditStorePage;