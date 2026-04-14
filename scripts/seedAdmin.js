require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  const existing = await prisma.user.findUnique({
    where: { email: process.env.ADMIN_EMAIL }
  });

  if (existing) {
    console.log('✅ Admin user already exists');
    return;
  }

  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL,
      businessName: 'Bluestock Admin',
      password: hash,
      isAdmin: true,
      status: 'ACTIVE',
      plan: 'UNLIMITED'
    }
  });
  console.log('✅ Admin user created:', process.env.ADMIN_EMAIL);
  await prisma.$disconnect();
}

seed().catch(console.error);
