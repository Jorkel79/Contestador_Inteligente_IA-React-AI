const jwt = require("jsonwebtoken");

const SECRET = "ultra_secreto_123";

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}

module.exports = auth;
