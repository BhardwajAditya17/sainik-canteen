// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@sainik.com' },
    update: {},
    create: {
      email: 'demo@sainik.com',
      name: 'Demo User',
      password: hashedPassword,
      phone: '9876543210',
      address: '123 Demo Street',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  });

  console.log('✅ Created demo user:', user.email);

  // Create products
  const products = [
    { name: 'Samsung Galaxy S23', category: 'Electronics', price: 799.00, stock: 15, image: '📱', description: 'Latest Samsung flagship smartphone' },
    { name: 'Sony Headphones WH-1000XM5', category: 'Electronics', price: 399.00, stock: 20, image: '🎧', description: 'Premium noise-cancelling headphones' },
    { name: 'LG 55" 4K Smart TV', category: 'Electronics', price: 1299.00, stock: 8, image: '📺', description: 'Ultra HD Smart TV' },
    { name: 'Dell Laptop Inspiron 15', category: 'Electronics', price: 899.00, stock: 12, image: '💻', description: 'Powerful laptop' },
    { name: 'Apple iPad Air', category: 'Electronics', price: 599.00, stock: 10, image: '📱', description: 'Tablet with M1 chip' },
    { name: 'Canon EOS Camera', category: 'Electronics', price: 1499.00, stock: 5, image: '📷', description: 'Professional DSLR' },
    
    { name: 'Rice (5kg)', category: 'Grocery', price: 12.00, stock: 50, image: '🌾', description: 'Premium basmati rice' },
    { name: 'Cooking Oil (2L)', category: 'Grocery', price: 8.00, stock: 40, image: '🛢️', description: 'Healthy cooking oil' },
    { name: 'Fresh Vegetables Pack', category: 'Grocery', price: 15.00, stock: 30, image: '🥬', description: 'Fresh vegetables' },
    { name: 'Milk (1L)', category: 'Grocery', price: 3.00, stock: 60, image: '🥛', description: 'Fresh dairy milk' },
    { name: 'Wheat Flour (10kg)', category: 'Grocery', price: 20.00, stock: 45, image: '🌾', description: 'Whole wheat flour' },
    { name: 'Sugar (2kg)', category: 'Grocery', price: 5.00, stock: 55, image: '🧂', description: 'Refined sugar' },
    { name: 'Tea (500g)', category: 'Grocery', price: 7.00, stock: 40, image: '☕', description: 'Premium tea' },
    { name: 'Coffee (250g)', category: 'Grocery', price: 12.00, stock: 35, image: '☕', description: 'Fresh ground coffee' },
    { name: 'Eggs (12 pack)', category: 'Grocery', price: 4.50, stock: 70, image: '🥚', description: 'Farm fresh eggs' },
    { name: 'Bread (500g)', category: 'Grocery', price: 2.50, stock: 80, image: '🍞', description: 'Whole wheat bread' },
    
    { name: 'Kitchen Utensils Set', category: 'Other', price: 45.00, stock: 25, image: '🍴', description: 'Complete utensils set' },
    { name: 'Bed Sheets Set', category: 'Other', price: 35.00, stock: 18, image: '🛏️', description: 'Premium cotton sheets' },
    { name: 'Cleaning Supplies Kit', category: 'Other', price: 28.00, stock: 35, image: '🧹', description: 'Complete cleaning kit' },
    { name: 'Towel Set', category: 'Other', price: 22.00, stock: 40, image: '🧺', description: 'Soft cotton towels' },
    { name: 'Dinner Set (24 pieces)', category: 'Other', price: 65.00, stock: 15, image: '🍽️', description: 'Ceramic dinner set' },
    { name: 'Water Bottles Set', category: 'Other', price: 18.00, stock: 50, image: '💧', description: 'BPA-free bottles' },
    { name: 'Storage Containers', category: 'Other', price: 25.00, stock: 30, image: '📦', description: 'Airtight containers' },
    { name: 'Lamp Set', category: 'Other', price: 40.00, stock: 20, image: '💡', description: 'Modern LED lamps' },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: products.indexOf(product) + 1 },
      update: {},
      create: product
    });
  }

  console.log(`✅ Created ${products.length} products`);
  console.log('🌱 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });