import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth'; 
import { db } from '@/db/db'; 

export async function PATCH(req: NextRequest, { params }: { params: { productId: string } }) {
  // 1. Get the authenticated user's session
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = params;

  // 2. Find the user's store
  const userStore = await db.store.findFirst({
    where: {
      creatorId: session.user.id,
    },
  });

  if (!userStore) {
    return NextResponse.json({ message: 'User does not own a store.' }, { status: 403 });
  }

  // 3. Find the product to be updated
  const productToUpdate = await db.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!productToUpdate) {
    return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
  }

  // 4. Compare: Check if the product belongs to the user's store
  if (productToUpdate.storeId !== userStore.id) {
    // 5. Return an error if the user does not have permission
    return NextResponse.json({ message: 'Forbidden. You do not have permission to update this product.' }, { status: 403 });
  }

  // If all checks pass, perform the update
  try {
    const body = await req.json();
    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: body,
    });
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update product.' }, { status: 500 });
  }
}