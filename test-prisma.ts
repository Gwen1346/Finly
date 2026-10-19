import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL belum ditemukan di env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });


async function main() {
  const user = await prisma.user.delete({
    where: {
      email: "testing-finly@example.com",
    },
  });

  console.log("User berhasil dihapus dari database!");
  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
  });
}

main()
  .catch((e) => {
    console.error("Tes Prisma gagal: ", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
