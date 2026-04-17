// Using commonjs for easier running with node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const superAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });
  console.log('Super Admin Details:', superAdmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
