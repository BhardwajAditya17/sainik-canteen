// backend/src/controllers/product.controller.js
import prisma from '../config/prisma.js';

/**
 * GET /products
 * supports: ?limit, ?page, ?search, ?featured, ?category
 */
export async function listProducts(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit || '12'), 100);
    const page = Math.max(parseInt(req.query.page || '1'), 1);
    const search = req.query.search || '';
    const featured = req.query.featured === 'true' || false;
    const category = req.query.category || undefined;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (featured) {
      // add a featured field if needed in schema
      // where.featured = true;
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, take: limit, skip, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({ items, page, totalPages, total });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (err) {
    next(err);
  }
}

export const createProduct = async (req, res) => {
    try {
        // req.file contains the Cloudinary info (if an image was uploaded)
        const imagePath = req.file ? req.file.path : '📦'; 

        // Important: req.body fields might be strings, ensure numbers are parsed
        const { name, category, price, stock, description } = req.body;

        const product = await prisma.product.create({
            data: {
                name,
                category,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                image: imagePath // Saving the Cloudinary URL
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ message: "Failed to create product" });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, stock, description } = req.body;

        // Prepare data object
        const updateData = {
            name,
            category,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
        };

        // Only update image if a new file was uploaded
        if (req.file) {
            updateData.image = req.file.path;
        }

        const product = await prisma.product.update({
            where: { id: Number(id) }, // Ensure ID is a number
            data: updateData
        });

        res.json(product);
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ message: "Failed to update product" });
    }
};

export async function deleteProduct(req, res, next) {
  try {
    const id = Number(req.params.id);

    await prisma.product.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
