import { Request } from "express";
import { JwtPayload } from "../types/Jwt";

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
