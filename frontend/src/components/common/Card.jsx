/**
 * Reusable Card component with consistent styling
 */

import { motion } from 'framer-motion';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hover - Enable hover effect
 * @param {boolean} props.glass - Glass morphism effect
 * @param {Function} props.onClick - Click handler
 */
const Card = ({
  children,
  className = '',
  hover = false,
  glass = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'rounded-xl border transition-all duration-200';
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  const glassClasses = glass ? 'glass' : 'bg-white border-gray-200 shadow-sm';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const Component = hover || onClick ? motion.div : 'div';
  const motionProps = hover || onClick ? {
    whileHover: { y: -4 },
    transition: { duration: 0.2 },
  } : {};

  return (
    <Component
      onClick={onClick}
      className={`
        ${baseClasses}
        ${hoverClasses}
        ${glassClasses}
        ${clickableClasses}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Card Header component
 */
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Body component
 */
export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Footer component
 */
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
