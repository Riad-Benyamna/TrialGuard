/**
 * Step-by-step analysis progress view
 */

import { motion } from 'framer-motion';
import { Search, Cpu, BarChart3, FileCheck, CheckCircle } from 'lucide-react';
import { ProgressBar } from './LoadingState';

const steps = [
  { icon: Search, label: 'Searching historical trials...' },
  { icon: Cpu, label: 'Analyzing with AI...' },
  { icon: BarChart3, label: 'Comparing to failed trials...' },
  { icon: FileCheck, label: 'Generating recommendations...' },
];

const getStepStatus = (stepIndex, progress) => {
  const thresholds = [25, 50, 75, 100];
  const stepStart = stepIndex === 0 ? 0 : thresholds[stepIndex - 1];
  const stepEnd = thresholds[stepIndex];

  if (progress >= stepEnd) return 'completed';
  if (progress >= stepStart) return 'active';
  return 'pending';
};

const AnalysisProgress = ({ progress = 0, stage = '' }) => {
  return (
    <div className="max-w-lg mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Analyzing Your Protocol
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          This usually takes 30-60 seconds
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <ProgressBar progress={progress} />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index, progress);
            const Icon = step.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                {/* Status indicator */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    status === 'completed'
                      ? 'bg-success-100'
                      : status === 'active'
                      ? 'bg-primary-100'
                      : 'bg-gray-100'
                  }`}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-success-600" />
                  ) : (
                    <Icon
                      className={`w-5 h-5 ${
                        status === 'active'
                          ? 'text-primary-600 animate-pulse'
                          : 'text-gray-400'
                      }`}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    status === 'completed'
                      ? 'text-success-700'
                      : status === 'active'
                      ? 'text-primary-700'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Current stage text */}
        {stage && (
          <p className="text-xs text-gray-400 text-center mt-6">{stage}</p>
        )}
      </motion.div>
    </div>
  );
};

export default AnalysisProgress;
