/**
 * Browse historical trials database (optional page)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import Button from '../components/common/Button';
import Card, { CardBody } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingState';
import { getHistoricalData, getSavedAnalyses, searchAnalyses } from '../utils/api';
import { formatDate, getRiskColor } from '../utils/formatting';
import { useToast } from '../components/common/Toast';

const HistoricalDatabase = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('saved'); // 'saved' or 'historical'
  const [filters, setFilters] = useState({
    phase: '',
    therapeutic_area: '',
  });

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      let data = [];
      
      if (tab === 'saved') {
        // Load saved analyses
        const result = await getSavedAnalyses(100);
        data = result.analyses || [];
      } else {
        // Load historical trials
        data = await getHistoricalData();
      }
      
      setTrials(data);
    } catch (error) {
      toast.error(`Failed to load ${tab} data`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filter dropdowns
  const uniquePhases = [...new Set(trials.map(t => t.phase).filter(Boolean))];
  const uniqueAreas = [...new Set(trials.map(t => t.therapeutic_area).filter(Boolean))];

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredTrials = trials.filter((trial) => {
    const matchesSearch =
      !searchQuery ||
      trial.trial_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trial.nct_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPhase = !filters.phase || trial.phase === filters.phase;
    const matchesArea =
      !filters.therapeutic_area || trial.therapeutic_area?.toLowerCase() === filters.therapeutic_area?.toLowerCase();

    return matchesSearch && matchesPhase && matchesArea;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft size={20} />}
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {tab === 'saved' ? 'My Analysis Results' : 'Historical Trials Database'}
              </h1>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-t border-gray-200 pt-4">
            <button
              onClick={() => setTab('saved')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                tab === 'saved'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Analyses
            </button>
            <button
              onClick={() => setTab('historical')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                tab === 'historical'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Historical Trials
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by trial name or NCT ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Button variant="secondary" leftIcon={<Filter size={20} />}>
              Filters
            </Button>
          </div>

          <div className="flex gap-4">
            <select
              value={filters.phase}
              onChange={(e) => handleFilterChange('phase', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Phases</option>
              {uniquePhases.map(phase => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>

            <select
              value={filters.therapeutic_area}
              onChange={(e) => handleFilterChange('therapeutic_area', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Therapeutic Areas</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner message="Loading trials database..." />
        ) : filteredTrials.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-500">No trials found matching your criteria</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Found {filteredTrials.length} trial{filteredTrials.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 gap-4">
              {filteredTrials.map((trial, index) => (
                <TrialCard key={trial.id || index} trial={trial} index={index} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const TrialCard = ({ trial, index }) => {
  const colors = getRiskColor(trial.overall_score || 0);
  const isAnalysis = !!trial.analysis_id;
  const displayName = trial.trial_name || trial.nct_id || 'Unknown';
  const displayScore = trial.overall_score || 0;
  const displayDate = trial.created_at || trial.date;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card hover>
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {displayName}
                </h3>
                {isAnalysis && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    Analysis
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {trial.phase && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {trial.phase}
                  </span>
                )}
                {trial.therapeutic_area && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {trial.therapeutic_area}
                  </span>
                )}
                {displayDate && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {displayDate}
                  </span>
                )}
                {trial.outcome && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {trial.outcome}
                  </span>
                )}
              </div>
              {trial.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{trial.description}</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
                {displayScore > 0 ? `Risk: ${Math.round(displayScore)}` : 'No Score'}
              </span>
              {trial.risk_level && (
                <span className="text-xs text-gray-500 capitalize">
                  {trial.risk_level}
                </span>
              )}
              {trial.enrollment && (
                <span className="text-sm text-gray-500">
                  n={trial.enrollment}
                </span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default HistoricalDatabase;
