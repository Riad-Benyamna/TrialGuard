/**
 * Animated circular progress displaying overall risk score
 */

import { motion } from 'framer-motion';
import { Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { getRiskLevel, getRiskColor } from '../../utils/formatting';

/**
 * @param {Object} props
 * @param {number} props.score - Overall risk score (0-100)
 * @param {string} props.trialName - Trial name
 */
const RiskScoreHero = ({ score, trialName }) => {
  const riskLevel = getRiskLevel(score);
  const colors = getRiskColor(score);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getLevelLabel = (level) => {
    const labels = {
      low: 'Low Risk',
      moderate: 'Moderate Risk',
      high: 'High Risk',
    };
    return labels[level];
  };

  const getLevelDescription = (level) => {
    const descriptions = {
      low: 'This protocol demonstrates strong design principles with minimal identified risks.',
      moderate: 'Some areas of concern identified that warrant attention and mitigation strategies.',
      high: 'Multiple significant risks detected that require immediate attention and protocol revision.',
    };
    return descriptions[level];
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg p-8 md:p-12">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
        {/* Circular progress */}
        <div className="relative">
          <svg className="transform -rotate-90" width="200" height="200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              stroke={`url(#gradient-${riskLevel})`}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient id="gradient-moderate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="gradient-high" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
          </svg>

          {/* Score display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <div className="text-5xl font-bold text-gray-900">{Math.round(score)}</div>
              <div className="text-sm text-gray-500 text-center">Risk Score</div>
            </motion.div>
          </div>
        </div>

        {/* Risk level info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 max-w-lg text-center md:text-left"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {trialName}
          </h1>

          <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
              {getLevelLabel(riskLevel)}
            </span>
          </div>

          <p className="text-gray-600 leading-relaxed">
            {getLevelDescription(riskLevel)}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {score < 30 ? 'A' : score < 70 ? 'B' : 'C'}
              </div>
              <div className="text-xs text-gray-500">Grade</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {100 - Math.round(score)}
              </div>
              <div className="text-xs text-gray-500">Confidence</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-center">
                {score < 30 ? (
                  <Check className="w-7 h-7 text-success-600" />
                ) : score < 70 ? (
                  <AlertTriangle className="w-7 h-7 text-warning-600" />
                ) : (
                  <AlertCircle className="w-7 h-7 text-danger-600" />
                )}
              </div>
              <div className="text-xs text-gray-500">Alert</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RiskScoreHero;
