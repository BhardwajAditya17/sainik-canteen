import prisma from '../config/prisma.js';

// Helper to generate slugs for SEO
const slugify = (text) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

/**
 * GET /products
 * Supports: pagination, multi-field search (including ID), category filtering, isFeatured filtering, and isActive check
 */
export async function listProducts(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit || '12'), 100);
    const page = Math.max(parseInt(req.query.page || '1'), 1);
    const search = req.query.search || '';
    const category = req.query.category || undefined;
    const isFeatured = req.query.isFeatured; // <--- Catch the query param
    const skip = (page - 1) * limit;

    const where = {
      isActive: true, // Customers should only see active products
    };

    // 1. FEATURED FILTER (The fix for your Home page)
    if (isFeatured !== undefined) {
      // Converts string "true" from URL into actual boolean true
      where.isFeatured = isFeatured === 'true';
    }

    // 2. Multi-field Search (Name, Brand, Description + ID)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];

      // 💡 If the search term is a number, allow searching by ID
      const searchId = parseInt(search);
      if (!isNaN(searchId)) {
        where.OR.push({ id: searchId });
      }
    }

    // 3. Category Filter
    if (category && category !== 'All') {
      where.category = category;
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({ 
        where, 
        take: limit, 
        skip, 
        orderBy: { createdAt: 'desc' } 
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({ 
      items, 
      page, 
      totalPages, 
      total,
      hasMore: skip + items.length < total 
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /products/:id
 */
export async function getProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ 
      where: { id } 
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found or unavailable' });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /products (Admin Only)
 */
export const createProduct = async (req, res) => {
  try {
    const imagePath = req.file ? req.file.path : '📦'; 
    // Add isFeatured to destructuring
    const { name, category, price, discountPrice, stock, description, brand, sku, isFeatured } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        brand: brand || "Generic",
        sku: sku || `SKU-${Date.now()}`,
        slug: slugify(name) + '-' + Date.now(),
        category,
        description,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock),
        image: imagePath,
        isActive: true,
        // Ensure boolean conversion if coming as string from FormData
        isFeatured: isFeatured === 'true' || isFeatured === true 
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Failed to create product." });
  }
};

/**
 * PATCH /products/:id (Admin Only)
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, discountPrice, stock, description, brand, isActive, isFeatured } = req.body;

    const updateData = {
      name,
      brand,
      category,
      description,
      price: price ? parseFloat(price) : undefined,
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      stock: stock ? parseInt(stock) : undefined,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined,
      isFeatured: isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : undefined,
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData
    });

    res.json(product);
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

/**
 * DELETE /products/:id (Admin Only)
 * Implementation: Soft Delete
 */
export async function deleteProduct(req, res, next) {
  try {
    const id = Number(req.params.id);

    // Hard Delete: Actually removes the row from the database
    await prisma.product.delete({
      where: { id }
    });

    res.json({ success: true, message: "Product deleted forever from database" });
  } catch (err) {
    next(err);
  }
}