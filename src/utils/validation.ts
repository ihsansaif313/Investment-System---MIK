/**
 * Form validation utilities
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL validation regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Phone validation regex (flexible format)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

export const validateURL = (url: string): boolean => {
  if (!url.trim()) return true; // Optional field
  return URL_REGEX.test(url.trim());
};

export const validatePhone = (phone: string): boolean => {
  if (!phone.trim()) return true; // Optional field
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return PHONE_REGEX.test(cleanPhone);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateLength = (value: string, min: number, max?: number): boolean => {
  const length = value.trim().length;
  if (length < min) return false;
  if (max && length > max) return false;
  return true;
};

export interface CompanyFormData {
  name: string;
  industry: string;
  category: string;
  description: string;
  contactEmail: string;
  establishedDate: string;
  address: string;
  contactPhone: string;
  website: string;
}

export const validateCompanyForm = (formData: CompanyFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required field validations
  if (!validateRequired(formData.name)) {
    errors.push({ field: 'name', message: 'Company name is required' });
  } else if (!validateLength(formData.name, 1, 100)) {
    errors.push({ field: 'name', message: 'Company name must be between 1 and 100 characters' });
  }

  if (!validateRequired(formData.industry)) {
    errors.push({ field: 'industry', message: 'Industry is required' });
  }

  if (!validateRequired(formData.contactEmail)) {
    errors.push({ field: 'contactEmail', message: 'Contact email is required' });
  } else if (!validateEmail(formData.contactEmail)) {
    errors.push({ field: 'contactEmail', message: 'Please enter a valid email address' });
  }

  // Optional field validations
  if (formData.website && !validateURL(formData.website)) {
    errors.push({ field: 'website', message: 'Please enter a valid URL (e.g., https://example.com)' });
  }

  if (formData.contactPhone && !validatePhone(formData.contactPhone)) {
    errors.push({ field: 'contactPhone', message: 'Please enter a valid phone number' });
  }

  if (formData.description && !validateLength(formData.description, 0, 1000)) {
    errors.push({ field: 'description', message: 'Description must be less than 1000 characters' });
  }

  if (formData.address && !validateLength(formData.address, 0, 200)) {
    errors.push({ field: 'address', message: 'Address must be less than 200 characters' });
  }

  if (formData.category && !validateLength(formData.category, 0, 50)) {
    errors.push({ field: 'category', message: 'Category must be less than 50 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Real-time field validation
export const validateField = (fieldName: keyof CompanyFormData, value: string, formData?: CompanyFormData): ValidationError | null => {
  switch (fieldName) {
    case 'name':
      if (!validateRequired(value)) {
        return { field: 'name', message: 'Company name is required' };
      }
      if (!validateLength(value, 1, 100)) {
        return { field: 'name', message: 'Company name must be between 1 and 100 characters' };
      }
      break;

    case 'industry':
      if (!validateRequired(value)) {
        return { field: 'industry', message: 'Industry is required' };
      }
      break;

    case 'contactEmail':
      if (!validateRequired(value)) {
        return { field: 'contactEmail', message: 'Contact email is required' };
      }
      if (!validateEmail(value)) {
        return { field: 'contactEmail', message: 'Please enter a valid email address' };
      }
      break;

    case 'website':
      if (value && !validateURL(value)) {
        return { field: 'website', message: 'Please enter a valid URL (e.g., https://example.com)' };
      }
      break;

    case 'contactPhone':
      if (value && !validatePhone(value)) {
        return { field: 'contactPhone', message: 'Please enter a valid phone number' };
      }
      break;

    case 'description':
      if (value && !validateLength(value, 0, 1000)) {
        return { field: 'description', message: 'Description must be less than 1000 characters' };
      }
      break;

    case 'address':
      if (value && !validateLength(value, 0, 200)) {
        return { field: 'address', message: 'Address must be less than 200 characters' };
      }
      break;

    case 'category':
      if (value && !validateLength(value, 0, 50)) {
        return { field: 'category', message: 'Category must be less than 50 characters' };
      }
      break;
  }

  return null;
};
