// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type
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
    // Get token from cookie or Authorization header
    const token = req.cookies?.token || 
                  req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required. Please login." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      id: string; 
      username: string;
      iat?: number;
      exp?: number;
    };

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ 
        success: false,
        message: "Token expired. Please login again." 
      });
    }

    // Attach user to request
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