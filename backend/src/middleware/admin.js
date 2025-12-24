// middleware/admin.js

const isAdmin = (req, res, next) => {
  console.log('isAdmin middleware hit for path:', req.path);

  // 1. Check if user is authenticated (req.user should be set by previous auth middleware)
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: No user found' });
  }

  // 2. Check for 'admin' role
  if (req.user.role && req.user.role === 'admin') {
    return next();
  }

  // 3. Check for specific Admin Email (God mode)
  // We check if env var exists first to avoid matching empty strings
  if (process.env.ADMIN_EMAIL && req.user.email === process.env.ADMIN_EMAIL) {
    return next();
  }

  // 4. If neither, deny access
  return res.status(403).json({ error: 'Forbidden: Admins only' });
};

export default isAdmin;