// backend/src/controllers/auth.controller.js
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { signToken } from "../config/jwt.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

export async function register(req, res, next) {
  try {
    const { name, email, password, phone, address, city, state, pincode } = req.body;

    // 1. Updated validation: Check for phone instead of email
    if (!name || !phone || !password) {
      return res.status(400).json({ error: "Name, Phone, and Password are required." });
    }

    // 2. Check if Phone already exists (Compulsory check)
    const phoneExists = await prisma.user.findUnique({ where: { phone } });
    if (phoneExists) {
      return res.status(400).json({ error: "This phone number is already registered." });
    }

    // 3. Check if Email already exists (Only if email was provided)
    if (email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: "This email is already registered." });
      }
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { 
        name, 
        email: email || null, // Ensure empty string becomes null
        password: hashed, 
        phone, 
        address, 
        city, 
        state, 
        pincode 
      }
    });

    const token = signToken({ id: user.id, email: user.email });
    delete user.password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ success: true, user, token }); 
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    // identifier can be either email or phone
    const { identifier, password } = req.body; 

    if (!identifier || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Search for a user where EITHER email OR phone matches the identifier
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });
    
    if (!user) {
      return res.status(400).json({ error: "User not found. Please register first." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = signToken({ id: user.id, email: user.email });

    // Remove password from object before sending to frontend
    const { password: _, ...userWithoutPassword } = user;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ success: true, user: userWithoutPassword, token });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        role: true,
        createdAt: true
      },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ success: true, message: "Logged out" });
}
