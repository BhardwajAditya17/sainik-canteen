import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";

// @desc    Get ALL users (Admins & Customers)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      // REMOVED the 'where' filter so we get everyone
      select: {
        id: true, name: true, email: true, role: true, createdAt: true
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new user manually
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name, 
        email, 
        password: hashedPassword, 
        role: role || "customer"
      }
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { id: id }, // Ensure your ID type matches (int vs string/uuid)
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: id },
    });

    res.status(200).json({
      success: true,
      message: "User removed successfully",
    });
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to delete user.",
    });
  }
};