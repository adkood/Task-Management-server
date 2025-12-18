import { JwtPayload } from "./Jwt";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export {};
