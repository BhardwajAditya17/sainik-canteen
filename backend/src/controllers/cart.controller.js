import prisma from "../config/prisma.js";

// GET CART
export async function getCart(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: You must be logged in." });
    }

    const userId = Number(req.user.id);

    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    // Filter out null products to prevent crashes
    const validItems = items.filter((item) => item.product !== null);

    const mapped = validItems.map((i) => ({
      id: i.id,
      product: i.product,
      quantity: i.quantity,
    }));

    const total = mapped.reduce(
      (sum, it) => sum + Number(it.product.price) * it.quantity,
      0
    );

    res.json({ items: mapped, total });
  } catch (err) {
    next(err);
  }
}

// ADD TO CART
export async function addToCart(req, res, next) {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized" });

    const userId = Number(req.user.id);
    const { productId, quantity = 1 } = req.body;

    if (!productId) return res.status(400).json({ error: "productId required" });

    // Verify product exists
    const productExists = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!productExists) return res.status(404).json({ error: "Product not found" });

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId: Number(productId) } },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + Number(quantity) },
      });
      return res.json(updated);
    }

    const created = await prisma.cartItem.create({
      data: { userId, productId: Number(productId), quantity: Number(quantity) },
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

// UPDATE QUANTITY
export async function updateQuantity(req, res, next) {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized" });

    const userId = Number(req.user.id);
    const itemId = Number(req.params.id);
    const { quantity } = req.body;

    if (quantity == null) return res.status(400).json({ error: "quantity required" });

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });

    if (!item || item.userId !== userId) return res.status(404).json({ error: "Cart item not found" });

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: Number(quantity) },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// REMOVE FROM CART
export async function removeFromCart(req, res, next) {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized" });

    const userId = Number(req.user.id);
    const itemId = Number(req.params.id);

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });

    if (!item || item.userId !== userId) return res.status(404).json({ error: "Cart item not found" });

    await prisma.cartItem.delete({ where: { id: itemId } });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// CLEAR CART
export async function clearCart(req, res, next) {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized" });

    const userId = Number(req.user.id);
    await prisma.cartItem.deleteMany({ where: { userId } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}