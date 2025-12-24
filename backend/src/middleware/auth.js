import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_in_prod";

export default async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token || null;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    let token;

    // Token may come as "Bearer <TOKEN>" or plain value in cookies
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    delete user.password;

    req.user = user;

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
}
