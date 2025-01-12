const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis || global;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

const prisma = globalForPrisma.prisma;

if (process.env.NODE_ENV !== 'production') {
  // Add any additional non-production behavior here if needed
}

module.exports = { prisma };
