/**
 * Custom hook for managing analysis state and operations
 */

import { useState, useCallback } from 'react';
import { analyzeProtocol, analyzePDF } from '../utils/api';

export const useAnalysis = () => {
  const [state, setState] = useState({
    result: null,
    loading: false,
    error: null,
    progress: 0,
    stage: '',
  });

  /**
   * Analyze protocol from structured data
   */
  const analyze = useCallback(async (protocolData) => {
    setState({
      result: null,
      loading: true,
      error: null,
      progress: 10,
      stage: 'Sending protocol for analysis...',
    });

    try {
      const result = await analyzeProtocol(protocolData);
      setState({
        result,
        loading: false,
        error: null,
        progress: 100,
        stage: 'Complete',
      });
      return result;
    } catch (error) {
      setState({
        result: null,
        loading: false,
        error,
        progress: 0,
        stage: 'Failed',
      });
      throw error;
    }
  }, []);

  /**
   * Analyze protocol from PDF with progress tracking
   */
  const analyzeFromPDF = useCallback(async (file) => {
    setState({
      result: null,
      loading: true,
      error: null,
      progress: 0,
      stage: 'Uploading PDF...',
    });

    try {
      const result = await analyzePDF(file, (progress) => {
        setState((prev) => ({
          ...prev,
          progress: Math.min(progress, 95),
          stage: progress < 30 ? 'Uploading PDF...' :
                 progress < 60 ? 'Extracting protocol data...' :
                 'Running risk analysis...',
        }));
      });

      setState({
        result,
        loading: false,
        error: null,
        progress: 100,
        stage: 'Complete',
      });
      return result;
    } catch (error) {
      setState({
        result: null,
        loading: false,
        error,
        progress: 0,
        stage: 'Failed',
      });
      throw error;
    }
  }, []);

  /**
   * Reset analysis state
   */
  const reset = useCallback(() => {
    setState({
      result: null,
      loading: false,
      error: null,
      progress: 0,
      stage: '',
    });
  }, []);

  return {
    ...state,
    analyze,
    analyzeFromPDF,
    reset,
  };
};

export default useAnalysis;
