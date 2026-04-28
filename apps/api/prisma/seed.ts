import { Prisma, PrismaClient } from '@prisma/client';
import problems from './seed-data/problems.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding problems...');

  // Clear existing seed data (idempotent)
  await prisma.problem.deleteMany({});

  const created = await prisma.problem.createMany({
    data: problems as Prisma.ProblemCreateManyInput[],
    skipDuplicates: true,
  });

  console.log(`Seeded ${created.count} problems`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
