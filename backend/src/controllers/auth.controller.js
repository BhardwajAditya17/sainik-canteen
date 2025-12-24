// backend/src/controllers/auth.controller.js
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { signToken } from "../config/jwt.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

export async function register(req, res, next) {
  try {
    const { name, email, password, phone, address, city, state, pincode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone, address, city, state, pincode }
    });

    const token = signToken({ id: user.id, email: user.email });

    delete user.password;

    // Set Cookie (Optional, good for redundancy)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ FIX: Send 'token' in the JSON body so Frontend can save to localStorage
    return res.status(201).json({ success: true, user, token }); 
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    // If user not found, return 400 (This is your current error!)
    if (!user) {
      return res.status(400).json({ error: "User not found. Please Register first." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = signToken({ id: user.id, email: user.email });

    delete user.password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // ✅ FIX: Send 'token' in the JSON body here too
    return res.json({ success: true, user, token });
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
