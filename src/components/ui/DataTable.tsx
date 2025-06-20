import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, Download, MoreHorizontal } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  onRowClick?: (row: T, index: number) => void;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  emptyStateType?: 'companies' | 'users' | 'investments' | 'reports' | 'search' | 'general' | 'analytics' | 'activities' | 'portfolio' | 'marketplace';
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  actions?: {
    label: string;
    onClick: (row: T) => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}

type SortDirection = 'asc' | 'desc' | null;

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  filterable = false,
  exportable = false,
  selectable = false,
  onRowSelect,
  onRowClick,
  pageSize = 10,
  className = '',
  emptyMessage = 'No data available',
  emptyStateType = 'general',
  onEmptyAction,
  emptyActionLabel,
  actions = [],
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleRowSelect = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    
    if (onRowSelect) {
      const selectedData = Array.from(newSelected).map(i => paginatedData[i]);
      onRowSelect(selectedData);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    } else {
      const allIndices = new Set(paginatedData.map((_, index) => index));
      setSelectedRows(allIndices);
      onRowSelect?.(paginatedData);
    }
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      columns.map(col => col.title).join(','),
      ...filteredData.map(row =>
        columns.map(col => {
          const value = row[col.key as keyof T];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp size={16} className="ml-1" /> : 
      <ChevronDown size={16} className="ml-1" />;
  };

  return (
    <div className={`bg-slate-800 rounded-lg overflow-hidden ${className}`}>
      {/* Header with search and actions */}
      {(searchable || filterable || exportable) && (
        <div className="p-3 sm:p-4 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {searchable && (
              <div className="relative flex-1 sm:flex-none">
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={14} className="sm:w-4 sm:h-4" />}
                  className="w-full sm:w-48 lg:w-64"
                  fullWidth
                />
              </div>
            )}

            {filterable && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Filter size={14} className="sm:w-4 sm:h-4" />}
                className="w-full sm:w-auto"
              >
                <span className="sm:inline">Filter</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {exportable && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                leftIcon={<Download size={14} className="sm:w-4 sm:h-4" />}
                className="w-full sm:w-auto"
              >
                <span className="sm:inline">Export</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto -mx-3 sm:-mx-4">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <thead className="bg-slate-700">
              <tr>
                {selectable && (
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500"
                    />
                  </th>
                )}

                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`
                      px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-slate-300
                      ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                      ${column.sortable ? 'cursor-pointer hover:text-white' : ''}
                      ${column.className || ''}
                    `}
                    style={{ width: column.width }}
                    onClick={() => handleSort(String(column.key))}
                  >
                    <div className="flex items-center">
                      <span className="truncate">{column.title}</span>
                      {column.sortable && renderSortIcon(String(column.key))}
                    </div>
                  </th>
                ))}

                {actions.length > 0 && (
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium text-slate-300">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
          
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="px-2 sm:px-4 py-6 sm:py-8 text-center">
                  <LoadingSpinner size="lg" />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="p-0">
                  <EmptyState
                    type={emptyStateType}
                    title={searchTerm ? 'No Results Found' : undefined}
                    message={searchTerm ?
                      `No results found for "${searchTerm}". Try adjusting your search criteria.` :
                      emptyMessage
                    }
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                    secondaryActionLabel={searchTerm ? 'Clear Search' : undefined}
                    onSecondaryAction={searchTerm ? () => setSearchTerm('') : undefined}
                    size="md"
                    className="py-8 sm:py-12"
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={`
                    hover:bg-slate-700/50 transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${selectedRows.has(index) ? 'bg-yellow-500/10' : ''}
                  `}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {selectable && (
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleRowSelect(index)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500"
                      />
                    </td>
                  )}

                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`
                        px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-300
                        ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                        ${column.className || ''}
                      `}
                    >
                      <div className="min-w-0">
                        {column.render
                          ? column.render(row[column.key as keyof T], row, index)
                          : <span className="truncate block">{String(row[column.key as keyof T] || '')}</span>
                        }
                      </div>
                    </td>
                  ))}

                  {actions.length > 0 && (
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            size="sm"
                            variant={action.variant || 'secondary'}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            leftIcon={action.icon}
                            className="text-xs"
                          >
                            <span className="hidden sm:inline">{action.label}</span>
                            <span className="sm:hidden">{action.icon}</span>
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-3 sm:px-4 py-3 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="text-xs"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            <span className="text-xs sm:text-sm text-slate-300 px-2">
              <span className="hidden sm:inline">Page {currentPage} of {totalPages}</span>
              <span className="sm:hidden">{currentPage}/{totalPages}</span>
            </span>

            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="text-xs"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
