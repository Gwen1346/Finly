import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "../config/env";

if (!env.databaseUrl) {
    throw new Error("DATABASE_URL belum ditemukan di env");
}

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

export const prisma = new PrismaClient({ adapter });