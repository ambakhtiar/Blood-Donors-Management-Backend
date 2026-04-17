import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const donors = await prisma.bloodDonor.findMany({
    where: { isDeleted: false },
    include: {
      user: true
    }
  });
  console.log('Total Donors (isDeleted: false):', donors.length);
  if (donors.length > 0) {
    console.log('First Donor:', JSON.stringify(donors[0], null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
