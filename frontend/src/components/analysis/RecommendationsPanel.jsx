/**
 * Panel displaying prioritized recommendations
 */

import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../common/Card';

const priorityConfig = {
  high: {
    bg: 'bg-danger-50',
    text: 'text-danger-700',
    border: 'border-danger-200',
    icon: AlertTriangle,
    label: 'High Priority',
  },
  medium: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    border: 'border-warning-200',
    icon: AlertTriangle,
    label: 'Medium Priority',
  },
  low: {
    bg: 'bg-primary-50',
    text: 'text-primary-700',
    border: 'border-primary-200',
    icon: CheckCircle,
    label: 'Low Priority',
  },
};

/**
 * @param {Object} props
 * @param {Array} props.recommendations - Array of recommendation objects
 */
const RecommendationsPanel = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-gray-500 text-center py-8">
            No recommendations available
          </p>
        </CardBody>
      </Card>
    );
  }

  // Sort by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold text-gray-900">Action Items</h2>
        <p className="text-sm text-gray-500 mt-1">
          Prioritized recommendations to improve protocol design
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        {sortedRecommendations.map((rec, index) => (
          <RecommendationItem
            key={rec.id || index}
            recommendation={rec}
            index={index}
          />
        ))}
      </CardBody>
    </Card>
  );
};

const RecommendationItem = ({ recommendation, index }) => {
  const priority = recommendation.priority || 'medium';
  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${config.text}`} />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold text-gray-900">
              {recommendation.title}
            </h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.text} whitespace-nowrap`}>
              {config.label}
            </span>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">
            {recommendation.description}
          </p>

          <div className="flex items-center flex-wrap gap-2">
            {recommendation.category && (
              <span className="px-2 py-1 bg-white/50 text-xs text-gray-600 rounded">
                {recommendation.category}
              </span>
            )}
            {recommendation.expected_risk_reduction != null && (
              <span className="px-2 py-1 bg-success-50 text-success-700 text-xs font-medium rounded border border-success-200">
                Risk Reduction: -{typeof recommendation.expected_risk_reduction === 'number'
                  ? `${Math.round(recommendation.expected_risk_reduction)}pts`
                  : recommendation.expected_risk_reduction}
              </span>
            )}
            {recommendation.difficulty && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                Effort: {recommendation.difficulty.charAt(0).toUpperCase() + recommendation.difficulty.slice(1)}
              </span>
            )}
          </div>

          {recommendation.action && (
            <div className="flex items-center gap-2 text-sm font-medium text-primary-600 mt-3">
              <ArrowRight className="w-4 h-4" />
              <span>{recommendation.action}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationsPanel;
