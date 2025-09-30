import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

/**
 * Pagination Component
 * 
 * A reusable pagination component with first, previous, next, and last page controls.
 * Optionally shows page numbers and adapts to available space.
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxPageButtons = 5
}) => {
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate range to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;
    
    // Adjust if we're near the end
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  // Button styles
  const baseButtonStyle = "flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md";
  const activeButtonStyle = "bg-indigo-50 border-indigo-500 text-indigo-600";
  const inactiveButtonStyle = "bg-white text-gray-700 hover:bg-gray-50";
  const disabledButtonStyle = "bg-gray-100 text-gray-400 cursor-not-allowed";

  return (
    <nav className="flex items-center justify-between" aria-label="Pagination">
      <div className="flex-1 flex justify-between sm:justify-start gap-2">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${baseButtonStyle} ${currentPage === 1 ? disabledButtonStyle : inactiveButtonStyle}`}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        
        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${baseButtonStyle} ${currentPage === 1 ? disabledButtonStyle : inactiveButtonStyle}`}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {/* Page numbers */}
        {showPageNumbers && (
          <div className="hidden md:flex">
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`${baseButtonStyle} ${
                  currentPage === page ? activeButtonStyle : inactiveButtonStyle
                }`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>
        )}
        
        {/* Current page indicator for mobile */}
        <span className="md:hidden px-3 py-2 text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        
        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${baseButtonStyle} ${currentPage === totalPages ? disabledButtonStyle : inactiveButtonStyle}`}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        
        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${baseButtonStyle} ${currentPage === totalPages ? disabledButtonStyle : inactiveButtonStyle}`}
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
