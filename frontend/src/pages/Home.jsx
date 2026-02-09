/**
 * Landing page with hero section
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  FileText,
  Database,
  MessageCircle,
  Clock,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import Button from '../components/common/Button';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: 'PDF Extraction',
      description:
        'Upload any clinical trial protocol PDF. Our AI extracts key parameters automatically -- endpoints, sample size, inclusion criteria, and more.',
    },
    {
      icon: Shield,
      title: 'Risk Scoring',
      description:
        'Get a comprehensive risk score across design, statistical, regulatory, and operational dimensions with detailed severity breakdowns.',
    },
    {
      icon: TrendingUp,
      title: 'Historical Comparison',
      description:
        'Compare your protocol against similar historical trials. See which ones failed, why, and how your design compares.',
    },
    {
      icon: MessageCircle,
      title: 'AI Chat Assistant',
      description:
        'Ask follow-up questions about your results. Get context-aware explanations and suggestions in natural language.',
    },
  ];

  const benefits = [
    'Reduce protocol amendments by 40%',
    'Accelerate review cycles by 50%',
    'Improve trial success rates',
    'Ensure regulatory compliance',
    'Optimize study design',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/TrialGuardLogo.png" alt="TrialGuard Logo" className="h-10 w-auto" />
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/protocol-input')}>
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Predict Clinical Trial Failure Before It Costs You $100M
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Upload your clinical trial protocol and get an AI-powered risk
              assessment in under 60 seconds. Identify design flaws, statistical
              weaknesses, and regulatory gaps before they derail your trial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/protocol-input')}
                rightIcon={<ArrowRight size={20} />}
              >
                Get Started
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/database')}
                leftIcon={<Database size={20} />}
              >
                Browse Database
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative glass rounded-2xl p-8 shadow-2xl">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-600 rounded-full opacity-10 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-success-500 rounded-full opacity-10 blur-2xl" />

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">Design Risk</div>
                    <div className="text-xs text-gray-500">Low - Score: 28</div>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-7/12 bg-success-500 rounded-full" />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-warning-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">Statistical Risk</div>
                    <div className="text-xs text-gray-500">Moderate - Score: 52</div>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-warning-500 rounded-full" />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">Regulatory Risk</div>
                    <div className="text-xs text-gray-500">Low - Score: 35</div>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Stats Section */}
      <section className="py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <AlertTriangle className="w-8 h-8 text-warning-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">90%</div>
              <p className="text-gray-600">of clinical trials fail to meet their primary endpoints</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <DollarSign className="w-8 h-8 text-danger-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">$50-100M</div>
              <p className="text-gray-600">average cost per failed clinical trial</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <Clock className="w-8 h-8 text-primary-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">30-60s</div>
              <p className="text-gray-600">to get a comprehensive risk assessment</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Key Features
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to de-risk your clinical trial protocol
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Proven Results
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Organizations using TrialGuard experience significant improvements in trial efficiency and success rates.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-success-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-12 text-white shadow-2xl"
            >
              <h4 className="text-2xl font-bold mb-4">Ready to get started?</h4>
              <p className="text-primary-100 mb-8">
                Upload your protocol or fill out our structured form to receive a comprehensive risk assessment in minutes.
              </p>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => navigate('/protocol-input')}
                  leftIcon={<FileText size={20} />}
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TrialGuard</span>
            </div>
            <p className="text-sm">
              AI-Powered Clinical Trial Risk Assessment Platform
            </p>
            <p className="text-xs mt-4">
              &copy; 2025 TrialGuard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
