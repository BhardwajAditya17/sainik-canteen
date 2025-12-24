import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

import {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller.js';

import auth from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js'; 

dotenv.config();

const router = express.Router();

// --- 1. Cloudinary Config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 2. Multer Storage Config ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sainik-canteen-products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

// --- 3. Routes ---

// Public Routes
router.get('/', listProducts);
router.get('/:id', getProduct);

// Admin Routes
// Note: We added 'upload.single("image")' middleware here
router.post('/', auth, isAdmin, upload.single('image'), createProduct);

// Also allow updating images
router.put('/:id', auth, isAdmin, upload.single('image'), updateProduct);

router.delete('/:id', auth, isAdmin, deleteProduct);

export default router;