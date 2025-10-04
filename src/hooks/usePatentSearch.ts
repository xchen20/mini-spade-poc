import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import type { Patent } from '@/types/patent';
import { useDebounce } from './useDebounce';

const PAGE_SIZE = 10;

export function usePatentSearch() {
  // Search and result state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patent[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Advanced filter state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [inventors, setInventors] = useState('');

  // Debounced values for auto-searching
  const debouncedQuery = useDebounce(query, 500);
  const debouncedInventors = useDebounce(inventors, 500);
  const debouncedStartDate = useDebounce(startDate, 500);
  const debouncedEndDate = useDebounce(endDate, 500);

  // Router and mount state
  const router = useRouter();
  const isInitialMount = useRef(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchData = useCallback(async (params: URLSearchParams) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data.results);
      setTotalResults(data.totalResults);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError('Failed to fetch patent data. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (startDate) params.set('startDate', startDate.toISOString().split('T')[0]);
    if (endDate) params.set('endDate', endDate.toISOString().split('T')[0]);
    if (inventors) params.set('inventors', inventors);
    params.set('page', '1'); // A new search always starts from page 1
    router.push(`/?${params.toString()}`, undefined, { shallow: true });
  };

  const resetFilters = () => {
    setQuery('');
    setStartDate(null);
    setEndDate(null);
    setInventors('');
    router.push('/', undefined, { shallow: true });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (startDate) params.set('startDate', startDate.toISOString().split('T')[0]);
    if (endDate) params.set('endDate', endDate.toISOString().split('T')[0]);
    if (inventors) params.set('inventors', inventors);
    params.set('page', String(newPage));
    router.push(`/?${params.toString()}`, undefined, { shallow: true });
  };

  // Effect to sync URL to state and fetch data
  const routerQueryString = JSON.stringify(router.query);
  useEffect(() => {
    if (!router.isReady) return;

    const params = new URLSearchParams(router.asPath.split('?')[1] || '');
    if (!params.has('pageSize')) params.set('pageSize', String(PAGE_SIZE));

    if (isInitialMount.current) {
      const { query: urlQuery, startDate: urlStartDate, endDate: urlEndDate, inventors: urlInventors } = router.query;
      setQuery(typeof urlQuery === 'string' ? urlQuery : '');
      setInventors(typeof urlInventors === 'string' ? urlInventors : '');
      setStartDate(typeof urlStartDate === 'string' ? new Date(urlStartDate) : null);
      setEndDate(typeof urlEndDate === 'string' ? new Date(urlEndDate) : null);
    }

    fetchData(params);
    isInitialMount.current = false;
  }, [router.isReady, routerQueryString, fetchData, router.query, router.asPath]);

  // Effect for auto-searching on debounce
  useEffect(() => {
    if (isInitialMount.current) return;
    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, debouncedInventors, debouncedStartDate, debouncedEndDate]);

  return {
    states: { query, results, isLoading, error, hasSearched, showAdvanced, startDate, endDate, inventors, currentPage, totalPages, totalResults },
    setters: { setQuery, setShowAdvanced, setStartDate, setEndDate, setInventors },
    handlers: { resetFilters, handlePageChange },
  };
}