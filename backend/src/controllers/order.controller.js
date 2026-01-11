import prisma from '../config/prisma.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Setup Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

/***************************************
 * POST: Create Razorpay Order
 ***************************************/
export async function createRazorpayOrder(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: "Amount required" });

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    next(error);
  }
}

/***************************************
 * POST: Verify Payment Signature
 ***************************************/
export async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, message: "Payment verified" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    next(error);
  }
}

/***************************************
 * POST: Place Order
 ***************************************/
export async function createOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const { 
      name, phone, address, city, state, pincode, 
      paymentMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature 
    } = req.body;

    if (!name || !address || !city || !pincode) {
      return res.status(400).json({ message: "Shipping details are incomplete" });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // ✅ FIXED: Calculate total using discountPrice if available
    const totalAmount = cartItems.reduce((acc, item) => {
      const activePrice = (item.product.discountPrice && item.product.discountPrice > 0) 
        ? item.product.discountPrice 
        : item.product.price;
      return acc + (activePrice * item.quantity);
    }, 0);

    const method = paymentMethod ? paymentMethod.toLowerCase() : "cod";
    const isCOD = method === "cod";

    const finalPaymentStatus = isCOD ? "Pending" : "Paid";
    const finalOrderStatus = "Processing";

    const order = await prisma.$transaction(async (tx) => {
      // Check Stock
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Out of stock: ${item.product.name}`);
        }
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: finalOrderStatus,
          paymentMethod: method,
          paymentStatus: finalPaymentStatus,
          razorpayOrderId: isCOD ? null : razorpayOrderId,
          razorpayPaymentId: isCOD ? null : razorpayPaymentId,
          razorpaySignature: isCOD ? null : razorpaySignature,
          name, phone, address, city, state, pincode,
          orderItems: {
            create: cartItems.map(item => {
              // ✅ FIXED: Save the actual price paid (discounted or original) in order history
              const pricePaid = (item.product.discountPrice && item.product.discountPrice > 0) 
                ? item.product.discountPrice 
                : item.product.price;
                
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: pricePaid
              };
            })
          }
        },
        include: { orderItems: true }
      });

      // Update Stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Clear Cart
      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    res.status(201).json({ success: true, order });

  } catch (error) {
    console.error("Create Order Error:", error);
    if (error.message.includes("Out of stock")) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

/***************************************
 * GET: User Orders
 ***************************************/
export async function getUserOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
}

/***************************************
 * GET: Single Order Details
 ***************************************/
export async function getOrderById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid Order ID" });

    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        user: { select: { id: true, name: true, email: true, phone: true } }, 
        orderItems: { include: { product: true } } 
      }
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
}

/***************************************
 * ADMIN: Get All Orders
 ***************************************/
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status, paymentStatus, timeRange } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};

    if (status && status !== "All") where.status = status;
    if (paymentStatus && paymentStatus !== "All") where.paymentStatus = paymentStatus;

    if (search) {
      const isNumeric = !isNaN(search);
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        ...(isNumeric ? [{ id: parseInt(search) }] : [])
      ];
    }

    if (timeRange && timeRange !== "All Time") {
      const now = new Date();
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      if (timeRange === "Day") {
        // Midnight today
      } else if (timeRange === "Week") {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === "Month") {
        startDate.setDate(now.getDate() - 30);
      } else if (timeRange === "Year") {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      where.createdAt = { gte: startDate };
    }

    const [totalOrders, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          orderItems: { include: { product: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      })
    ]);

    res.json({
      success: true,
      orders,
      totalOrders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / take)
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/***************************************
 * ADMIN: Update Status
 ***************************************/
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { 
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: true } }
      }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

/***************************************
 * ADMIN: Get Analytics
 ***************************************/
export const getAdminAnalytics = async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    
    const now = new Date();
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else {
      startDate.setFullYear(2000); 
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: { in: ['Paid', 'Completed', 'Success', 'paid'] } 
      },
      include: { 
        orderItems: { 
          include: { product: true } 
        } 
      },
      orderBy: { createdAt: 'asc' }
    });

    const totalUsers = await prisma.user.count();

    let totalRevenue = 0;
    const chartDataMap = {};
    const categoryMap = {};
    const productMap = {};

    orders.forEach(order => {
      const orderAmount = Number(order.totalAmount) || 0;
      totalRevenue += orderAmount;

      const dateKey = order.createdAt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      chartDataMap[dateKey] = (chartDataMap[dateKey] || 0) + orderAmount;

      order.orderItems.forEach(item => {
        const itemRevenue = Number(item.price) * item.quantity;
        
        const cat = item.product?.category || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + itemRevenue;

        const pName = item.product?.name || "Unknown Product";
        productMap[pName] = (productMap[pName] || 0) + itemRevenue;
      });
    });

    const chartData = Object.keys(chartDataMap).map(name => ({
      name,
      sales: chartDataMap[name]
    }));

    const pieChartData = Object.keys(categoryMap).map(name => ({
      name,
      value: categoryMap[name]
    }));

    const topProducts = Object.keys(productMap)
      .map(name => ({ name, sales: productMap[name] }))
      .sort((a, b) => a.sales - b.sales) 
      .slice(-10);

    res.json({
      success: true,
      totalRevenue,
      totalOrders: orders.length,
      totalUsers,
      chartData,
      pieChartData,
      topProducts
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, message: "Analytics failed" });
  }
};