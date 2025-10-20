import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "3h" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token missing!" });
  }
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token!" });
    }
    req.user = payload;
    next();
  });
}
export { generateAccessToken, generateRefreshToken };
