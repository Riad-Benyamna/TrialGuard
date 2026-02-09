/**
 * Multi-step protocol form with validation
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Button from '../common/Button';
import FieldGroup from './FieldGroup';
import { PHASE_OPTIONS, THERAPEUTIC_AREAS, RANDOMIZATION_TYPES, BLINDING_LEVELS } from '../../utils/constants';

const steps = [
  { id: 'basic', title: 'Basic Information', description: 'Trial name, phase, and purpose' },
  { id: 'design', title: 'Study Design', description: 'Type, randomization, and duration' },
  { id: 'population', title: 'Population', description: 'Enrollment and eligibility' },
  { id: 'statistical', title: 'Statistical', description: 'Endpoints and analysis' },
  { id: 'safety', title: 'Safety & Monitoring', description: 'Monitoring plan and stopping rules' },
];

/**
 * Protocol form component
 * @param {Object} props
 * @param {Object} props.formData - Form data object
 * @param {Function} props.updateField - Field update handler
 * @param {Function} props.handleBlur - Blur handler
 * @param {Function} props.getFieldError - Error getter
 * @param {number} props.currentStep - Current step index
 * @param {Function} props.nextStep - Next step handler
 * @param {Function} props.previousStep - Previous step handler
 * @param {Function} props.onSubmit - Form submit handler
 * @param {boolean} props.isSubmitting - Submission state
 */
const ProtocolForm = ({
  formData,
  updateField,
  handleBlur,
  getFieldError,
  currentStep,
  nextStep,
  previousStep,
  onSubmit,
  isSubmitting = false,
}) => {
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onSubmit();
    } else {
      nextStep();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-200
                    ${index < currentStep
                      ? 'bg-success-500 text-white'
                      : index === currentStep
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {index < currentStep ? <Check size={20} /> : index + 1}
                </div>
                <div className="mt-2 text-center hidden md:block">
                  <p className={`text-sm font-medium ${index === currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${index < currentStep ? 'bg-success-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {currentStep === 0 && (
              <BasicInformation
                formData={formData}
                updateField={updateField}
                handleBlur={handleBlur}
                getFieldError={getFieldError}
              />
            )}
            {currentStep === 1 && (
              <StudyDesign
                formData={formData}
                updateField={updateField}
                handleBlur={handleBlur}
                getFieldError={getFieldError}
              />
            )}
            {currentStep === 2 && (
              <Population
                formData={formData}
                updateField={updateField}
                handleBlur={handleBlur}
                getFieldError={getFieldError}
              />
            )}
            {currentStep === 3 && (
              <Statistical
                formData={formData}
                updateField={updateField}
                handleBlur={handleBlur}
                getFieldError={getFieldError}
              />
            )}
            {currentStep === 4 && (
              <SafetyMonitoring
                formData={formData}
                updateField={updateField}
                handleBlur={handleBlur}
                getFieldError={getFieldError}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          onClick={previousStep}
          disabled={currentStep === 0 || isSubmitting}
          leftIcon={<ChevronLeft size={20} />}
        >
          Previous
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          loading={isSubmitting}
          rightIcon={!isLastStep && <ChevronRight size={20} />}
        >
          {isLastStep ? 'Analyze Protocol' : 'Next Step'}
        </Button>
      </div>
    </div>
  );
};

const BasicInformation = ({ formData, updateField, handleBlur, getFieldError }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>

    <FieldGroup
      label="Trial Name"
      required
      error={getFieldError('trial_name')}
      description="Official name or identifier for the clinical trial"
    >
      <input
        type="text"
        value={formData.trial_name}
        onChange={(e) => updateField('trial_name', e.target.value)}
        onBlur={() => handleBlur('trial_name')}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="e.g., TRANSFORM-HF Trial"
      />
    </FieldGroup>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FieldGroup label="Phase" required error={getFieldError('phase')}>
        <select
          value={formData.phase}
          onChange={(e) => updateField('phase', e.target.value)}
          onBlur={() => handleBlur('phase')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select phase</option>
          {PHASE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FieldGroup>

      <FieldGroup label="Therapeutic Area" required error={getFieldError('therapeutic_area')}>
        <select
          value={formData.therapeutic_area}
          onChange={(e) => updateField('therapeutic_area', e.target.value)}
          onBlur={() => handleBlur('therapeutic_area')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select area</option>
          {THERAPEUTIC_AREAS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </FieldGroup>
    </div>

    <FieldGroup label="Description" description="Brief overview of the trial purpose">
      <textarea
        value={formData.description}
        onChange={(e) => updateField('description', e.target.value)}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="Describe the trial's purpose and goals..."
      />
    </FieldGroup>

    <FieldGroup label="Primary Objective">
      <textarea
        value={formData.primary_objective}
        onChange={(e) => updateField('primary_objective', e.target.value)}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="What is the main objective of this trial?"
      />
    </FieldGroup>
  </div>
);

const StudyDesign = ({ formData, updateField, handleBlur, getFieldError }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Study Design</h2>

    <FieldGroup label="Study Type" description="e.g., Interventional, Observational">
      <input
        type="text"
        value={formData.study_type}
        onChange={(e) => updateField('study_type', e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="e.g., Randomized Controlled Trial"
      />
    </FieldGroup>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FieldGroup label="Randomization Type">
        <select
          value={formData.randomization}
          onChange={(e) => updateField('randomization', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select type</option>
          {RANDOMIZATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </FieldGroup>

      <FieldGroup label="Blinding Level">
        <select
          value={formData.blinding}
          onChange={(e) => updateField('blinding', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select level</option>
          {BLINDING_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </FieldGroup>
    </div>

    <FieldGroup
      label="Study Duration (days)"
      required
      error={getFieldError('duration_days')}
    >
      <input
        type="number"
        value={formData.duration_days}
        onChange={(e) => updateField('duration_days', e.target.value)}
        onBlur={() => handleBlur('duration_days')}
        min="1"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="e.g., 365"
      />
    </FieldGroup>
  </div>
);

const Population = ({ formData, updateField, handleBlur, getFieldError }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Study Population</h2>

    <FieldGroup
      label="Target Enrollment"
      required
      error={getFieldError('target_enrollment')}
      description="Total number of participants to be enrolled"
    >
      <input
        type="number"
        value={formData.target_enrollment}
        onChange={(e) => updateField('target_enrollment', e.target.value)}
        onBlur={() => handleBlur('target_enrollment')}
        min="1"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="e.g., 500"
      />
    </FieldGroup>

    <FieldGroup label="Inclusion Criteria" description="Who can participate in the study">
      <textarea
        value={formData.inclusion_criteria}
        onChange={(e) => updateField('inclusion_criteria', e.target.value)}
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="List inclusion criteria, one per line..."
      />
    </FieldGroup>

    <FieldGroup label="Exclusion Criteria" description="Who cannot participate in the study">
      <textarea
        value={formData.exclusion_criteria}
        onChange={(e) => updateField('exclusion_criteria', e.target.value)}
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="List exclusion criteria, one per line..."
      />
    </FieldGroup>
  </div>
);

const Statistical = ({ formData, updateField }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Statistical Design</h2>

    <FieldGroup label="Primary Endpoint" description="Main outcome measure">
      <input
        type="text"
        value={formData.primary_endpoint}
        onChange={(e) => updateField('primary_endpoint', e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="e.g., Change in ejection fraction at 6 months"
      />
    </FieldGroup>

    <FieldGroup label="Secondary Endpoints" description="Additional outcome measures">
      <textarea
        value={formData.secondary_endpoints}
        onChange={(e) => updateField('secondary_endpoints', e.target.value)}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="List secondary endpoints, one per line..."
      />
    </FieldGroup>

    <FieldGroup label="Sample Size Justification">
      <textarea
        value={formData.sample_size_justification}
        onChange={(e) => updateField('sample_size_justification', e.target.value)}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="Explain the rationale for sample size calculation..."
      />
    </FieldGroup>

    <FieldGroup label="Statistical Methods">
      <textarea
        value={formData.statistical_methods}
        onChange={(e) => updateField('statistical_methods', e.target.value)}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="Describe planned statistical analyses..."
      />
    </FieldGroup>
  </div>
);

const SafetyMonitoring = ({ formData, updateField }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Safety & Monitoring</h2>

    <FieldGroup label="Safety Monitoring Plan" description="How will participant safety be monitored?">
      <textarea
        value={formData.safety_monitoring}
        onChange={(e) => updateField('safety_monitoring', e.target.value)}
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="Describe safety monitoring procedures, DSMB composition, reporting requirements..."
      />
    </FieldGroup>

    <FieldGroup label="Stopping Rules" description="Criteria for early termination">
      <textarea
        value={formData.stopping_rules}
        onChange={(e) => updateField('stopping_rules', e.target.value)}
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="Define stopping rules for safety, futility, or efficacy..."
      />
    </FieldGroup>
  </div>
);

export default ProtocolForm;
