import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventphotofinder.com' },
    update: {},
    create: {
      email: 'admin@eventphotofinder.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('Admin user:', admin.email);

  // Create Retirement Party event (photos uploaded separately via scripts/setup-retirement-event.js)
  await prisma.event.upsert({
    where: { cloudinaryFolder: 'events/retirement' },
    update: {},
    create: {
      name: 'Retirement Party',
      description: 'A celebration honoring years of dedication and achievement.',
      cloudinaryFolder: 'events/retirement',
      location: 'Banquet Hall',
      eventDate: new Date(),
      totalPhotos: 0,
      isProcessed: false,
    },
  });

  console.log('Created Retirement Party event');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
