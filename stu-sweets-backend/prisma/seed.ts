import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL!;
    const adminPassword = process.env.ADMIN_PASSWORD!;
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL!;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD!;
    const password = await bcrypt.hash(adminPassword, 10);
    const superAdminHashedPassword = await bcrypt.hash(superAdminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password, role: "ADMIN" },
    create: {
      email: adminEmail,
      password,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { password: superAdminHashedPassword, role: "SUPER_ADMIN" },
    create: {
      email: superAdminEmail,
      password: superAdminHashedPassword,
      role: "SUPER_ADMIN",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });