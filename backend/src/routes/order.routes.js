import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,       // Admin function
  updateOrderStatus   // Admin function
} from '../controllers/order.controller.js';

import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';

const router = express.Router();

// ==========================================
// CUSTOMER ROUTES
// ==========================================

// 1. Create Order / Payment
router.post('/create-razorpay-order', auth, createRazorpayOrder);
router.post('/verify-payment', auth, verifyPayment);
router.post('/', auth, createOrder);

// 2. Get User's Own Orders
// ✅ FIX: We changed this back to '/' so your Frontend (api.get('/orders')) works again.
router.get('/', auth, getUserOrders); 

// ==========================================
// ADMIN ROUTES
// ==========================================

// 3. Get ALL orders (Admin Dashboard)
router.get('/all-orders', auth, isAdmin, getAllOrders);

// 4. Update Status (Admin Dashboard)
router.put('/status/:id', auth, isAdmin, updateOrderStatus);

// ==========================================
// SHARED ROUTES
// ==========================================

// 5. Get Specific Order Details (Must be last to avoid conflicts)
router.get('/:id', auth, getOrderById);

export default router;