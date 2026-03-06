import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, "ultra_secreto_123");
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token inválido" });
  }
}