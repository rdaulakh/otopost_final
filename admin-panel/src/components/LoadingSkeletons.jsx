import React from 'react';

// Dashboard Skeleton Component
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="mt-4">
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 mt-2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Table Skeleton Component
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Table Header Skeleton */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Table Body Skeleton */}
      <div className="divide-y">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex items-center space-x-4">
              {[...Array(columns)].map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`h-4 bg-gray-200 rounded animate-pulse ${
                    colIndex === 0 ? 'w-8' : colIndex === columns - 1 ? 'w-16' : 'w-24'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Card Skeleton Component
export const CardSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );
};

// List Skeleton Component
export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};

// Form Skeleton Component
export const FormSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-3">
        <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
    </div>
  );
};

// Chart Skeleton Component
export const ChartSkeleton = ({ height = 300 }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div 
        className="bg-gray-200 rounded animate-pulse"
        style={{ height: `${height}px` }}
      ></div>
    </div>
  );
};

// Modal Skeleton Component
export const ModalSkeleton = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  DashboardSkeleton,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,
  FormSkeleton,
  ChartSkeleton,
  ModalSkeleton
};

