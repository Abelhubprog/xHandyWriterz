import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/apps/main/components/ui/LoadingSpinner';

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  pagination?: PaginationProps;
  emptyMessage?: string;
}

export interface DataTableColumn<T> {
  header: string;
  key: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => ReactNode;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  pagination,
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`py-4 px-6 font-medium text-gray-600 text-${column.align || 'left'}`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-8 text-gray-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100">
                      {columns.map((column) => (
                        <td
                          key={`${row.id}-${column.key}`}
                          className={`py-4 px-6 text-${column.align || 'left'}`}
                        >
                          {column.render
                            ? column.render(row)
                            : (row as any)[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <TablePagination {...pagination} />
          )}
        </>
      )}
    </div>
  );
}

function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}: PaginationProps) {
  const startItem = ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
      <div className="text-sm text-gray-500">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          startIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          endIcon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
