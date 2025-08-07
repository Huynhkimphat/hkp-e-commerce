'use server';

import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { StoreSchema} from '@/lib/validators';
import { z } from 'zod';
import { db } from '@/db/db';

type CreateStoreParams = z.infer<typeof StoreSchema>;

export const getStores = async ({ query, page }: { query: string; page: number }) => {
  try {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const where = query ? {
      name: {
        contains: query,
        mode: 'insensitive' as const,
      },
    } : {};

    const stores = await prisma.store.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalStores = await prisma.store.count({ where });
    const totalPages = Math.ceil(totalStores / pageSize);

    return {
      data: stores,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw new Error('Failed to fetch stores.');
  }
};

export const createStore = async (values: CreateStoreParams) => {
  try {
    const session = await auth();

    if (!session?.user || !session.user.id || session.user.role !== 'admin') {
      return {
        error: { general: ['Không được phép tạo cửa hàng. Cần có quyền quản trị viên.'] }
      };
    }

    const validatedFields = StoreSchema.safeParse(values);
    if (!validatedFields.success) {
      return {
        error: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { storeName, slug, description } = validatedFields.data;

    // Sửa lỗi ở đây: Thêm trường `creator`
    const newStore = await db.store.create({
      data: {
        name: storeName,
        slug,
        description: description || null,
        ownerId: session.user.id,
        creatorId: session.user.id,
      },
    });

    // Revalidate all relevant paths
    revalidatePath('/admin/stores');
    revalidatePath('/admin/stores', 'page');
    revalidatePath(`/admin/stores/${newStore.id}`);

    return { data: JSON.parse(JSON.stringify(newStore)) };
  } catch (error) {
    console.error('Lỗi khi tạo cửa hàng:', error);
    console.error('Chi tiết lỗi:', {
      message: error instanceof Error ? error.message : 'Lỗi không xác định',
      stack: error instanceof Error ? error.stack : 'Không có stack trace',
      name: error instanceof Error ? error.name : 'Loại lỗi không xác định'
    });

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return {
          error: { slug: ['Tên cửa hàng (slug) này đã tồn tại'] }
        };
      }
      if (error.message.includes('Foreign key constraint')) {
        return {
          error: { general: ['Tham chiếu người dùng không hợp lệ'] }
        };
      }
    }

    return {
      error: { general: ['Không thể tạo cửa hàng. Vui lòng thử lại.'] }
    };
  }
};
export const deleteStore = async (id: string) => {
  try {
    const session = await auth();

    if (!session?.user || !session.user.id || session.user.role !== 'admin') {
      return { success: false, message: 'Not authorized to delete a store.' };
    }
    
    // Xóa cửa hàng
    const deletedStore = await prisma.store.delete({
      where: {
        id,
        ownerId: session.user.id // Đảm bảo chỉ admin sở hữu mới có thể xóa
      }
    });

    if (!deletedStore) {
      return { success: false, message: 'Store not found.' };
    }

    revalidatePath('/admin/stores');
    // Trả về đối tượng phù hợp với DeleteDialog
    return { success: true, message: 'Store deleted successfully.' };
  } catch (error) {
    console.error('Error deleting store:', error);
    // Trả về đối tượng lỗi phù hợp
    return { success: false, message: 'Failed to delete store.' };
  }
};

export const getStoreById = async (id: string) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id },
    });
    return store;
  } catch (error) {
    console.error('Error fetching store by ID:', error);
    return null;
  }
};
