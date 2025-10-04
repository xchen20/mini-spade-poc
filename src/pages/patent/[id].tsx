import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ParsedUrlQuery } from 'querystring';
import { prisma } from 'prisma';
import type { Patent } from '@/types/patent';
import styles from '@/styles/PatentDetail.module.css';

interface PatentPageProps {
  patent: Patent;
}
interface IParams extends ParsedUrlQuery {
  id: string;
}

// Use getServerSideProps to fetch data from the database on each request
export const getServerSideProps: GetServerSideProps<PatentPageProps, IParams> = async (context) => {
  const { id } = context.params!;
  const patent = await prisma.patent.findUnique({
    where: { id },
  });

  // If patent is not found, return notFound to show a 404 page
  if (!patent) {
    return {
      notFound: true, // This will render the 404 page
    };
  };

  // Prisma's Date objects cannot be directly serialized to JSON, so we convert them
  return {
    props: {
      patent: {
        ...patent,
        publicationDate: patent.publicationDate.toISOString().split('T')[0],
        // Convert null to undefined for frontend-safe optional props
        assignee: patent.assignee ?? undefined,
        status: patent.status ?? undefined,
      },
    },
  };
};

const PatentPage: NextPage<PatentPageProps> = ({ patent }) => {
  // This branch should not be reached because getServerSideProps handles the notFound case
  if (!patent) {
    return (
      <div className={styles.container}>
        <p>Patent not found.</p>
        <Link href="/" className={styles.backLink}>&larr; Back to Search</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{patent.title} | Mini-SPADE</title>
        <meta name="description" content={patent.abstract.substring(0, 150)} />
      </Head>

      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>&larr; Back to Search</Link>

        <h1 className={styles.title}>{patent.title}</h1>
        <div className={styles.metaInfo}>
          <span className={styles.patentId}>{patent.id}</span>
          <span><strong>Publication Date:</strong> {patent.publicationDate}</span>
          {patent.assignee && <span><strong>Assignee:</strong> {patent.assignee}</span>}
          {patent.status && (
            <span className={styles.status} style={{ borderColor: patent.status === 'Active' ? 'var(--primary-color)' : '#888', color: patent.status === 'Active' ? 'var(--primary-color)' : '#888' }}>
              {patent.status}
            </span>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Inventors</h2>
          <ul className={styles.inventorList}>
            {patent.inventors.map((inventor) => (
              <li key={inventor}>{inventor}</li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Abstract</h2>
          <p className={styles.abstract}>{patent.abstract}</p>
        </div>

        {patent.claims && patent.claims.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Claims</h2>
            <div className={styles.claims}>
              {patent.claims.map((claim, index) => (
                <p key={index}>{claim}</p>
              ))}
            </div>
          </div>
        )}

        {patent.cpcCodes && patent.cpcCodes.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Classifications (CPC)</h2>
            <div className={styles.inventorList}>
              {patent.cpcCodes.map((code) => (
                <span key={code} className={styles.cpcCode}>{code}</span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatentPage;