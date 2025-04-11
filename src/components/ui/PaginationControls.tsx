
import React from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const handlePageChange = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault();
    onPageChange(page);
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => Math.abs(p - currentPage) < 2 || p === 1 || p === totalPages)
          .map((p, i, arr) => {
            // Add ellipsis
            if (i > 0 && p > arr[i - 1] + 1) {
              return (
                <PaginationItem key={`ellipsis-${p}`}>
                  <span className="flex h-9 w-9 items-center justify-center">
                    ...
                  </span>
                </PaginationItem>
              );
            }
            
            return (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  onClick={(e) => handlePageChange(e, p)}
                  isActive={currentPage === p}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            );
          })}
        
        <PaginationItem>
          <PaginationNext 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
