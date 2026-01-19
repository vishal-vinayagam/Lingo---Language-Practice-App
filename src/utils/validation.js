// Email validation regex
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Password validation - at least 6 characters
export const validatePassword = (password) => {
  return password.length >= 6
}

// Display name validation - non-empty string
export const validateDisplayName = (name) => {
  return name.trim().length > 0
}

// Notes validation - optional, but if provided, max 500 characters
export const validateNotes = (notes) => {
  return notes.length <= 500
}

// Recording duration validation - max 2 minutes (300 seconds)
export const validateRecordingDuration = (duration) => {
  return duration > 0 && duration <= 200
}

// Prompt validation - non-empty string
export const validatePrompt = (prompt) => {
  return prompt.trim().length > 0
}

// General form validation helper
export const validateForm = (fields, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach(field => {
    const value = fields[field]
    const rule = rules[field]
    
    if (rule.required && !value) {
      errors[field] = rule.message || `${field} is required`
    } else if (rule.validate && value) {
      if (!rule.validate(value)) {
        errors[field] = rule.message || `Invalid ${field}`
      }
    } else if (rule.minLength && value.length < rule.minLength) {
      errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`
    } else if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = rule.message || `${field} must be at most ${rule.maxLength} characters`
    }
  })
  
  return errors
}

// Example usage:
export const loginRules = {
  email: {
    required: true,
    validate: validateEmail,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters'
  }
}

export const signupRules = {
  email: {
    required: true,
    validate: validateEmail,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters'
  },
  displayName: {
    required: true,
    validate: validateDisplayName,
    message: 'Please enter your name'
  },
  confirmPassword: {
    required: true,
    message: 'Please confirm your password'
  }
}