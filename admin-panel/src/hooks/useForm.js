// Form Handling Hook
import { useState, useCallback, useRef, useEffect } from 'react';
import { validateField, validateForm } from '../validation/schemas.js';
import { handleError } from '../utils/errors/errorHandler.js';
import { debugLog } from '../config/environment.js';

// useForm Hook
export const useForm = (initialValues = {}, validationSchema = null, options = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  
  const validationTimeoutRef = useRef({});
  const isMountedRef = useRef(true);
  
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    revalidateOnChange = true,
    debounceValidation = 300,
    onSubmit = null,
    onValidationError = null,
    enableReinitialize = false,
  } = options;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      Object.values(validationTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  // Reinitialize form when initialValues change
  useEffect(() => {
    if (enableReinitialize) {
      setValues(initialValues);
      setErrors({});
      setTouched({});
    }
  }, [initialValues, enableReinitialize]);

  // Validate single field
  const validateSingleField = useCallback(async (name, value) => {
    if (!validationSchema || !validationSchema[name]) {
      return null;
    }

    try {
      setIsValidating(true);
      
      const rules = typeof validationSchema[name] === 'function' 
        ? validationSchema[name](values) 
        : validationSchema[name];
      
      const error = validateField(value, rules);
      
      if (isMountedRef.current) {
        setErrors(prev => ({
          ...prev,
          [name]: error,
        }));
      }
      
      return error;
    } catch (err) {
      const appError = handleError(err, { field: name, value });
      debugLog('Field validation error:', appError);
      return appError.message;
    } finally {
      if (isMountedRef.current) {
        setIsValidating(false);
      }
    }
  }, [validationSchema, values]);

  // Debounced validation
  const debouncedValidate = useCallback((name, value) => {
    if (validationTimeoutRef.current[name]) {
      clearTimeout(validationTimeoutRef.current[name]);
    }
    
    validationTimeoutRef.current[name] = setTimeout(() => {
      validateSingleField(name, value);
    }, debounceValidation);
  }, [validateSingleField, debounceValidation]);

  // Set field value
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change if enabled
    if (validateOnChange || (revalidateOnChange && touched[name])) {
      if (debounceValidation > 0) {
        debouncedValidate(name, value);
      } else {
        validateSingleField(name, value);
      }
    }
  }, [validateOnChange, revalidateOnChange, touched, debouncedValidate, validateSingleField, debounceValidation]);

  // Set field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched,
    }));

    // Validate on blur if enabled
    if (validateOnBlur && isTouched) {
      validateSingleField(name, values[name]);
    }
  }, [validateOnBlur, validateSingleField, values]);

  // Handle input change
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setFieldValue(name, fieldValue);
  }, [setFieldValue]);

  // Handle input blur
  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setFieldTouched(name, true);
  }, [setFieldTouched]);

  // Validate entire form
  const validateAllFields = useCallback(async () => {
    if (!validationSchema) {
      return { isValid: true, errors: {} };
    }

    try {
      setIsValidating(true);
      
      const result = validateForm(values, validationSchema);
      
      if (isMountedRef.current) {
        setErrors(result.errors);
      }
      
      return result;
    } catch (err) {
      const appError = handleError(err, { values });
      debugLog('Form validation error:', appError);
      return { isValid: false, errors: { _form: appError.message } };
    } finally {
      if (isMountedRef.current) {
        setIsValidating(false);
      }
    }
  }, [validationSchema, values]);

  // Submit form
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    setSubmitCount(prev => prev + 1);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate form if validation is enabled
    let validationResult = { isValid: true, errors: {} };
    if (validateOnSubmit && validationSchema) {
      validationResult = await validateAllFields();
    }

    if (!validationResult.isValid) {
      if (onValidationError) {
        onValidationError(validationResult.errors);
      }
      return;
    }

    if (!onSubmit) {
      debugLog('No onSubmit handler provided');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values, { setFieldError, setFieldValue, setFieldTouched });
      debugLog('Form submitted successfully:', values);
    } catch (err) {
      const appError = handleError(err, { values });
      
      // Set form-level error
      setFieldError('_form', appError.message);
      
      debugLog('Form submission error:', appError);
      throw appError;
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [values, validateOnSubmit, validationSchema, validateAllFields, onSubmit, onValidationError, setFieldError, setFieldValue, setFieldTouched]);

  // Reset form
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setSubmitCount(0);
    setIsSubmitting(false);
    setIsValidating(false);
  }, [initialValues]);

  // Get field props for easy integration
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
  }), [values, handleChange, handleBlur]);

  // Get field meta information
  const getFieldMeta = useCallback((name) => ({
    value: values[name],
    error: errors[name],
    touched: touched[name],
    invalid: !!errors[name],
    valid: !errors[name] && touched[name],
  }), [values, errors, touched]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;
  
  // Check if form is dirty (has changes)
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  
  // Check if form can be submitted
  const canSubmit = !isSubmitting && !isValidating && (validateOnSubmit ? isValid : true);

  return {
    // Values and state
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    isValid,
    isDirty,
    canSubmit,
    submitCount,
    
    // Field operations
    setFieldValue,
    setFieldError,
    setFieldTouched,
    
    // Form operations
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validateAllFields,
    
    // Helper functions
    getFieldProps,
    getFieldMeta,
  };
};

// useFormField Hook - For individual field management
export const useFormField = (name, initialValue = '', validationRules = null, options = {}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const validationTimeoutRef = useRef(null);
  
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceValidation = 300,
  } = options;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  // Validate field
  const validate = useCallback(async (fieldValue = value) => {
    if (!validationRules) return null;

    try {
      setIsValidating(true);
      const fieldError = validateField(fieldValue, validationRules);
      setError(fieldError);
      return fieldError;
    } catch (err) {
      const appError = handleError(err, { field: name, value: fieldValue });
      setError(appError.message);
      return appError.message;
    } finally {
      setIsValidating(false);
    }
  }, [value, validationRules, name]);

  // Debounced validation
  const debouncedValidate = useCallback((fieldValue) => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      validate(fieldValue);
    }, debounceValidation);
  }, [validate, debounceValidation]);

  // Handle change
  const handleChange = useCallback((event) => {
    const newValue = event.target.value;
    setValue(newValue);

    if (validateOnChange) {
      if (debounceValidation > 0) {
        debouncedValidate(newValue);
      } else {
        validate(newValue);
      }
    }
  }, [validateOnChange, debouncedValidate, validate, debounceValidation]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setTouched(true);
    
    if (validateOnBlur) {
      validate();
    }
  }, [validateOnBlur, validate]);

  // Reset field
  const reset = useCallback((newValue = initialValue) => {
    setValue(newValue);
    setError(null);
    setTouched(false);
    setIsValidating(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    isValidating,
    isValid: !error,
    isDirty: value !== initialValue,
    
    setValue,
    setError,
    setTouched,
    
    handleChange,
    handleBlur,
    validate,
    reset,
    
    // Props for easy integration
    fieldProps: {
      name,
      value,
      onChange: handleChange,
      onBlur: handleBlur,
    },
    
    meta: {
      error,
      touched,
      invalid: !!error,
      valid: !error && touched,
    },
  };
};

export default useForm;

