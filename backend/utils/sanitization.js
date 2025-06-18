/**
 * Data Sanitization Utilities
 * Comprehensive input sanitization and data cleaning
 */

import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';
import { AppError } from './errors.js';

/**
 * Sanitize string input
 */
export const sanitizeString = (input, options = {}) => {
  if (typeof input !== 'string') {
    return input;
  }

  const {
    trim = true,
    escape = true,
    stripHtml = true,
    maxLength = null,
    allowedChars = null
  } = options;

  let sanitized = input;

  // Trim whitespace
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Strip HTML tags
  if (stripHtml) {
    sanitized = DOMPurify.sanitize(sanitized, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
  }

  // Escape HTML entities
  if (escape) {
    sanitized = validator.escape(sanitized);
  }

  // Check allowed characters
  if (allowedChars && !allowedChars.test(sanitized)) {
    throw new AppError('Input contains invalid characters', 400);
  }

  // Check maximum length
  if (maxLength && sanitized.length > maxLength) {
    throw new AppError(`Input exceeds maximum length of ${maxLength} characters`, 400);
  }

  return sanitized;
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    throw new AppError('Email must be a string', 400);
  }

  const sanitized = email.trim().toLowerCase();
  
  if (!validator.isEmail(sanitized)) {
    throw new AppError('Invalid email format', 400);
  }

  return validator.normalizeEmail(sanitized);
};

/**
 * Sanitize phone number
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') {
    throw new AppError('Phone number must be a string', 400);
  }

  // Remove all non-digit characters except + at the beginning
  let sanitized = phone.replace(/[^\d+]/g, '');
  
  // Ensure + is only at the beginning
  if (sanitized.includes('+')) {
    const parts = sanitized.split('+');
    sanitized = '+' + parts.join('');
  }

  if (!validator.isMobilePhone(sanitized)) {
    throw new AppError('Invalid phone number format', 400);
  }

  return sanitized;
};

/**
 * Sanitize URL input
 */
export const sanitizeURL = (url) => {
  if (typeof url !== 'string') {
    throw new AppError('URL must be a string', 400);
  }

  const sanitized = url.trim();
  
  if (!validator.isURL(sanitized, {
    protocols: ['http', 'https'],
    require_protocol: true
  })) {
    throw new AppError('Invalid URL format', 400);
  }

  return sanitized;
};

/**
 * Sanitize numeric input
 */
export const sanitizeNumber = (input, options = {}) => {
  const {
    min = null,
    max = null,
    integer = false,
    positive = false
  } = options;

  let number;

  if (typeof input === 'string') {
    number = parseFloat(input);
  } else if (typeof input === 'number') {
    number = input;
  } else {
    throw new AppError('Input must be a number or numeric string', 400);
  }

  if (isNaN(number)) {
    throw new AppError('Invalid number format', 400);
  }

  if (integer && !Number.isInteger(number)) {
    throw new AppError('Number must be an integer', 400);
  }

  if (positive && number <= 0) {
    throw new AppError('Number must be positive', 400);
  }

  if (min !== null && number < min) {
    throw new AppError(`Number must be at least ${min}`, 400);
  }

  if (max !== null && number > max) {
    throw new AppError(`Number must not exceed ${max}`, 400);
  }

  return number;
};

/**
 * Sanitize date input
 */
export const sanitizeDate = (input, options = {}) => {
  const {
    minDate = null,
    maxDate = null,
    futureOnly = false,
    pastOnly = false
  } = options;

  let date;

  if (typeof input === 'string') {
    if (!validator.isISO8601(input)) {
      throw new AppError('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)', 400);
    }
    date = new Date(input);
  } else if (input instanceof Date) {
    date = input;
  } else {
    throw new AppError('Date must be a string or Date object', 400);
  }

  if (isNaN(date.getTime())) {
    throw new AppError('Invalid date', 400);
  }

  const now = new Date();

  if (futureOnly && date <= now) {
    throw new AppError('Date must be in the future', 400);
  }

  if (pastOnly && date >= now) {
    throw new AppError('Date must be in the past', 400);
  }

  if (minDate && date < minDate) {
    throw new AppError(`Date must be after ${minDate.toISOString().split('T')[0]}`, 400);
  }

  if (maxDate && date > maxDate) {
    throw new AppError(`Date must be before ${maxDate.toISOString().split('T')[0]}`, 400);
  }

  return date;
};

/**
 * Sanitize MongoDB ObjectId
 */
export const sanitizeObjectId = (input) => {
  if (typeof input !== 'string') {
    throw new AppError('ObjectId must be a string', 400);
  }

  if (!validator.isMongoId(input)) {
    throw new AppError('Invalid ObjectId format', 400);
  }

  return input;
};

/**
 * Sanitize array input
 */
export const sanitizeArray = (input, options = {}) => {
  const {
    maxLength = null,
    minLength = null,
    itemSanitizer = null,
    uniqueItems = false
  } = options;

  if (!Array.isArray(input)) {
    throw new AppError('Input must be an array', 400);
  }

  if (minLength !== null && input.length < minLength) {
    throw new AppError(`Array must have at least ${minLength} items`, 400);
  }

  if (maxLength !== null && input.length > maxLength) {
    throw new AppError(`Array must have at most ${maxLength} items`, 400);
  }

  let sanitized = input;

  // Apply item sanitizer if provided
  if (itemSanitizer && typeof itemSanitizer === 'function') {
    sanitized = input.map(itemSanitizer);
  }

  // Check for unique items if required
  if (uniqueItems) {
    const unique = [...new Set(sanitized)];
    if (unique.length !== sanitized.length) {
      throw new AppError('Array items must be unique', 400);
    }
  }

  return sanitized;
};

/**
 * Sanitize object input
 */
export const sanitizeObject = (input, schema = {}) => {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new AppError('Input must be an object', 400);
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(input)) {
    // Check if key is allowed in schema
    if (Object.keys(schema).length > 0 && !schema[key]) {
      continue; // Skip unknown fields
    }

    // Apply field-specific sanitization
    if (schema[key] && typeof schema[key] === 'function') {
      sanitized[key] = schema[key](value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Sanitize file upload data
 */
export const sanitizeFileData = (file, options = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']
  } = options;

  if (!file) {
    throw new AppError('File is required', 400);
  }

  // Check file size
  if (file.size > maxSize) {
    throw new AppError(`File size must not exceed ${maxSize / 1024 / 1024}MB`, 400);
  }

  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400);
  }

  // Check file extension
  const extension = file.originalname.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    throw new AppError(`File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`, 400);
  }

  // Sanitize filename
  const sanitizedFilename = file.originalname
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();

  return {
    ...file,
    originalname: sanitizedFilename
  };
};

/**
 * Comprehensive input sanitizer
 */
export const sanitizeInput = (input, type, options = {}) => {
  switch (type) {
    case 'string':
      return sanitizeString(input, options);
    case 'email':
      return sanitizeEmail(input);
    case 'phone':
      return sanitizePhone(input);
    case 'url':
      return sanitizeURL(input);
    case 'number':
      return sanitizeNumber(input, options);
    case 'date':
      return sanitizeDate(input, options);
    case 'objectId':
      return sanitizeObjectId(input);
    case 'array':
      return sanitizeArray(input, options);
    case 'object':
      return sanitizeObject(input, options);
    case 'file':
      return sanitizeFileData(input, options);
    default:
      return input;
  }
};

export default {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeURL,
  sanitizeNumber,
  sanitizeDate,
  sanitizeObjectId,
  sanitizeArray,
  sanitizeObject,
  sanitizeFileData,
  sanitizeInput
};
