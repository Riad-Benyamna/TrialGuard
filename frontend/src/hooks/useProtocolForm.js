/**
 * Custom hook for protocol form state management with validation
 */

import { useState, useCallback } from 'react';

const initialFormState = {
  trial_name: '',
  phase: '',
  therapeutic_area: '',
  description: '',
  primary_objective: '',

  // Study design
  study_type: '',
  randomization: '',
  blinding: '',
  duration_days: '',

  // Population
  target_enrollment: '',
  inclusion_criteria: '',
  exclusion_criteria: '',

  // Statistical
  primary_endpoint: '',
  secondary_endpoints: '',
  sample_size_justification: '',
  statistical_methods: '',

  // Safety & Monitoring
  safety_monitoring: '',
  stopping_rules: '',
};

const validationRules = {
  trial_name: (value) => value.length >= 3 || 'Trial name must be at least 3 characters',
  phase: (value) => value !== '' || 'Please select a phase',
  therapeutic_area: (value) => value !== '' || 'Please select a therapeutic area',
  target_enrollment: (value) => {
    const num = parseInt(value);
    return (!isNaN(num) && num > 0) || 'Must be a positive number';
  },
  duration_days: (value) => {
    const num = parseInt(value);
    return (!isNaN(num) && num > 0) || 'Must be a positive number';
  },
};

export const useProtocolForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    ...initialFormState,
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  /**
   * Update form field
   */
  const updateField = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  }, [errors]);

  /**
   * Mark field as touched
   */
  const touchField = useCallback((name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  /**
   * Validate single field
   */
  const validateField = useCallback((name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;

    const result = rule(value);
    return result === true ? null : result;
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((name) => {
    touchField(name);
    const error = validateField(name, formData[name]);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  }, [formData, touchField, validateField]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setErrors({});
    setTouched({});
    setCurrentStep(0);
  }, []);

  /**
   * Move to next step
   */
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  /**
   * Move to previous step
   */
  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  /**
   * Check if form is valid for submission
   */
  const isValid = useCallback(() => {
    return Object.keys(validationRules).every((field) => {
      const error = validateField(field, formData[field]);
      return error === null;
    });
  }, [formData, validateField]);

  /**
   * Get field error if touched
   */
  const getFieldError = useCallback((name) => {
    return touched[name] ? errors[name] : null;
  }, [touched, errors]);

  return {
    formData,
    errors,
    touched,
    currentStep,
    updateField,
    touchField,
    handleBlur,
    validateForm,
    validateField,
    resetForm,
    nextStep,
    previousStep,
    goToStep,
    isValid,
    getFieldError,
  };
};

export default useProtocolForm;
