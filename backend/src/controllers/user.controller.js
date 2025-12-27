import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";

// @desc    Get Single User Details (Including Orders)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 💡 CRITICAL: Convert string ID to Integer
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // If you have an 'orders' relation in schema.prisma, this brings history
        orders: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Remove sensitive data before sending to frontend
    const { password, ...userData } = user;
    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error("Fetch User Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ALL users (Directory view)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, 
        name: true, 
        email: true, 
        phone: true, 
        city: true,
        role: true, 
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new user (Handles the full address profile)
export const createUser = async (req, res) => {
  try {
    const { 
      name, email, phone, password, role, 
      address, city, state, pincode 
    } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name, 
        email, 
        phone,
        password: hashedPassword, 
        role: role || "customer",
        address,
        city,
        state,
        pincode
      }
    });

    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.status(200).json({ success: true, message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // 1. Check if ID is valid
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    // 2. Extract updateable fields from request body
    const { name, phone, address, city, state, pincode, role } = req.body;

    // 3. Verify user exists before updating
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 4. Perform update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : userExists.name,
        phone: phone !== undefined ? phone : userExists.phone,
        address: address !== undefined ? address : userExists.address,
        city: city !== undefined ? city : userExists.city,
        state: state !== undefined ? state : userExists.state,
        pincode: pincode !== undefined ? pincode : userExists.pincode,
        role: role !== undefined ? role : userExists.role,
      },
    });

    // 5. Remove password and send back updated user
    const { password, ...userData } = updatedUser;
    res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully", 
      user: userData 
    });

  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};