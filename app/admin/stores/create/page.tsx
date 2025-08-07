import { Metadata } from 'next';
import StoreForm from '@/components/admin/store-form';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata: Metadata = {
  title: 'Create Store',
};

const CreateStorePage = async () => {
  await requireAdmin();

  return (
    <>
      <h2 className='h2-bold'>Create Store</h2>
      <div className='my-8'>
        <StoreForm type='Create' />
      </div>
    </>
  );
};

export default CreateStorePage;