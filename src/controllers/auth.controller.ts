import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Nama, email, dan password wajib diisi",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password minimal 8 karakter",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email sudah terdaftar",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Registrasi berhasil",
      data: { user },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    if (!env.jwtSecret) {
      console.error("JWT_SECRET belum dikonfigurasi");

      return res.status(500).json({
        message: "Konfigurasi server belum lengkap",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const accessToken = jwt.sign({ sub: user.id }, env.jwtSecret, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Login berhasil",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User belum terautentikasi",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Data user berhasil diambil",
      data: { user },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
}
