import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductStores() {
  try {
    console.log('🔍 Checking current product and store data...\n');

    // Check existing stores
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    console.log('📦 Available Stores:');
    stores.forEach(store => {
      console.log(`  - ${store.name} (ID: ${store.id}) - ${store._count.products} products`);
    });

    // Check products without stores
    const productsWithoutStore = await prisma.product.findMany({
      where: {
        storeId: null
      },
      select: {
        id: true,
        name: true,
        brand: true
      }
    });

    console.log(`\n Products without store: ${productsWithoutStore.length}`);
    productsWithoutStore.forEach(product => {
      console.log(`  - ${product.name} (Brand: ${product.brand})`);
    });

    if (productsWithoutStore.length === 0) {
      console.log(' All products already have stores assigned!');
      return;
    }

    // If no stores exist, create default stores
    if (stores.length === 0) {
      console.log('\n Creating default stores...');
      
      const defaultStores = [
        { name: 'Polo', slug: 'polo' },
        { name: 'Tommy Hilfiger', slug: 'tommy-hilfiger' },
        { name: 'Ralph Lauren', slug: 'ralph-lauren' }
      ];

      // You'll need to provide actual user IDs for creator and owner
      // For now, let's get the first user from the database
      const firstUser = await prisma.user.findFirst();
      
      if (!firstUser) {
        console.log(' No users found. Please create a user first.');
        return;
      }

      for (const storeData of defaultStores) {
        await prisma.store.create({
          data: {
            name: storeData.name,
            slug: storeData.slug,
            description: `Official ${storeData.name} store`,
            ownerId: firstUser.id,
            creatorId: firstUser.id
          }
        });
        console.log(`Created store: ${storeData.name}`);
      }

      // Refresh stores list
      const newStores = await prisma.store.findMany();
      stores.push(...newStores);
    }

    // Assign products to stores based on brand
    console.log('\n Assigning products to stores...');
    
    for (const product of productsWithoutStore) {
      let targetStore = stores.find(store => 
        store.name.toLowerCase().includes(product.brand.toLowerCase()) ||
        product.brand.toLowerCase().includes(store.name.toLowerCase())
      );

      // If no matching store found, assign to first store
      if (!targetStore) {
        targetStore = stores[0];
      }

      await prisma.product.update({
        where: { id: product.id },
        data: { storeId: targetStore.id }
      });

      console.log(`Assigned "${product.name}" to "${targetStore.name}"`);
    }

    console.log('\n All products have been assigned to stores!');

    // Verify the fix
    const updatedProductsWithoutStore = await prisma.product.count({
      where: { storeId: null }
    });

    console.log(`\n Products without store after fix: ${updatedProductsWithoutStore}`);

  } catch (error) {
    console.error(' Error fixing product stores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductStores();
