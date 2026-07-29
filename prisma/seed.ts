import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { Role } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@englishquest.com";

  try {
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: Role.ADMIN },
      create: {
        email: adminEmail,
        name: "Admin",
        role: Role.ADMIN,
      },
    });

    console.log(`Admin user created/updated: ${admin.email} (role: ${admin.role})`);
  } catch (error) {
    console.error("Failed to seed admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
