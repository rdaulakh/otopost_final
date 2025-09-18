// Loading Skeleton Component
import React from 'react';

const LoadingSkeleton = ({ 
  variant = 'text',
  width = '100%',
  height = 'auto',
  className = '',
  count = 1,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 rounded';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    none: '',
  };

  const variantClasses = {
    text: 'h-4',
    title: 'h-6',
    subtitle: 'h-5',
    paragraph: 'h-4',
    button: 'h-10',
    avatar: 'w-10 h-10 rounded-full',
    card: 'h-32',
    image: 'h-48',
    table: 'h-12',
  };

  const getSkeletonElement = (index) => {
    const combinedClasses = `
      ${baseClasses}
      ${animationClasses[animation]}
      ${variantClasses[variant]}
      ${className}
    `.trim();

    const style = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: height !== 'auto' ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    };

    return (
      <div
        key={index}
        className={combinedClasses}
        style={style}
      />
    );
  };

  if (count === 1) {
    return getSkeletonElement(0);
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, index) => getSkeletonElement(index))}
    </div>
  );
};

// Predefined skeleton layouts
export const SkeletonCard = ({ className = '' }) => (
  <div className={`p-4 border rounded-lg ${className}`}>
    <LoadingSkeleton variant="image" className="mb-4" />
    <LoadingSkeleton variant="title" className="mb-2" />
    <LoadingSkeleton variant="paragraph" count={2} />
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }, (_, index) => (
        <LoadingSkeleton key={index} variant="table" className="flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }, (_, colIndex) => (
          <LoadingSkeleton key={colIndex} variant="table" className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ items = 5, showAvatar = true, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className="flex items-center space-x-4">
        {showAvatar && <LoadingSkeleton variant="avatar" />}
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="title" width="60%" />
          <LoadingSkeleton variant="paragraph" width="80%" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonStats = ({ count = 4, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="p-4 border rounded-lg">
        <LoadingSkeleton variant="title" className="mb-2" />
        <LoadingSkeleton variant="subtitle" width="40%" />
      </div>
    ))}
  </div>
);

export const SkeletonChart = ({ className = '' }) => (
  <div className={`p-4 border rounded-lg ${className}`}>
    <LoadingSkeleton variant="title" className="mb-4" width="30%" />
    <LoadingSkeleton variant="image" height="200px" />
  </div>
);

export const SkeletonForm = ({ fields = 5, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: fields }, (_, index) => (
      <div key={index} className="space-y-2">
        <LoadingSkeleton variant="text" width="20%" />
        <LoadingSkeleton variant="button" />
      </div>
    ))}
    <LoadingSkeleton variant="button" width="30%" className="mt-6" />
  </div>
);

export default LoadingSkeleton;

