import { useState, FC } from 'react';
import Head from 'next/head';
import DatePicker from 'react-datepicker';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';
import Highlight from '@/components/Highlight';
import Modal from '@/components/Modal';
import SkeletonCard from '@/components/SkeletonCard';
import Spinner from '@/components/Spinner';
import { usePatentSearch } from '@/hooks/usePatentSearch';
import type { Patent } from '@/types/patent';

const Home: FC = () => {
  const {
    states: { query, results, isLoading, error, hasSearched, showAdvanced, startDate, endDate, inventors, currentPage, totalPages, totalResults },
    setters: { setQuery, setShowAdvanced, setStartDate, setEndDate, setInventors },
    handlers: { resetFilters, handlePageChange },
  } = usePatentSearch();

  // State for the "Find Similar" modal, kept separate as it's specific to this page
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [similarPatents, setSimilarPatents] = useState<Patent[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);

  const handleFindSimilar = async (patent: Patent): Promise<void> => {
    setSelectedPatent(patent);
    setIsModalOpen(true);
    setIsSimilarLoading(true);
    setSimilarPatents([]);

    try {
      const response = await fetch(`/api/similar?id=${patent.id}`);
      const data = await response.json();
      if (response.ok) {
        setSimilarPatents(data.results);
      } else {
        console.error('Failed to fetch similar patents:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch similar patents', error);
    } finally {
      setIsSimilarLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Mini-SPADE | Patent Search</title>
        <meta name="description" content="A mini proof-of-concept for Garden Intelligence's SPADE platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          🌱 Mini-SPADE
        </h1>

        <p className={styles.description}>
          AI-Powered Prior Art Discovery
        </p>

        <div className={styles.searchForm}>
          <div className={styles.searchInputContainer}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for patents by keyword..."
              className={styles.searchInput}
            />
            {isLoading && <Spinner />}
          </div>
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className={styles.advancedButton}>
            {showAdvanced ? 'Hide' : 'Advanced'}
          </button>
        </div>

        {showAdvanced && (
          <div className={styles.advancedSearchContainer}>
            <div className={styles.filterGroup}>
              <label>Publication Date</label>
              <div className={styles.datePickerGroup}>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
                  className={styles.datePickerInput}
                  isClearable
                />
                <span>to</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate ? startDate : undefined}
                  placeholderText="End Date"
                  className={styles.datePickerInput}
                  isClearable
                />
              </div>
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="inventors-input">Inventors</label>
              <input id="inventors-input" type="text" value={inventors} onChange={(e) => setInventors(e.target.value)} placeholder="e.g., John Doe" className={styles.searchInput} />
            </div>
            <button onClick={resetFilters} className={styles.resetButton}>Reset Filters</button>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.resultsContainer}>
          {isLoading ? (
            // Render skeleton cards while loading
            Array.from({ length: 5 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : hasSearched && results.length === 0 ? (
            <p>No patents found for your query.</p>
          ) : (
            results.map((patent) => (
              <Link key={patent.id} href={`/patent/${patent.id}`} passHref legacyBehavior>
                <a className={styles.patentCardLink}>
                  <div className={styles.patentCard}>
                    <div className={styles.patentHeader}>
                      <h2 className={styles.patentTitle}>
                        <Highlight text={patent.title} highlight={query} />
                      </h2>
                      <span className={styles.patentId}>{patent.id}</span>
                    </div>
                    <p className={styles.patentAbstract}>
                      <Highlight text={patent.abstract} highlight={query} />
                    </p>
                    <div className={styles.patentFooter}>
                      <span>Inventors: {patent.inventors.join(', ')}</span>
                      <span>Published: {patent.publicationDate}</span>
                      <button onClick={(e) => { e.preventDefault(); handleFindSimilar(patent); }} className={styles.similarButton}>
                        Find Similar
                      </button>
                    </div>
                  </div>
                </a>
              </Link>
            ))
          )}
        </div>

        {!isLoading && totalResults > 0 && (
          <div className={styles.paginationContainer}>
            <span className={styles.paginationInfo}>
              Page {currentPage} of {totalPages} ({totalResults} results)
            </span>
            <div className={styles.paginationControls}>
              <button className={styles.paginationButton} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
                &larr; Previous
              </button>
              <button className={styles.paginationButton} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
                Next &rarr;
              </button>
            </div>
          </div>
        )}

      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Patents similar to "${selectedPatent?.title}"`}
      >
        {isSimilarLoading ? (
          <p>Finding similar patents using AI...</p>
        ) : similarPatents.length > 0 ? (
          <div className={styles.resultsContainer}>
            {similarPatents.map((p) => (
              <Link key={p.id} href={`/patent/${p.id}`} passHref legacyBehavior>
                <a className={styles.patentCardLink} onClick={() => setIsModalOpen(false)}>
                  <div className={styles.patentCard}>
                    <div className={styles.patentHeader}>
                      <h2 className={styles.patentTitle}>{p.title}</h2>
                      <span className={styles.patentId}>{p.id}</span>
                    </div>
                    <p className={styles.patentAbstract}>{p.abstract}</p>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <p>No similar patents found.</p>
        )}
      </Modal>

    </div>
  );
};

export default Home;