// components/AllStores.tsx
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  slogan: string;
}

const stores: Store[] = [
  { id: 'ca-chua', name: 'Ca Chua', slogan: 'great!!!' },
  { id: 'xoai-xanh', name: 'Xoài Xanh', slogan: 'fresh & delicious' },
];

const AllStores = () => {
  return (
    <div>
      <h2>All Stores</h2>
      {stores.map(store => (
        // Link sẽ chuyển hướng đến trang /stores/ca-chua
        <Link key={store.id} href={`/stores/${store.id}`}>
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100">
            <h3 className="text-xl font-semibold">{store.name}</h3>
            <p className="text-gray-600">{store.slogan}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AllStores;