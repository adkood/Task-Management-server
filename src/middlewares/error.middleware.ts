import { Request, Response, NextFunction } from "express";

export function ErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {

    const statusCode = err.statusCode || 500;

    console.log("[Error] : ", err);
    return res.status(statusCode).json({
        status: "error",
        message: err.message || "Internal Server error",
    })

}