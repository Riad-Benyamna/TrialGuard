/**
 * Vertical timeline displaying risk findings
 */

import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../common/Card';
import { getRiskColor } from '../../utils/formatting';

const severityIcons = {
  high: AlertCircle,
  moderate: AlertTriangle,
  low: Info,
};

/**
 * @param {Object} props
 * @param {Array} props.findings - Array of findings from all categories
 */
const FindingsTimeline = ({ findings }) => {
  if (!findings || findings.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-gray-500 text-center py-8">
            No specific findings to display
          </p>
        </CardBody>
      </Card>
    );
  }

  // Sort findings by severity
  const sortedFindings = [...findings].sort((a, b) => {
    const severityOrder = { high: 3, moderate: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold text-gray-900">Key Findings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Detailed risk assessment by severity
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        {sortedFindings.map((finding, index) => (
          <FindingItem
            key={index}
            finding={finding}
            index={index}
            isLast={index === sortedFindings.length - 1}
          />
        ))}
      </CardBody>
    </Card>
  );
};

const FindingItem = ({ finding, index, isLast }) => {
  const severity = finding.severity || 'moderate';
  const colors = getRiskColor(severity);
  const Icon = severityIcons[severity] || AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative"
    >
      <div className="flex gap-4">
        {/* Timeline line and icon */}
        <div className="flex flex-col items-center">
          <div className={`p-2 rounded-full ${colors.bg} ring-4 ring-white shadow-sm`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          {!isLast && (
            <div className="flex-1 w-0.5 bg-gray-200 my-2" style={{ minHeight: '2rem' }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="font-semibold text-gray-900">
              {finding.title || finding.finding}
            </h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} whitespace-nowrap`}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </span>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            {finding.description || finding.details}
          </p>

          {finding.category && (
            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {finding.category}
            </span>
          )}

          {finding.recommendation && (
            <div className="mt-3 p-3 bg-primary-50 border-l-4 border-primary-500 rounded-r">
              <p className="text-sm text-primary-900">
                <span className="font-semibold">Recommendation: </span>
                {finding.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FindingsTimeline;
