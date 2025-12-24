// backend/src/middleware/errorHandler.js

export default function errorHandler(err, req, res, next) {
  console.error(err);

  // Prisma known errors could be inspected here (P2002 unique constraint, etc)
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
}
