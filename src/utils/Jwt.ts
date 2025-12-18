import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/Jwt";

export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "24h",
  });
};
