/**
 * Historical comparison table with color coding
 */

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../common/Card';
import { formatDate, formatNumber, getRiskColor } from '../../utils/formatting';

/**
 * @param {Object} props
 * @param {Object} props.currentTrial - Current trial data
 * @param {Array} props.historicalTrials - Array of similar historical trials
 */
const HistoricalComparison = ({ currentTrial, historicalTrials }) => {
  if (!historicalTrials || historicalTrials.length === 0) {
    return null;
  }

  const trials = [
    {
      ...currentTrial,
      isCurrent: true,
      trial_name: currentTrial.trial_name || 'Current Trial',
    },
    ...historicalTrials.slice(0, 4),
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold text-gray-900">Historical Comparison</h2>
        <p className="text-sm text-gray-500 mt-1">
          Compare with similar trials in the same therapeutic area
        </p>
      </CardHeader>
      <CardBody className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Trial Name
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Phase
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Enrollment
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Risk Score
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Similarity
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Outcome
              </th>
            </tr>
          </thead>
          <tbody>
            {trials.map((trial, index) => (
              <TrialRow
                key={index}
                trial={trial}
                currentScore={currentTrial.overall_score}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
};

const TrialRow = ({ trial, currentScore, index }) => {
  const colors = getRiskColor(trial.overall_score);
  const diff = trial.isCurrent ? 0 : currentScore - trial.overall_score;
  const showComparison = !trial.isCurrent;

  const getComparisonIcon = () => {
    if (Math.abs(diff) < 5) return Minus;
    return diff > 0 ? TrendingUp : TrendingDown;
  };

  const getComparisonColor = () => {
    if (Math.abs(diff) < 5) return 'text-gray-400';
    return diff > 0 ? 'text-danger-600' : 'text-success-600';
  };

  const ComparisonIcon = getComparisonIcon();

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        border-b border-gray-100 hover:bg-gray-50 transition-colors
        ${trial.isCurrent ? 'bg-primary-50 font-medium' : ''}
      `}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {trial.isCurrent && (
            <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded">
              Current
            </span>
          )}
          <span className="text-gray-900">{trial.trial_name || trial.nct_id}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-gray-600">
        {trial.phase || 'N/A'}
      </td>
      <td className="py-3 px-4 text-gray-600">
        {formatNumber(trial.target_enrollment || trial.enrollment)}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">
            {Math.round(trial.overall_score)}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
            {trial.overall_score < 30 ? 'Low' : trial.overall_score < 70 ? 'Mod' : 'High'}
          </span>
        </div>
      </td>
      <td className="py-3 px-4 text-gray-600">
        {!trial.isCurrent && trial.similarity_score
          ? `${Math.round(trial.similarity_score * 100)}%`
          : trial.isCurrent ? '--' : 'N/A'}
      </td>
      <td className="py-3 px-4 text-gray-600 text-sm">
        {!trial.isCurrent
          ? (Array.isArray(trial.failure_reasons) && trial.failure_reasons.length > 0
              ? trial.failure_reasons[0]
              : trial.outcome || 'N/A')
          : '--'}
      </td>
    </motion.tr>
  );
};

export default HistoricalComparison;
