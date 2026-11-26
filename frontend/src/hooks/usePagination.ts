import * as React from 'react';

/**
 * Name Function: usePagination
 * Description: Generic client-side pagination hook that slices data arrays and manages current page, page size, and total pages.
 * Reason: Provides a unified pagination interface across Bookings, History, Rooms, and Users tables with automatic page boundary clamping.
 **/
export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to first page if filter changes drastically and current page is out of range
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems,
  };
}

export default usePagination;
