import { PrismaClient, PatentStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Instantiate Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clear existing patent data to prevent duplicates during re-seeding
  await prisma.patent.deleteMany();
  console.log('Deleted records in patent table');

  // 2. Read the mock-patents.json file
  const patentsPath = path.join(process.cwd(), 'src', 'data', 'mock-patents.json');
  const patentsFile = fs.readFileSync(patentsPath, 'utf-8');
  const patentsData = JSON.parse(patentsFile);

  // 3. Iterate over the JSON data and create records
  for (const p of patentsData) {
    await prisma.patent.create({
      data: {
        id: p.id,
        title: p.title,
        abstract: p.abstract,
        inventors: p.inventors,
        inventorsText: p.inventors.join(',').toLowerCase(), // Generate a searchable text field
        // Convert date string from JSON to a DateTime object for Prisma
        publicationDate: new Date(p.publicationDate),
        relevanceScore: p.relevanceScore,
        assignee: p.assignee,
        // Prisma's enum types need to be used directly, not as strings
        status: p.status ? PatentStatus[p.status as keyof typeof PatentStatus] : null,
        cpcCodes: p.cpcCodes || [], // Ensure array exists
        claims: p.claims || [],     // Ensure array exists
      },
    });
  }

  console.log(`Seeding finished. Created ${patentsData.length} patents.`);
}

// 4. Execute the main function and ensure the Prisma Client disconnects
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
