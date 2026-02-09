/**
 * Styled chat message bubble with typewriter effect
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, AlertCircle } from 'lucide-react';

/**
 * @param {Object} props
 * @param {Object} props.message - Message object with role, content, timestamp
 */
const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = message.isError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser
            ? 'bg-primary-600 text-white'
            : isError
            ? 'bg-danger-100 text-danger-600'
            : 'bg-gray-200 text-gray-600'
          }
        `}
      >
        {isUser ? (
          <User size={16} />
        ) : isError ? (
          <AlertCircle size={16} />
        ) : (
          <Bot size={16} />
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            p-3 rounded-lg
            ${isUser
              ? 'bg-primary-600 text-white rounded-tr-none'
              : isError
              ? 'bg-danger-50 text-danger-900 border border-danger-200 rounded-tl-none'
              : 'bg-gray-100 text-gray-900 rounded-tl-none'
            }
          `}
        >
          {isUser || isSystem ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <TypewriterText text={message.content} />
          )}
        </div>
        <p className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  );
};

/**
 * Typewriter effect for AI messages
 */
const TypewriterText = ({ text, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  return (
    <p className={`text-sm whitespace-pre-wrap ${!isComplete ? 'typewriter-cursor' : ''}`}>
      {displayedText}
    </p>
  );
};

export default MessageBubble;
