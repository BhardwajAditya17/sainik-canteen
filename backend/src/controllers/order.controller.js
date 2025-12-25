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

    const totalAmount = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
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
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
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
 * GET: User Orders (For Customer Profile)
 ***************************************/
export async function getUserOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { 
        orderItems: { include: { product: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
}

/***************************************
 * GET: Single Order Details (FIXED for Email)
 ***************************************/
export async function getOrderById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid Order ID" });

    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        // ✅ CRITICAL FIX: Fetch user data so frontend gets the email
        user: { 
          select: { id: true, name: true, email: true, phone: true } 
        }, 
        orderItems: { 
          include: { product: true } 
        } 
      }
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Authorization check
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
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/***************************************
 * ADMIN: Update Status (FIXED for UI Consistency)
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
        // ✅ Ensure we return the user info so frontend doesn't lose it on update
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: true } }
      }
    });
    
    res.json(order);
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};