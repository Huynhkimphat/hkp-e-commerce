const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugStores() {
  console.log('=== DEBUGGING STORE ASSIGNMENTS ===\n');
  
  try {
    // Check if stores exist
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
    
    console.log('📦 STORES IN DATABASE:');
    if (stores.length === 0) {
      console.log('❌ NO STORES FOUND! This is why products show "No store"');
    } else {
      stores.forEach(store => {
        console.log(`- ${store.name} (ID: ${store.id}) - ${store._count.products} products`);
      });
    }
    
    console.log('\n📋 PRODUCTS AND THEIR STORE ASSIGNMENTS:');
    const products = await prisma.product.findMany({
      select: {
        name: true,
        storeId: true,
        store: {
          select: {
            name: true
          }
        }
      },
      take: 10 // Just show first 10 products
    });
    
    products.forEach(product => {
      const storeName = product.store?.name || 'NO STORE ASSIGNED';
      const storeId = product.storeId || 'NULL';
      console.log(`- "${product.name}" -> Store: ${storeName} (ID: ${storeId})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugStores();
