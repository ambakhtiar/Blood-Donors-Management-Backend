const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const donorCount = await prisma.bloodDonor.count();
  const activeDonors = await prisma.bloodDonor.count({ where: { isDeleted: false } });
  
  console.log('--- DB STATS ---');
  console.log('Total Users:', userCount);
  console.log('Total BloodDonors:', donorCount);
  console.log('Active BloodDonors (isDeleted: false):', activeDonors);
  
  if (activeDonors > 0) {
    const firstDonor = await prisma.bloodDonor.findFirst({
        where: { isDeleted: false }
    });
    console.log('Example Donor:', firstDonor);
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
