// utils/Jwt.ts
import jwt from "jsonwebtoken";

export const generateAccessToken = (payload: { id: string; username: string }) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: '24h' } // Add expiration
  );
};

// Optional: Add refresh token function
export const generateRefreshToken = (payload: { id: string; username: string }) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET!, // Different secret for refresh tokens
    { expiresIn: '7d' }
  );
};