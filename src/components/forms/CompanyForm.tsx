import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { validateCompanyForm, validateField, ValidationError, CompanyFormData } from '../../utils/validation';

interface CompanyFormProps {
  formData: CompanyFormData;
  setFormData: (data: CompanyFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
}

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Energy',
  'Transportation',
  'Real Estate',
  'Entertainment',
  'Agriculture',
  'Construction',
  'Consulting',
  'Other'
];

const CATEGORY_OPTIONS = [
  'Startup',
  'SME',
  'Enterprise',
  'Corporation',
  'Subsidiary',
  'Partnership',
  'Non-Profit',
  'Government',
  'Other'
];

export const CompanyForm: React.FC<CompanyFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting = false
}) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form whenever formData changes
  useEffect(() => {
    const validation = validateCompanyForm(formData);
    setIsFormValid(validation.isValid);
  }, [formData]);

  const handleFieldChange = (fieldName: keyof CompanyFormData, value: string) => {
    // Update form data
    setFormData({ ...formData, [fieldName]: value });

    // Mark field as touched
    setTouched({ ...touched, [fieldName]: true });

    // Validate field in real-time
    const error = validateField(fieldName, value, formData);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error ? error.message : ''
    }));
  };

  const handleFieldBlur = (fieldName: keyof CompanyFormData) => {
    setTouched({ ...touched, [fieldName]: true });
    
    // Validate field on blur
    const error = validateField(fieldName, formData[fieldName], formData);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error ? error.message : ''
    }));
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate entire form
    const validation = validateCompanyForm(formData);
    
    if (!validation.isValid) {
      // Set all validation errors
      const errors = validation.errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>);
      setFieldErrors(errors);
      return;
    }

    onSubmit();
  };

  const getFieldError = (fieldName: string): string => {
    return touched[fieldName] ? fieldErrors[fieldName] || '' : '';
  };

  const getFieldClassName = (fieldName: string): string => {
    const baseClass = "w-full bg-slate-700 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 transition-colors";
    const hasError = touched[fieldName] && fieldErrors[fieldName];
    
    if (hasError) {
      return `${baseClass} border-red-500 focus:ring-red-500`;
    }
    return `${baseClass} border-slate-600 focus:ring-yellow-500`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => handleFieldBlur('name')}
            className={getFieldClassName('name')}
            placeholder="Enter company name"
            disabled={isSubmitting}
          />
          {getFieldError('name') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('name')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Industry *
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleFieldChange('industry', e.target.value)}
            onBlur={() => handleFieldBlur('industry')}
            className={getFieldClassName('industry')}
            disabled={isSubmitting}
          >
            <option value="">Select an industry</option>
            {INDUSTRY_OPTIONS.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          {getFieldError('industry') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('industry')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            onBlur={() => handleFieldBlur('category')}
            className={getFieldClassName('category')}
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {getFieldError('category') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('category')}</p>
          )}
        </div>
        <div></div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          onBlur={() => handleFieldBlur('description')}
          className={getFieldClassName('description')}
          rows={3}
          placeholder="Brief description of the company"
          disabled={isSubmitting}
        />
        {getFieldError('description') && (
          <p className="mt-1 text-sm text-red-400">{getFieldError('description')}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
            onBlur={() => handleFieldBlur('contactEmail')}
            className={getFieldClassName('contactEmail')}
            placeholder="contact@company.com"
            disabled={isSubmitting}
          />
          {getFieldError('contactEmail') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('contactEmail')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
            onBlur={() => handleFieldBlur('contactPhone')}
            className={getFieldClassName('contactPhone')}
            placeholder="+1 (555) 123-4567"
            disabled={isSubmitting}
          />
          {getFieldError('contactPhone') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('contactPhone')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Established Date
          </label>
          <input
            type="date"
            value={formData.establishedDate}
            onChange={(e) => handleFieldChange('establishedDate', e.target.value)}
            onBlur={() => handleFieldBlur('establishedDate')}
            className={getFieldClassName('establishedDate')}
            disabled={isSubmitting}
          />
          {getFieldError('establishedDate') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('establishedDate')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleFieldChange('website', e.target.value)}
            onBlur={() => handleFieldBlur('website')}
            className={getFieldClassName('website')}
            placeholder="https://company.com"
            disabled={isSubmitting}
          />
          {getFieldError('website') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('website')}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => handleFieldChange('address', e.target.value)}
          onBlur={() => handleFieldBlur('address')}
          className={getFieldClassName('address')}
          rows={2}
          placeholder="Company address"
          disabled={isSubmitting}
        />
        {getFieldError('address') && (
          <p className="mt-1 text-sm text-red-400">{getFieldError('address')}</p>
        )}
      </div>

      {/* Validation Summary */}
      {!isFormValid && Object.keys(touched).length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
          <h4 className="text-sm font-medium text-red-400 mb-2">Please fix the following errors:</h4>
          <ul className="text-sm text-red-300 space-y-1">
            {Object.entries(fieldErrors).filter(([_, error]) => error).map(([field, error]) => (
              <li key={field}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : submitLabel}
        </Button>
      </div>
    </div>
  );
};
