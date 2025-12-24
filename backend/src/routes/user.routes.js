import express from "express";
import { getAllUsers, createUser, deleteUser } from "../controllers/user.controller.js";
// import { protect, admin } from "../middleware/authMiddleware.js"; // Import if you have auth middleware

const router = express.Router();

router.get("/", getAllUsers);       // Matches GET /api/users
router.post("/", createUser);
router.delete("/:id", deleteUser);  // Matches DELETE /api/users/:id

export default router;