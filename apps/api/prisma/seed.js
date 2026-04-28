'use strict';
const { PrismaClient } = require('@prisma/client');
const problems = require('./seed-data/problems.json');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding problems…');
  const result = await prisma.problem.createMany({
    data: problems,
    skipDuplicates: true,
  });
  console.log(`Seeded ${result.count} problems`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
