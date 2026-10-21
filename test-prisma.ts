import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client";
import { error } from "node:console";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL belum ditemukan di env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });



async function main() {
  const testEmail = "relation-test@example.com";
  const testDescription = "Tes relasi transaksi";
  const testCategoryName = "Kategori Tes";
  const testAccountName = "Cash Test";

  // 1. Cari user dummy
  const user = await prisma.user.findUnique({
    where: {
      email: testEmail,
    },
  });

  if (!user) {
    console.log("User dummy tidak ditemukan. Cleanup tidak diperlukan.");
    return;
  }

  // 2. Hapus transaksi dummy terlebih dahulu
  const deletedTransactions = await prisma.transaction.deleteMany({
    where: {
      userId: user.id,
      description: testDescription,
    },
  });

  console.log(
    `Transaksi dummy dihapus: ${deletedTransactions.count}`,
  );

  // 3. Hapus kategori dummy
  const deletedCategories = await prisma.category.deleteMany({
    where: {
      userId: user.id,
      name: testCategoryName,
    },
  });

  console.log(
    `Kategori dummy dihapus: ${deletedCategories.count}`,
  );

  // 4. Hapus akun keuangan dummy
  const deletedAccounts = await prisma.financialAccount.deleteMany({
    where: {
      userId: user.id,
      name: testAccountName,
    },
  });

  console.log(
    `Akun keuangan dummy dihapus: ${deletedAccounts.count}`,
  );

  // 5. Hapus user dummy
  await prisma.user.delete({
    where: {
      id: user.id,
    },
  });

  console.log("User dummy berhasil dihapus.");
  console.log("Cleanup data dummy Finly selesai!");
}

main()
  .catch((e) => {
    console.error("Tes Prisma gagal: ", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
