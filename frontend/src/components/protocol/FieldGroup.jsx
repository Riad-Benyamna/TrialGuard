/**
 * Reusable form field group component
 */

import { AlertCircle } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {boolean} props.required - Required field
 * @param {string} props.error - Error message
 * @param {string} props.description - Help text
 * @param {React.ReactNode} props.children - Field input
 */
const FieldGroup = ({
  label,
  required = false,
  error,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {children}

      {error && (
        <div className="flex items-center gap-2 text-danger-600 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FieldGroup;
