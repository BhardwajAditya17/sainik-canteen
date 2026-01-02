import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  
  console.log(`Updating ${products.length} products...`);

  for (const product of products) {
    const slug = product.name.toLowerCase().replace(/ /g, '-') + '-' + product.id;
    const sku = `PROD-${product.id}-${Math.floor(Math.random() * 1000)}`;

    await prisma.product.update({
      where: { id: product.id },
      data: { 
        slug: slug,
        sku: sku,
        brand: product.brand || "Generic" 
      },
    });
  }
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());