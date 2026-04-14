require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

async function runVerification() {
  console.log('🔍 Starting Day 1 Synchronization Check...\n');
  let errors = 0;

  // 1. Check Environment Variables
  console.log('Checking .env configuration:');
  if (!process.env.DATABASE_URL) {
    console.log('  ❌ Missing DATABASE_URL in .env');
    errors++;
  } else {
    console.log('  ✅ DATABASE_URL is present');
  }

  if (!process.env.REDIS_URL) {
    console.log('  ❌ Missing REDIS_URL in .env');
    errors++;
  } else {
    console.log('  ✅ REDIS_URL is present');
  }

  // 2. Check Database Connection
  console.log('\nChecking PostgreSQL/NeonDB Connection:');
  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient();
    try {
      await prisma.$connect();
      console.log('  ✅ Successfully connected to NeonDB');

      // Check if Admin exists via seed script
      const admin = await prisma.user.findFirst({ where: { isAdmin: true } });
      if (admin) {
        console.log('  ✅ Admin user successfully seeded in the database');
      } else {
        console.log('  ❌ Connected, but no Admin user found (Did you forget to run "npm run db:seed"?)');
        errors++;
      }
    } catch (error) {
      console.log('  ❌ Failed to connect to NeonDB. Check your DATABASE_URL in .env');
      errors++;
    } finally {
      await prisma.$disconnect();
    }
  }

  // 3. Check Redis Connection
  console.log('\nChecking Upstash Redis Connection:');
  if (process.env.REDIS_URL) {
    try {
      const redis = new Redis(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false
  },
  maxRetriesPerRequest: 1
});
      const ping = await redis.ping();
      if (ping === 'PONG') {
        console.log('  ✅ Successfully connected to Upstash Redis');
      }
      redis.disconnect();
    } catch (error) {
      console.log('  ❌ Failed to connect to Upstash Redis. Check your REDIS_URL in .env');
      errors++;
    }
  }

  console.log('\n=======================================');
  if (errors === 0) {
    console.log('🎉 SUCCESS: You and your teammate are 100% perfectly synced!');
    console.log('✅ Day 1 is OFFICIALLY COMPLETE. You may now split the work.');
  } else {
    console.log(`⚠️  WARNING: Found ${errors} error(s). Please fix them before starting Day 2 tasks.`);
    console.log('Please check the logs above to see what is missing.');
  }
  console.log('=======================================\n');
  process.exit(errors === 0 ? 0 : 1);
}

runVerification();
