/**
 * Loading state components with skeleton screens and spinners
 */

import { Loader2 } from 'lucide-react';

/**
 * Spinner component
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Loader2
      className={`animate-spin text-primary-600 ${sizeClasses[size]} ${className}`}
    />
  );
};

/**
 * Centered loading spinner
 */
export const LoadingSpinner = ({ message = 'Loading...', size = 'lg' }) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <Spinner size={size} />
    {message && <p className="text-gray-600 text-sm">{message}</p>}
  </div>
);

/**
 * Skeleton line
 */
export const SkeletonLine = ({ width = 'full', className = '' }) => {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
  };

  return (
    <div className={`h-4 bg-gray-200 rounded skeleton ${widthClasses[width]} ${className}`} />
  );
};

/**
 * Skeleton circle
 */
export const SkeletonCircle = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`bg-gray-200 rounded-full skeleton ${sizeClasses[size]} ${className}`} />
  );
};

/**
 * Skeleton card
 */
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-6 space-y-4 ${className}`}>
    <SkeletonLine width="3/4" />
    <SkeletonLine width="full" />
    <SkeletonLine width="1/2" />
  </div>
);

/**
 * Analysis results skeleton
 */
export const AnalysisSkeleton = () => (
  <div className="space-y-6 p-6">
    {/* Hero section */}
    <div className="flex items-center justify-center space-x-8 p-8 bg-white rounded-xl border border-gray-200">
      <SkeletonCircle size="xl" />
      <div className="space-y-3 flex-1 max-w-md">
        <SkeletonLine width="3/4" />
        <SkeletonLine width="1/2" />
      </div>
    </div>

    {/* Risk breakdown cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>

    {/* Detailed sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  </div>
);

/**
 * Progress bar with message
 */
export const ProgressBar = ({ progress = 0, message = '', stage = '' }) => (
  <div className="w-full space-y-3">
    {(message || stage) && (
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-700">{message || stage}</p>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
    )}
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

const LoadingState = ({ type = 'spinner', ...props }) => {
  const components = {
    spinner: LoadingSpinner,
    skeleton: AnalysisSkeleton,
    progress: ProgressBar,
  };

  const Component = components[type] || LoadingSpinner;
  return <Component {...props} />;
};

export default LoadingState;
