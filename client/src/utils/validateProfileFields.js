/**
 * Validates profile fields for both Guest and Manager roles.
 * @param {Object} fields - The fields to validate.
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateProfileFields = (fields) => {
  const errors = {};

  // Full Name validation
  if (!fields.name || fields.name.trim() === '') {
    errors.name = 'Full name is required';
  }

  // Email validation (if present)
  if (fields.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fields.email)) {
      errors.email = 'Invalid email format';
    }
  }

  // Phone validation
  if (fields.phone) {
    const cleanPhone = fields.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      errors.phone = 'Phone number must be between 10 and 15 digits';
    }
    if (/\D/.test(fields.phone.replace(/[+\-\s()]/g, ''))) {
        // Allow symbols like +, -, (), space but rest must be digits
        errors.phone = 'Phone number contains invalid characters';
    }
  } else if (fields.phone === '') {
     errors.phone = 'Phone number is required';
  }

  // Password validation (Manager specific)
  if (fields.newPassword || fields.currentPassword || fields.confirmPassword) {
    if (!fields.currentPassword) errors.currentPassword = 'Current password is required';
    
    if (!fields.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      if (fields.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
      }
      if (!/\d/.test(fields.newPassword)) {
        errors.newPassword = 'Password must include at least one number';
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(fields.newPassword)) {
        errors.newPassword = 'Password must include at least one symbol';
      }
      if (fields.newPassword === fields.currentPassword) {
        errors.newPassword = 'New password cannot be the same as current password';
      }
    }

    if (fields.newPassword !== fields.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
