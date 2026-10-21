import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export function authenticateToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({
            message: "Access token tidak ditemukan",
        });
        return;
    }

    const token = authHeader.slice(7);

    if (!env.jwtSecret) {
        console.error("JWT_SECRET belum dikonfigurasi");

        res.status(500).json({
            message: "Konfigurasi server belum lengkap",
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, env.jwtSecret);

        if (typeof decoded === "string" || typeof decoded.sub !== "string") {
            res.status(401).json({
                message: "Access token tidak valid",
            });
            return;
        }

        req.userId = decoded.sub;
        next();
    } catch {
        res.status(401).json({
            message: "Access token tidak valid atau kedaluwarsa",
        });
    }
}