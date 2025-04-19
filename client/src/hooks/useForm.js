// frontend/src/hooks/useForm.js
import { useState, useEffect, useCallback } from 'react';
import { validateForm } from '../utils/validation';

/**
 * Custom hook for handling form state and validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Form validation rules
 * @param {Function} onSubmit - Function to call on successful form submission
 * @returns {Object} Form state and helper functions
 */
function useForm(initialValues = {}, validationRules = {}, onSubmit = () => {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Reset form when initialValues change
  useEffect(() => {
    setValues(initialValues);
  }, [JSON.stringify(initialValues)]);

  // Handle form submission and validation
  useEffect(() => {
    if (isSubmitting) {
      const formErrors = validateForm(values, validationRules);
      setErrors(formErrors);
      
      if (Object.keys(formErrors).length === 0) {
        onSubmit(values);
      }
      
      setIsSubmitting(false);
    }
  }, [isSubmitting, submitCount]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setValues(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setValues(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setValues(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle input blur (for validation on blur)
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate only this field
    if (validationRules[name]) {
      const fieldErrors = validateForm({ [name]: values[name] }, { [name]: validationRules[name] });
      
      if (fieldErrors[name]) {
        setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
      } else if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  }, [values, errors, validationRules]);

  // Set a specific field value
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Set a specific field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Set multiple field values at once
  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
    
    // Clear errors for changed fields
    Object.keys(newValues).forEach(name => {
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    });
  }, [errors]);

  // Reset the form
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setSubmitCount(c => c + 1);
  }, []);

  // Validate the form without submitting
  const validateFormValues = useCallback(() => {
    const formErrors = validateForm(values, validationRules);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [values, validationRules]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setMultipleValues,
    resetForm,
    validateForm: validateFormValues
  };
}

export default useForm;