import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 1. Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin || admin.role !== "admin") {
      return res.status(401).json({ 
        success: false, 
        message: "Access Denied: Not an Admin" 
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 2. Add Product
export const addProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock, imageUrl } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        category,
        image: imageUrl,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
      },
    });

    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }, 
    });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};

// 4. Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: {
            include: { product: { select: { name: true } } } 
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get Analytics Data (With Flexible Interval Scaling)
export const getAnalyticsData = async (req, res) => {
  try {
    const { range, interval = 'day' } = req.query; // interval: 'day', 'week', 'month', 'year'
    
    // --- 1. Calculate Date Range ---
    const now = new Date();
    let startDate = new Date();

    if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else if (range === 'all') {
      const firstOrder = await prisma.order.findFirst({ orderBy: { createdAt: 'asc' } });
      if (firstOrder) {
        startDate = new Date(firstOrder.createdAt);
      } else {
        startDate = new Date(0); 
      }
    } else {
      // Default 7d
      startDate.setDate(now.getDate() - 7);
    }

    // --- 2. Database Aggregations ---
    const [totalOrders, newUsers, revenueResult] = await Promise.all([
        prisma.order.count({ 
            where: { createdAt: { gte: startDate } } 
        }),
        prisma.user.count({ 
            where: { 
                role: "customer",
                createdAt: { gte: startDate } 
            } 
        }),
        prisma.order.aggregate({ 
            _sum: { totalAmount: true },
            where: { createdAt: { gte: startDate } }
        })
    ]);
    
    const totalRevenue = Math.round(revenueResult._sum.totalAmount || 0);

    // --- 3. Top Products ---
    const topItemsGrouped = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
        where: { order: { createdAt: { gte: startDate } } }
    });

    const productDetails = await prisma.product.findMany({
        where: { id: { in: topItemsGrouped.map(item => item.productId) } },
        select: { id: true, name: true, image: true, price: true }
    });

    const topProducts = topItemsGrouped.map(group => {
        const product = productDetails.find(p => p.id === group.productId);
        return {
            name: product ? product.name : 'Unknown Product',
            sales: (product ? parseFloat(product.price) : 0) * group._sum.quantity, 
            quantity: group._sum.quantity,
            image: product ? product.image : null
        };
    });

    // --- 4. Chart Data (Flexible Interval Logic) ---
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' }
    });

    // Helper to generate consistent labels based on interval
    const getBucketLabel = (dateObj, type) => {
        const d = new Date(dateObj);
        if (type === 'year') {
            return d.getFullYear().toString();
        }
        if (type === 'month') {
            return d.toLocaleDateString("en-US", { month: 'short', year: 'numeric' });
        }
        if (type === 'week') {
            // Adjust to start of week (Monday)
            const day = d.getDay(); 
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
            const weekStart = new Date(d);
            weekStart.setDate(diff);
            return `Wk ${weekStart.getDate()} ${weekStart.toLocaleDateString("en-US", { month: 'short' })}`;
        }
        // Default day - THIS FIXES THE "SUN, MON, TUE" ISSUE
        return d.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
    };

    // Initialize Map for continuity
    const chartMap = new Map();
    const iterator = new Date(startDate);
    const end = new Date();

    // Loop to fill gaps with 0
    while (iterator <= end) {
        const label = getBucketLabel(iterator, interval);
        if (!chartMap.has(label)) {
            chartMap.set(label, 0);
        }
        
        if (interval === 'year') iterator.setFullYear(iterator.getFullYear() + 1);
        else if (interval === 'month') iterator.setMonth(iterator.getMonth() + 1);
        else if (interval === 'week') iterator.setDate(iterator.getDate() + 7);
        else iterator.setDate(iterator.getDate() + 1);
    }

    // Populate data
    recentOrders.forEach(order => {
        const label = getBucketLabel(order.createdAt, interval);
        const currentVal = chartMap.get(label) || 0;
        chartMap.set(label, currentVal + (parseFloat(order.totalAmount) || 0));
    });

    // Convert Map to Array
    const chartData = Array.from(chartMap, ([name, sales]) => ({ 
        name, 
        sales: Math.round(sales) 
    }));

    // --- 5. Pie Chart Categories ---
    const orderItemsForCategories = await prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: startDate } } },
        select: {
            quantity: true,
            price: true,
            product: { select: { category: true } }
        }
    });

    const categorySales = {};
    orderItemsForCategories.forEach(item => {
        const cat = item.product?.category || 'Uncategorized';
        const revenue = (parseFloat(item.price) || 0) * (item.quantity || 0);
        categorySales[cat] = (categorySales[cat] || 0) + revenue;
    });

    const pieChartData = Object.keys(categorySales).map(cat => ({
      name: cat,
      value: Math.round(categorySales[cat])
    }));

    res.json({
      success: true,
      totalRevenue,
      totalOrders,
      totalUsers: newUsers, 
      chartData,
      pieChartData,
      topProducts
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};