import { Caption, Text2 } from "@workspace/page-primitives";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from "@workspace/ui/components/pagination";
import { useTheme } from "../contexts/theme-context";

interface EnhancedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

export function EnhancedPagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  showInfo = true,
  totalItems,
  itemsPerPage,
}: EnhancedPaginationProps) {
  const { theme: uiTheme } = useTheme();
  const { theme } = uiTheme;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Pages to show around current page
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if total is small
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    // Add ellipsis if needed
    if (currentPage > delta + 2) {
      pages.push("...");
    }

    // Add pages around current page
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (currentPage < totalPages - delta - 1) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate item range for display
  const getItemRange = () => {
    if (!totalItems || !itemsPerPage) return null;
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return { start, end };
  };

  const itemRange = getItemRange();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Info display */}
      {showInfo && (
        <div className="text-sm text-gray-600">
          {itemRange ? (
            <Text2 theme={theme}>
              Showing {itemRange.start} to {itemRange.end} of {totalItems} results
            </Text2>
          ) : (
            <Text2 theme={theme}>
              Page {currentPage} of {totalPages}
            </Text2>
          )}
        </div>
      )}

      {/* Pagination controls */}
      <Pagination>
        <PaginationContent className="flex items-center space-x-1">
          {/* Previous button */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!disabled && currentPage > 1) onPageChange(currentPage - 1);
              }}
              aria-disabled={
                disabled || currentPage === 1 || totalPages === 0
                  ? "true"
                  : undefined
              }
              className={
                disabled || currentPage === 1 || totalPages === 0
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>

          {/* Page numbers */}
          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!disabled && page !== currentPage) {
                      onPageChange(page as number);
                    }
                  }}
                  isActive={page === currentPage}
                  aria-disabled={disabled ? "true" : undefined}
                  className={disabled ? "pointer-events-none opacity-50" : ""}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next button */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!disabled && currentPage < totalPages)
                  onPageChange(currentPage + 1);
              }}
              aria-disabled={
                disabled || currentPage === totalPages || totalPages === 0
                  ? "true"
                  : undefined
              }
              className={
                disabled || currentPage === totalPages || totalPages === 0
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
