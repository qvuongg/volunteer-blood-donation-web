const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page with 2 pages on each side
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      // Adjust if at the beginning or end
      if (currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      // Add first page and ellipsis
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
        Hiển thị {startItem} - {endItem} của {totalItems}
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
        <button
          className="btn btn-sm btn-outline"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          style={{ minWidth: '80px' }}
        >
          Trước
        </button>

        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                style={{
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  color: 'var(--text-secondary)'
                }}
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handlePageClick(page)}
                style={{ minWidth: '40px' }}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          className="btn btn-sm btn-outline"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          style={{ minWidth: '80px' }}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default Pagination;

