// backend/src/routes/cart.routes.js
import express from 'express';
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller.js';

import auth from '../middleware/auth.js';

const router = express.Router();

// ✅ UNCOMMENT THIS LINE:
router.use(auth); 

// Now all these routes will have access to req.user
router.get('/', getCart);
router.post('/', addToCart);          
router.put('/:id', updateQuantity);   
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

export default router;