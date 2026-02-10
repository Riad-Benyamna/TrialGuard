/**
 * Main results dashboard displaying analysis
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, RefreshCw, Heart } from 'lucide-react';
import Button from '../components/common/Button';
import RiskScoreHero from '../components/analysis/RiskScoreHero';
import RiskBreakdownCards from '../components/analysis/RiskBreakdownCards';
import FindingsTimeline from '../components/analysis/FindingsTimeline';
import HistoricalComparison from '../components/analysis/HistoricalComparison';
import RecommendationsPanel from '../components/analysis/RecommendationsPanel';
import ComparisonChart from '../components/analysis/ComparisonChart';
import ChatInterface from '../components/chat/ChatInterface';
import { useChat } from '../hooks/useChat';
import { parseRiskBreakdown, parseRecommendations, parseHistoricalChartData } from '../utils/formatting';
import { useToast } from '../components/common/Toast';
import { saveAnalysis } from '../utils/api';

const AnalysisResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { analysis, protocol, pdfName } = location.state || {};

  // Redirect if no analysis data
  if (!analysis) {
    navigate('/protocol-input');
    return null;
  }

  // Save analysis on mount
  useEffect(() => {
    const saveAnalysisResult = async () => {
      try {
        const analysisId = analysis.analysis_id || `analysis_${Date.now()}`;
        await saveAnalysis(
          analysisId,
          protocol,
          analysis,
          protocol?.metadata?.trial_name || pdfName || 'Unknown Trial'
        );
        // Silent save, don't notify unless there's an error
      } catch (error) {
        console.warn('Note: Analysis auto-save to database had an issue, but results are displayed', error);
      }
    };
    
    saveAnalysisResult();
  }, [analysis, protocol, pdfName]);

  const { messages, isLoading, sendMessage } = useChat(analysis);

  // Parse analysis data
  const riskBreakdown = parseRiskBreakdown(analysis);
  const recommendations = parseRecommendations(analysis);
  const historicalChartData = analysis.historical_trials
    ? parseHistoricalChartData(analysis.historical_trials)
    : [];

  // Collect all findings from breakdown
  const allFindings = riskBreakdown.flatMap((category) =>
    category.findings.map((finding) => ({
      ...finding,
      category: category.category,
    }))
  );

  const handleDownloadReport = () => {
    toast.info('Report download feature coming soon!');
  };

  const handleShare = () => {
    toast.info('Share feature coming soon!');
  };

  const handleNewAnalysis = () => {
    navigate('/protocol-input');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft size={20} />}
                onClick={() => navigate('/')}
              >
                Home
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                Analysis Results
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                leftIcon={<Share2 size={18} />}
                onClick={handleShare}
              >
                Share
              </Button>
              <Button
                variant="ghost"
                leftIcon={<Download size={18} />}
                onClick={handleDownloadReport}
              >
                Download
              </Button>
              <Button
                variant="primary"
                leftIcon={<RefreshCw size={18} />}
                onClick={handleNewAnalysis}
              >
                New Analysis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero section with overall score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <RiskScoreHero
            score={analysis.overall_score}
            trialName={protocol?.trial_name || pdfName || 'Clinical Trial Protocol'}
          />
        </motion.div>

        {/* Executive Summary */}
        {analysis.executive_summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
              <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none space-y-3">
                {analysis.executive_summary.split('\n').map((paragraph, idx) => {
                  if (!paragraph.trim()) return null; // Skip empty lines
                  
                  // Handle markdown headings: ### text -> <h3>, ## text -> <h2>, etc.
                  const headingMatch = paragraph.match(/^(#{1,6})\s+(.+)$/);
                  if (headingMatch) {
                    const level = headingMatch[1].length;
                    const text = headingMatch[2];
                    const headingClass = {
                      1: 'text-3xl font-bold',
                      2: 'text-2xl font-bold',
                      3: 'text-xl font-bold',
                      4: 'text-lg font-bold',
                      5: 'text-base font-bold',
                      6: 'text-sm font-bold',
                    }[level] || 'text-base font-bold';
                    
                    return (
                      <div key={idx} className={`${headingClass} text-gray-900 mt-4 mb-2`}>
                        {text}
                      </div>
                    );
                  }
                  
                  // Convert **text** to bold and *text* to italic
                  let formattedText = paragraph
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>');
                  
                  return (
                    <p key={idx} className="mb-3" dangerouslySetInnerHTML={{ __html: formattedText }} />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Risk breakdown cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Breakdown</h2>
          <RiskBreakdownCards breakdown={riskBreakdown} />
        </motion.div>

        {/* Two-column layout for detailed sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Findings timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FindingsTimeline findings={allFindings} />
          </motion.div>

          {/* Recommendations panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RecommendationsPanel recommendations={recommendations} />
          </motion.div>
        </div>

        {/* Historical comparison */}
        {analysis.historical_trials && analysis.historical_trials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Historical Comparison</h2>

            <HistoricalComparison
              currentTrial={{
                ...protocol,
                overall_score: analysis.overall_score,
              }}
              historicalTrials={analysis.historical_trials}
            />

            {historicalChartData.length > 0 && (
              <ComparisonChart
                data={[
                  {
                    name: 'Current',
                    score: analysis.overall_score,
                    phase: protocol?.phase,
                  },
                  ...historicalChartData,
                ]}
              />
            )}
          </motion.div>
        )}

        {/* Summary statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {riskBreakdown.length}
              </div>
              <div className="text-sm text-gray-500">Risk Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {allFindings.length}
              </div>
              <div className="text-sm text-gray-500">Total Findings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {recommendations.length}
              </div>
              <div className="text-sm text-gray-500">Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {analysis.historical_trials?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Comparisons</div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Chat interface */}
      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
      />
    </div>
  );
};

export default AnalysisResults;
