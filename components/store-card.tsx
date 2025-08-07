import { Store } from '@prisma/client'; // Giả sử Store model của bạn

export const StoreCard = ({ store }: { store: Store }) => {
  return (
    <div className='border rounded-lg p-4 hover:shadow-lg transition-shadow duration-300'>
      <h2 className='text-xl font-semibold'>{store.name}</h2>
      <p className='text-gray-600 mt-2'>{store.description}</p>
    </div>
  );
};