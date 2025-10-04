import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Patent } from '@prisma/client';

const prisma = new PrismaClient();

type Data = {
  results: Patent[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { query, startDate, endDate, inventors, page = '1', pageSize = '10' } = req.query;

  const currentPageNum = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const pageSizeNum = parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10);

  // 1. Build Prisma 'where' clause based on query parameters
  const where: any = {};
  if (typeof query === 'string' && query.trim()) {
    const lowercasedQuery = query.toLowerCase();
    where.OR = [
      { title: { contains: lowercasedQuery, mode: 'insensitive' } },
      { abstract: { contains: lowercasedQuery, mode: 'insensitive' } },
    ];
  }

  if (typeof startDate === 'string' && startDate) {
    where.publicationDate = { ...where.publicationDate, gte: new Date(startDate) };
  }
  if (typeof endDate === 'string' && endDate) {
    where.publicationDate = { ...where.publicationDate, lte: new Date(endDate) };
  }

  if (typeof inventors === 'string' && inventors.trim()) {
    // Use the new 'inventorsText' field for partial, case-insensitive search
    where.inventorsText = { contains: inventors.toLowerCase(), mode: 'insensitive' };
  }

  try {
    // 2. Execute two DB queries in parallel: one for the total count, one for the paginated data
    const [totalResults, results] = await prisma.$transaction([
      prisma.patent.count({ where }),
      prisma.patent.findMany({
        where,
        orderBy: {
          relevanceScore: 'desc',
        },
        skip: (currentPageNum - 1) * pageSizeNum,
        take: pageSizeNum,
      }),
    ]);

    const totalPages = Math.ceil(totalResults / pageSizeNum);

    res.status(200).json({
      results,
      totalResults,
      totalPages,
      currentPage: currentPageNum,
    });
  } catch (error) {
    console.error('API search error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
