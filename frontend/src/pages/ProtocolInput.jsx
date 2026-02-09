/**
 * Protocol input page with form and PDF upload options
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Edit3, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import ProtocolForm from '../components/protocol/ProtocolForm';
import PDFUploader from '../components/protocol/PDFUploader';
import AnalysisProgress from '../components/common/AnalysisProgress';
import { useProtocolForm } from '../hooks/useProtocolForm';
import { useAnalysis } from '../hooks/useAnalysis';
import { useToast } from '../components/common/Toast';

const ProtocolInput = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [inputMode, setInputMode] = useState(null); // 'form' or 'pdf'

  const {
    formData,
    updateField,
    handleBlur,
    getFieldError,
    currentStep,
    nextStep,
    previousStep,
    validateForm,
  } = useProtocolForm();

  const { analyze, analyzeFromPDF, loading, progress, stage } = useAnalysis();

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const result = await analyze(formData);
      navigate('/results', { state: { analysis: result, protocol: formData } });
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.message || 'Analysis failed. Please try again.');
    }
  };

  const handlePDFUpload = async (file) => {
    try {
      const result = await analyzeFromPDF(file);
      navigate('/results', { state: { analysis: result, pdfName: file.name } });
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.message || 'Analysis failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft size={20} />}
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Protocol Analysis
            </h1>
            <div className="w-32" /> {/* Spacer for center alignment */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!inputMode ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How would you like to provide your protocol?
              </h2>
              <p className="text-lg text-gray-600">
                Choose the method that works best for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PDF Upload Option */}
              <motion.div
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-primary-500 p-8 cursor-pointer transition-all shadow-sm hover:shadow-lg"
                onClick={() => setInputMode('pdf')}
              >
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                  Upload PDF
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Have a protocol document ready? Upload it directly and we'll extract the information automatically.
                </p>
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-success-500 rounded-full" />
                    <span>Fast and convenient</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-success-500 rounded-full" />
                    <span>Supports PDF format</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-success-500 rounded-full" />
                    <span>Up to 10MB file size</span>
                  </div>
                </div>
              </motion.div>

              {/* Form Input Option */}
              <motion.div
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-primary-500 p-8 cursor-pointer transition-all shadow-sm hover:shadow-lg"
                onClick={() => setInputMode('form')}
              >
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Edit3 className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                  Fill Out Form
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Prefer a guided experience? Fill out our structured form with step-by-step guidance.
                </p>
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-success-500 rounded-full" />
                    <span>Step-by-step guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-success-500 rounded-full" />
                    <span>Validation and tips</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-success-500 rounded-full" />
                    <span>No document needed</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : inputMode === 'pdf' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8">
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft size={20} />}
                onClick={() => setInputMode(null)}
              >
                Choose Different Method
              </Button>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Upload Protocol PDF
              </h2>
              <p className="text-gray-600">
                Upload your protocol document for AI-powered analysis
              </p>
            </div>

            {loading ? (
              <AnalysisProgress progress={progress} stage={stage} />
            ) : (
              <PDFUploader
                onUpload={handlePDFUpload}
                isUploading={loading}
                uploadProgress={progress}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8">
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft size={20} />}
                onClick={() => setInputMode(null)}
              >
                Choose Different Method
              </Button>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Protocol Information Form
              </h2>
              <p className="text-gray-600">
                Fill out the details of your clinical trial protocol
              </p>
            </div>

            {loading ? (
              <AnalysisProgress progress={progress} stage={stage} />
            ) : (
              <ProtocolForm
                formData={formData}
                updateField={updateField}
                handleBlur={handleBlur}
                getFieldError={getFieldError}
                currentStep={currentStep}
                nextStep={nextStep}
                previousStep={previousStep}
                onSubmit={handleFormSubmit}
                isSubmitting={loading}
              />
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ProtocolInput;
