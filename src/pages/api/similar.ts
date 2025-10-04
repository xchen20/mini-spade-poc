import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'prisma';
import type { Patent } from '@/types/patent';

type Data = {
  results: Patent[];
};

// A simple list of English stop words
const STOP_WORDS = new Set(['a', 'an', 'the', 'in', 'on', 'of', 'for', 'to', 'with', 'is', 'was', 'and', 'or']);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'A patent ID is required' });
  }

  try {
    // Find the source patent and all other patents from the database
    const [sourcePatent, allOtherPatents] = await prisma.$transaction([
      prisma.patent.findUnique({ where: { id } }),
      prisma.patent.findMany({ where: { NOT: { id } } }),
    ]);

    if (!sourcePatent) {
      return res.status(404).json({ message: 'Source patent not found' });
    }

    // Mock AI similarity algorithm: based on keyword overlap
    const sourceKeywords = new Set(
      sourcePatent.abstract
        .toLowerCase()
        .replace(/[.,]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !STOP_WORDS.has(word))
    );

    const similarPatents = allOtherPatents
      .map(p => {
        const targetKeywords = new Set(p.abstract.toLowerCase().replace(/[.,]/g, '').split(/\s+/));
        const overlap = [...sourceKeywords].filter(keyword => targetKeywords.has(keyword)).length;
        // We need to manually format the date for the response
        return { ...p, publicationDate: p.publicationDate.toISOString().split('T')[0], similarity: overlap };
      })
      .filter(p => p.similarity > 1) // Require at least 2 keyword overlaps
      .sort((a, b) => b.similarity - a.similarity) // Sort by similarity score
      .slice(0, 3); // Return the top 3 most similar patents

    return res.status(200).json({ results: similarPatents });
  } catch (error) {
    console.error('API similar patents error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}