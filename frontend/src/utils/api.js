/**
 * API client utilities
 * Backend uses SSE for analysis streaming, so we use fetch + EventSource patterns
 */

import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './constants';

// Create axios instance for simple JSON requests
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - unwrap data
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * Analyze protocol from structured form data.
 * Backend returns SSE stream, so we use fetch() and parse the stream.
 * Returns a Promise that resolves with the final analysis result.
 */
export const analyzeProtocol = async (protocolData) => {
  const url = `${API_BASE_URL}${API_ENDPOINTS.ANALYZE_PROTOCOL}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      protocol: protocolData,
      use_function_calling: true,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Analysis failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.errors) {
        // Handle validation errors
        const errors = Array.isArray(errorData.errors) 
          ? errorData.errors.map(e => `${e.field}: ${e.message}`).join("; ")
          : JSON.stringify(errorData.errors);
        errorMessage = `Validation error: ${errors}`;
      }
    } catch (e) {
      // If can't parse JSON, try text
      try {
        const text = await response.text();
        if (text) errorMessage = `Analysis failed: ${response.status} - ${text.substring(0, 200)}`;
      } catch (e2) {
        // Ignore
      }
    }
    throw new Error(errorMessage);
  }

  // Parse SSE stream to get the final result
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = null;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE format: "event: <type>\ndata: <json>\n\n"
    const lines = buffer.split('\n');
    buffer = '';

    let currentEvent = '';
    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEvent = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const dataStr = line.slice(5).trim();
        if (!dataStr) continue;
        try {
          const data = JSON.parse(dataStr);
          if (currentEvent === 'complete' && data.analysis) {
            result = data;
          }
        } catch (e) {
          // partial data, continue
        }
      }
      // Lines that don't start with event: or data: (like empty lines) are just SSE delimiters
    }
  }

  if (!result) {
    throw new Error('Analysis completed but no result was returned');
  }

  // Unwrap nested analysis and reshape to match frontend expectations
  const raw = result.analysis || result;

  // Normalize severity: backend uses 'medium'/'critical', frontend expects 'moderate'/'high'
  const normalizeSeverity = (s) => {
    if (s === 'medium') return 'moderate';
    if (s === 'critical') return 'high';
    return s || 'moderate';
  };

  // Build risk_breakdown from category_scores (frontend expects { category: { score, findings } })
  const categoryScores = raw.risk_score?.category_scores || [];
  const riskBreakdown = {};
  for (const cs of categoryScores) {
    const catName = cs.category || 'design_completeness';
    riskBreakdown[catName] = {
      score: cs.score || 0,
      findings: (raw.findings || [])
        .filter(f => f.category === catName)
        .map(f => ({
          title: f.title,
          description: f.description,
          severity: normalizeSeverity(f.severity),
          evidence: f.evidence || [],
          recommendation: f.recommendation,
        })),
    };
  }

  return {
    analysis_id: result.analysis_id || raw.analysis_id,
    overall_score: raw.risk_score?.overall_score ?? 0,
    risk_level: raw.risk_score?.risk_level || 'moderate',
    confidence: raw.risk_score?.confidence ?? 0.8,
    risk_breakdown: riskBreakdown,
    findings: raw.findings || [],
    recommendations: (raw.recommendations || []).map(r => {
      // Backend sends priority as integer (1=highest), frontend expects 'high'/'medium'/'low'
      let priority = r.priority;
      if (typeof priority === 'number') {
        priority = priority <= 1 ? 'high' : priority <= 3 ? 'medium' : 'low';
      }
      return {
        title: r.title,
        description: r.description,
        priority: priority || 'medium',
        category: r.impact_category || r.category || 'general',
        expected_risk_reduction: r.expected_risk_reduction,
        difficulty: r.difficulty,
      };
    }),
    historical_trials: (raw.similar_trials || []).map(t => ({
      nct_id: t.nct_id,
      trial_name: t.trial_name,
      phase: t.phase,
      therapeutic_area: t.therapeutic_area,
      drug_class: t.drug_class,
      outcome: t.outcome,
      similarity_score: t.similarity_score,
      overall_score: (t.similarity_score || 0.5) * 100,
      key_learnings: t.key_learnings || [],
      failure_reasons: t.failure_reasons,
    })),
    executive_summary: raw.executive_summary || '',
    processing_time_seconds: raw.processing_time_seconds,
  };
};

/**
 * Analyze protocol from PDF file.
 * Step 1: Upload PDF to parse-pdf endpoint to extract structured data
 * Step 2: Send extracted data to analyze endpoint
 */
export const analyzePDF = async (file, onProgress) => {
  // Step 1: Parse the PDF
  if (onProgress) onProgress(10);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const parseResponse = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.PARSE_PDF}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(Math.min(pct * 0.3, 30)); // Upload is 0-30%
          }
        },
      }
    );

    const parsedProtocol = parseResponse.data?.protocol || parseResponse.data;
    
    if (!parsedProtocol || Object.keys(parsedProtocol).length === 0) {
      throw new Error("PDF parsing returned empty protocol data. Please ensure the PDF contains valid protocol information.");
    }
    
    if (onProgress) onProgress(40);

    // Step 2: Analyze the parsed protocol
    const result = await analyzeProtocol(parsedProtocol);
    if (onProgress) onProgress(100);

    return result;
  } catch (error) {
    if (error.response?.status === 422) {
      throw new Error(`PDF parsing validation failed: ${error.response?.data?.detail || error.message}`);
    } else if (error.response?.status === 400) {
      throw new Error(`PDF parsing error: ${error.response?.data?.detail || error.message}`);
    } else {
      throw error;
    }
  }
};

/**
 * Send chat message
 */
export const sendChatMessage = async (sessionId, message, context) => {
  return apiClient.post(API_ENDPOINTS.CHAT_MESSAGE, {
    session_id: sessionId,
    message,
    context,
  });
};

/**
 * Get historical analysis data
 */
export const getHistoricalData = async (filters = {}) => {
  return apiClient.get(API_ENDPOINTS.GET_HISTORY, { params: filters });
};

/**
 * Get saved analyses from database
 */
export const getSavedAnalyses = async (limit = 50) => {
  return apiClient.get('/api/analysis/saved/list', { params: { limit } });
};

/**
 * Search saved analyses
 */
export const searchAnalyses = async (query, riskLevel, limit = 50) => {
  return apiClient.get('/api/analysis/search', { 
    params: { query, risk_level: riskLevel, limit } 
  });
};

/**
 * Save an analysis result
 */
export const saveAnalysis = async (analysisId, protocol, analysis, trialName) => {
  return apiClient.post(`/api/analysis/save/${analysisId}`, {
    protocol,
    analysis,
    trial_name: trialName
  });
};

/**
 * Get trial by ID
 */
export const getTrialById = async (trialId) => {
  return apiClient.get(`${API_ENDPOINTS.GET_TRIAL}/${trialId}`);
};

export default apiClient;
