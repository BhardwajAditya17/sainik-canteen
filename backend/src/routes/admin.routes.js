import express from 'express';
import { 
  adminLogin, 
  addProduct, 
  deleteProduct, 
  getAllOrders, 
  updateOrderStatus, 
  getAnalyticsData,
   
} from '../controllers/admin.controller.js';

// Import Middleware (Ensure these files exist in your middleware folder)
// If you haven't created them yet, you can comment them out for testing
import auth from '../middleware/auth.js'; 
import isAdmin from '../middleware/admin.js';

const router = express.Router();

// --- Public Routes ---
router.post('/login', adminLogin);

// --- Protected Routes (Require Login + Admin Role) ---
// You can apply middleware individually or using router.use(auth, isAdmin) for all below

// Dashboard Stats & Analytics
router.get('/stats', auth, isAdmin, getAnalyticsData);
router.get('/analytics', auth, isAdmin, getAnalyticsData); // Alias for charts

// Order Management
router.get('/orders', auth, isAdmin, getAllOrders);
router.put('/orders/:id', auth, isAdmin, updateOrderStatus);

// Product Management
router.post('/products', auth, isAdmin, addProduct);
router.delete('/products/:id', auth, isAdmin, deleteProduct);

export default router;