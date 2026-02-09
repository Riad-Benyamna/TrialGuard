/**
 * PDF upload component with drag-and-drop and progress tracking
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../common/Button';
import { ProgressBar } from '../common/LoadingState';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../../utils/constants';

/**
 * @param {Object} props
 * @param {Function} props.onUpload - Upload handler
 * @param {boolean} props.isUploading - Upload state
 * @param {number} props.uploadProgress - Upload progress (0-100)
 */
const PDFUploader = ({ onUpload, isUploading = false, uploadProgress = 0 }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Please upload a PDF file';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    return null;
  };

  const handleFileSelect = (selectedFile) => {
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Drop zone */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-12 transition-all duration-200
          ${isDragging
            ? 'border-primary-500 bg-primary-50'
            : file
            ? 'border-success-300 bg-success-50'
            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
          }
        `}
        whileHover={{ scale: 1.01 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center text-center space-y-4">
          {!file ? (
            <>
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Drop your protocol PDF here
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse from your computer
                </p>
              </div>
              <Button variant="primary" onClick={handleBrowseClick}>
                Browse Files
              </Button>
              <p className="text-xs text-gray-400">
                Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-success-600" />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-6 h-6 text-gray-400" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                  {!isUploading && (
                    <CheckCircle className="w-6 h-6 text-success-500 ml-2" />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white border border-gray-200 rounded-lg"
        >
          <ProgressBar
            progress={uploadProgress}
            message="Uploading and analyzing protocol..."
          />
        </motion.div>
      )}

      {/* Upload button */}
      {file && !isUploading && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleUpload}
          leftIcon={<Upload size={20} />}
        >
          Analyze Protocol
        </Button>
      )}
    </div>
  );
};

export default PDFUploader;
