import bcrypt from 'bcryptjs';
import prisma from './src/config/prisma.js';

async function main() {
  const email = 'test@example.com';
  const password = 'password123';
  const organizationName = 'Test Organization';

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('Test user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        organizationId: organization.id,
      },
    });

    console.log('Dummy credentials created successfully:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Organization ID: ${organization.id}`);

    // Create a few more dummy items for testing
    const company = await prisma.company.create({
      data: {
        organizationId: organization.id,
        companyName: 'Acme Corp',
        domain: 'acme.com',
        industry: 'Technology',
        city: 'San Francisco',
        country: 'USA',
        status: 'ENRICHED',
      },
    });

    await prisma.contact.create({
      data: {
        companyId: company.id,
        name: 'John Doe',
        email: 'john@acme.com',
        role: 'CTO',
        timezone: 'America/Los_Angeles',
      },
    });

    console.log('Seeded some test data (Company & Contact).');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
