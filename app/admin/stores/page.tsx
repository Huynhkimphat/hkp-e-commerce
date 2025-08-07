import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/shared/pagination';
import { requireAdmin } from '@/lib/auth-guard';
import { deleteStore, getStores } from '@/lib/actions/store.actions';
import { formatId } from '@/lib/utils';
import DeleteDialog from '@/components/shared/delete-dialog';

const AdminStoresPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
  }>;
}) => {
  await requireAdmin(); // Đảm bảo chỉ admin mới có quyền truy cập

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || '';

  const stores = await getStores({
    query: searchText,
    page,
  });

  return (
    <div className='space-y-2'>
      <div className='flex-between'>
        <div className='flex items-center gap-3'>
          <h1 className='h2-bold'>Stores</h1>
          {searchText && (
            <div>
              Filtered by <i>&quot;{searchText}&quot;</i>{' '}
              <Link href='/admin/stores'>
                <Button variant='outline' size='sm'>
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
        <Button asChild variant='default'>
          <Link href='/admin/stores/create'>Create Store</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>STORE NAME</TableHead>
            <TableHead>SLUG</TableHead>
            <TableHead>DESCRIPTION</TableHead>
            <TableHead>CREATED</TableHead>
            <TableHead className='w-[100px]'>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.data.map((store) => (
            <TableRow key={store.id}>
              <TableCell>{formatId(store.id)}</TableCell>
              <TableCell>{store.name}</TableCell>
              <TableCell>{store.slug}</TableCell>
              <TableCell>{store.description || 'No description'}</TableCell>
              <TableCell>{new Date(store.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className='flex gap-1'>
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/admin/stores/${store.id}`}>Edit</Link>
                </Button>
                <DeleteDialog id={store.id} action={deleteStore} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {stores.totalPages > 1 && (
        <Pagination page={page} totalPages={stores.totalPages} />
      )}
    </div>
  );
};

export default AdminStoresPage;