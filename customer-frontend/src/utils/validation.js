// Form validation utilities

// Validation rules
export const validationRules = {
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required'
    }
    return null
  },

  email: (value) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  },

  minLength: (min) => (value) => {
    if (!value) return null
    if (value.length < min) {
      return `Must be at least ${min} characters long`
    }
    return null
  },

  maxLength: (max) => (value) => {
    if (!value) return null
    if (value.length > max) {
      return `Must be no more than ${max} characters long`
    }
    return null
  },

  password: (value) => {
    if (!value) return null
    
    const errors = []
    
    if (value.length < 8) {
      errors.push('at least 8 characters')
    }
    
    if (!/[A-Z]/.test(value)) {
      errors.push('one uppercase letter')
    }
    
    if (!/[a-z]/.test(value)) {
      errors.push('one lowercase letter')
    }
    
    if (!/\d/.test(value)) {
      errors.push('one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('one special character')
    }
    
    if (errors.length > 0) {
      return `Password must contain ${errors.join(', ')}`
    }
    
    return null
  },

  confirmPassword: (originalPassword) => (value) => {
    if (!value) return null
    if (value !== originalPassword) {
      return 'Passwords do not match'
    }
    return null
  },

  url: (value) => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return 'Please enter a valid URL'
    }
  },

  phone: (value) => {
    if (!value) return null
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number'
    }
    return null
  },

  number: (value) => {
    if (!value) return null
    if (isNaN(value)) {
      return 'Please enter a valid number'
    }
    return null
  },

  min: (min) => (value) => {
    if (!value) return null
    if (Number(value) < min) {
      return `Must be at least ${min}`
    }
    return null
  },

  max: (max) => (value) => {
    if (!value) return null
    if (Number(value) > max) {
      return `Must be no more than ${max}`
    }
    return null
  },

  pattern: (regex, message) => (value) => {
    if (!value) return null
    if (!regex.test(value)) {
      return message || 'Invalid format'
    }
    return null
  },

  custom: (validator, message) => (value) => {
    if (!validator(value)) {
      return message || 'Invalid value'
    }
    return null
  }
}

// Validate a single field
export const validateField = (value, rules) => {
  if (!rules || rules.length === 0) return null

  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }

  return null
}

// Validate an entire form
export const validateForm = (values, schema) => {
  const errors = {}
  let hasErrors = false

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(values[field], rules)
    if (error) {
      errors[field] = error
      hasErrors = true
    }
  }

  return { errors, isValid: !hasErrors }
}

// Real-time validation hook
import { useState, useCallback } from 'react'

export const useFormValidation = (initialValues = {}, schema = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update field value
  const setValue = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }, [errors])

  // Mark field as touched
  const setTouched = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  // Validate single field
  const validateSingleField = useCallback((field, value = values[field]) => {
    if (!schema[field]) return null
    
    const error = validateField(value, schema[field])
    setErrors(prev => ({ ...prev, [field]: error }))
    return error
  }, [schema, values])

  // Validate all fields
  const validateAll = useCallback(() => {
    const { errors: newErrors, isValid } = validateForm(values, schema)
    setErrors(newErrors)
    return isValid
  }, [values, schema])

  // Handle field change
  const handleChange = useCallback((field) => (event) => {
    const value = event.target.value
    setValue(field, value)
    
    // Validate on change if field was previously touched
    if (touched[field]) {
      setTimeout(() => validateSingleField(field, value), 100)
    }
  }, [setValue, touched, validateSingleField])

  // Handle field blur
  const handleBlur = useCallback((field) => () => {
    setTouched(field)
    validateSingleField(field)
  }, [setTouched, validateSingleField])

  // Handle form submission
  const handleSubmit = useCallback((onSubmit) => async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    // Mark all fields as touched
    const allFields = Object.keys(schema)
    const touchedState = {}
    allFields.forEach(field => {
      touchedState[field] = true
    })
    setTouched(touchedState)

    // Validate all fields
    const isValid = validateAll()

    if (isValid) {
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }

    setIsSubmitting(false)
  }, [schema, validateAll, values])

  // Reset form
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  // Get field props for easy integration
  const getFieldProps = useCallback((field) => ({
    value: values[field] || '',
    onChange: handleChange(field),
    onBlur: handleBlur(field),
    error: touched[field] ? errors[field] : null,
    hasError: touched[field] && !!errors[field]
  }), [values, handleChange, handleBlur, touched, errors])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setTouched,
    validateSingleField,
    validateAll,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
    isValid: Object.keys(errors).every(key => !errors[key])
  }
}

// Common validation schemas
export const commonSchemas = {
  login: {
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required]
  },

  register: {
    firstName: [validationRules.required, validationRules.minLength(2)],
    lastName: [validationRules.required, validationRules.minLength(2)],
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required, validationRules.password],
    confirmPassword: [validationRules.required]
  },

  profile: {
    firstName: [validationRules.required, validationRules.minLength(2)],
    lastName: [validationRules.required, validationRules.minLength(2)],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.phone],
    website: [validationRules.url]
  },

  businessProfile: {
    businessName: [validationRules.required, validationRules.minLength(2)],
    industry: [validationRules.required],
    website: [validationRules.url],
    description: [validationRules.maxLength(500)]
  },

  contentPost: {
    title: [validationRules.required, validationRules.maxLength(100)],
    caption: [validationRules.required, validationRules.maxLength(2200)],
    platform: [validationRules.required]
  }
}

// Utility functions
export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value
  return value.trim().replace(/[<>]/g, '')
}

export const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return value
}

export const formatCurrency = (value) => {
  const number = parseFloat(value.replace(/[^\d.-]/g, ''))
  if (isNaN(number)) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(number)
}

export default {
  validationRules,
  validateField,
  validateForm,
  useFormValidation,
  commonSchemas,
  sanitizeInput,
  formatPhoneNumber,
  formatCurrency
}
