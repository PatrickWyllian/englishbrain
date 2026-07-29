import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makePrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Fallback for static build / missing env. Do not use in production.
    return new PrismaClient({
      adapter: new PrismaPg(
        new Pool({ connectionString: "postgresql://localhost:5432/englishquest" })
      ),
    });
  }
  return new PrismaClient({
    adapter: new PrismaPg(new Pool({ connectionString })),
  });
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
