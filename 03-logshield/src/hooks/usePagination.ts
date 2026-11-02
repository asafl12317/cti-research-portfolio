import { useState, useMemo } from 'react';

interface UsePaginationReturn<T> {
  page: number;
  totalPages: number;
  pageItems: T[];
  goToPage: (p: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function usePagination<T>(
  items: T[],
  pageSize = 25,
): UsePaginationReturn<T> {
  const [requestedPage, setRequestedPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / pageSize),
  );

  const page = Math.min(requestedPage, totalPages);

  const pageItems = useMemo(
    () => items.slice(
      (page - 1) * pageSize,
      page * pageSize,
    ),
    [items, page, pageSize],
  );

  const goToPage = (p: number) => {
    setRequestedPage(
      Math.min(Math.max(1, p), totalPages),
    );
  };

  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);

  return {
    page,
    totalPages,
    pageItems,
    goToPage,
    nextPage,
    prevPage,
  };
}
