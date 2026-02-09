/**
 * Grid of cards showing risk breakdown by category
 */

import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Shield, Settings } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import { getRiskColor, formatPercent } from '../../utils/formatting';

const categoryIcons = {
  design: BarChart3,
  statistical: TrendingUp,
  regulatory: Shield,
  operational: Settings,
};

/**
 * @param {Object} props
 * @param {Array} props.breakdown - Array of risk category data
 */
const RiskBreakdownCards = ({ breakdown }) => {
  if (!breakdown || breakdown.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {breakdown.map((category, index) => (
        <CategoryCard
          key={category.category}
          category={category}
          index={index}
        />
      ))}
    </div>
  );
};

const CategoryCard = ({ category, index }) => {
  const colors = getRiskColor(category.score);
  const Icon = categoryIcons[category.category.toLowerCase()] || BarChart3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card hover className="h-full">
        <CardBody className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-lg ${colors.bg}`}>
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
              {category.level.toUpperCase()}
            </span>
          </div>

          {/* Category name */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {category.category} Risk
            </h3>
          </div>

          {/* Score display */}
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(category.score)}
              </span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${category.score}%` }}
                transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
              />
            </div>
          </div>

          {/* Findings count */}
          {category.findings && category.findings.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{category.findings.length}</span>
                {' '}finding{category.findings.length !== 1 ? 's' : ''} identified
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default RiskBreakdownCards;
