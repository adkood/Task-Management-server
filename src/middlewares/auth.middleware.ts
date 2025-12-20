import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // taking out token from header
    const token = req.cookies?.token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }

    // Verifying token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      username: string;
      iat?: number;
      exp?: number;
    };

    // Checking if token is expired or not
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }

    // Attaching user info to request object
    req.user = {
      id: decoded.id,
      username: decoded.username
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again."
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};