/**
 * Data formatting utilities
 */

import { RISK_COLORS } from './constants';

/**
 * Get risk level from score
 * @param {number} score - Risk score (0-100)
 * @returns {string} Risk level (low, moderate, high)
 */
export const getRiskLevel = (score) => {
  if (score < 30) return 'low';
  if (score < 70) return 'moderate';
  return 'high';
};

/**
 * Get risk color configuration
 * @param {number|string} scoreOrLevel - Risk score or level
 * @returns {Object} Color configuration
 */
export const getRiskColor = (scoreOrLevel) => {
  const level = typeof scoreOrLevel === 'number'
    ? getRiskLevel(scoreOrLevel)
    : scoreOrLevel;
  return RISK_COLORS[level] || RISK_COLORS.moderate;
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format percentage
 * @param {number} value - Decimal value (0-1) or percentage (0-100)
 * @param {boolean} isDecimal - Whether input is decimal
 * @returns {string} Formatted percentage
 */
export const formatPercent = (value, isDecimal = false) => {
  if (value === null || value === undefined) return 'N/A';
  const percent = isDecimal ? value * 100 : value;
  return `${Math.round(percent)}%`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate color for category
 * @param {string} category - Category name
 * @returns {string} Hex color code
 */
export const getCategoryColor = (category) => {
  const colors = {
    design: '#6366f1',
    statistical: '#8b5cf6',
    regulatory: '#ec4899',
    operational: '#f59e0b',
    safety: '#ef4444',
    efficacy: '#10b981',
  };
  return colors[category.toLowerCase()] || '#6b7280';
};

/**
 * Parse risk breakdown from analysis
 * @param {Object} analysis - Analysis result
 * @returns {Array} Risk breakdown data
 */
export const parseRiskBreakdown = (analysis) => {
  if (!analysis?.risk_breakdown) return [];

  return Object.entries(analysis.risk_breakdown).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    score: data.score || 0,
    level: getRiskLevel(data.score || 0),
    findings: data.findings || [],
  }));
};

/**
 * Parse recommendations from analysis
 * @param {Object} analysis - Analysis result
 * @returns {Array} Recommendations data
 */
export const parseRecommendations = (analysis) => {
  if (!analysis?.recommendations) return [];

  return analysis.recommendations.map((rec, idx) => ({
    id: idx,
    title: rec.title || rec.recommendation,
    description: rec.description || rec.details,
    priority: rec.priority || 'medium',
    category: rec.category || 'general',
  }));
};

/**
 * Parse historical comparison data for charts
 * @param {Array} historicalData - Historical trials data
 * @returns {Array} Chart data
 */
export const parseHistoricalChartData = (historicalData) => {
  if (!Array.isArray(historicalData)) return [];

  return historicalData.map((trial) => ({
    name: trial.trial_name || trial.nct_id,
    score: trial.overall_score || 0,
    phase: trial.phase,
    year: trial.year || new Date(trial.date).getFullYear(),
  }));
};

/**
 * Calculate score difference
 * @param {number} current - Current score
 * @param {number} baseline - Baseline score
 * @returns {Object} Difference data
 */
export const calculateDifference = (current, baseline) => {
  const diff = current - baseline;
  return {
    value: Math.abs(diff),
    isPositive: diff > 0,
    formatted: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`,
  };
};

/**
 * Group findings by severity
 * @param {Array} findings - Findings array
 * @returns {Object} Grouped findings
 */
export const groupFindingsBySeverity = (findings) => {
  if (!Array.isArray(findings)) return { high: [], moderate: [], low: [] };

  return findings.reduce((acc, finding) => {
    const severity = finding.severity || 'moderate';
    if (!acc[severity]) acc[severity] = [];
    acc[severity].push(finding);
    return acc;
  }, { high: [], moderate: [], low: [] });
};

/**
 * Format duration in days
 * @param {number} days - Number of days
 * @returns {string} Formatted duration
 */
export const formatDuration = (days) => {
  if (!days) return 'N/A';

  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
};

/**
 * Sanitize HTML content
 * @param {string} html - HTML string
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};
