/**
 * API endpoints and configuration constants
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  ANALYZE_PROTOCOL: '/api/analysis/analyze',
  PARSE_PDF: '/api/protocol/parse-pdf',
  VALIDATE_PROTOCOL: '/api/protocol/validate',
  GET_ANALYSIS: '/api/analysis',
  CHAT_START: '/api/chat/start',
  CHAT_MESSAGE: '/api/chat',
  GET_HISTORY: '/api/history',
  GET_TRIAL: '/api/trials',
};

export const RISK_COLORS = {
  low: {
    bg: 'bg-success-100',
    text: 'text-success-700',
    border: 'border-success-300',
    gradient: 'from-success-400 to-success-600',
    chart: '#22c55e',
  },
  moderate: {
    bg: 'bg-warning-100',
    text: 'text-warning-700',
    border: 'border-warning-300',
    gradient: 'from-warning-400 to-warning-600',
    chart: '#f59e0b',
  },
  high: {
    bg: 'bg-danger-100',
    text: 'text-danger-700',
    border: 'border-danger-300',
    gradient: 'from-danger-400 to-danger-600',
    chart: '#f43f5e',
  },
};

export const RISK_CATEGORIES = {
  DESIGN: 'design',
  STATISTICAL: 'statistical',
  REGULATORY: 'regulatory',
  OPERATIONAL: 'operational',
};

export const PHASE_OPTIONS = [
  { value: 'phase1', label: 'Phase 1' },
  { value: 'phase2', label: 'Phase 2' },
  { value: 'phase3', label: 'Phase 3' },
  { value: 'phase4', label: 'Phase 4' },
];

export const THERAPEUTIC_AREAS = [
  'Oncology',
  'Cardiology',
  'Neurology',
  'Infectious Disease',
  'Immunology',
  'Endocrinology',
  'Gastroenterology',
  'Respiratory',
  'Dermatology',
  'Ophthalmology',
  'Psychiatry',
  'Rheumatology',
  'Other',
];

export const RANDOMIZATION_TYPES = [
  'Simple Randomization',
  'Block Randomization',
  'Stratified Randomization',
  'Adaptive Randomization',
  'Cluster Randomization',
];

export const BLINDING_LEVELS = [
  'Open Label',
  'Single Blind',
  'Double Blind',
  'Triple Blind',
];

export const TOAST_DURATION = 5000;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['application/pdf'];
