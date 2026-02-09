/**
 * Custom hook for chat session management
 */

import { useState, useCallback, useRef } from 'react';
import { sendChatMessage } from '../utils/api';

/**
 * Generate unique session ID
 */
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useChat = (analysisContext) => {
  const [sessionId] = useState(generateSessionId());
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Send a message and get AI response
   */
  const sendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await sendChatMessage(
        sessionId,
        message,
        analysisContext
      );

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response || response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message);

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [sessionId, analysisContext]);

  /**
   * Cancel ongoing request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear chat history
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Add system message
   */
  const addSystemMessage = useCallback((content) => {
    const systemMessage = {
      id: Date.now(),
      role: 'system',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, systemMessage]);
  }, []);

  return {
    sessionId,
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    clearHistory,
    addSystemMessage,
  };
};

export default useChat;
