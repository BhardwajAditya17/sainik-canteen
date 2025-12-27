import express from "express";
import { 
  getAllUsers, 
  getUserById,
  createUser, 
  deleteUser,
  updateUser
} from "../controllers/user.controller.js";

const router = express.Router();

// Get list of all users
router.get("/", getAllUsers);       

// Get details for a specific user (Matches GET /api/users/:id)
router.get("/:id", getUserById);    

// Create a new user
router.post("/", createUser);

// Edit profile
router.put("/:id", updateUser);

// Delete a user
router.delete("/:id", deleteUser);  

export default router;