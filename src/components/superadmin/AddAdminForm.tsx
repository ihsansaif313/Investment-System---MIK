import React, { useState } from 'react';
import { UserPlusIcon, XIcon } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
interface AddAdminFormProps {
  companyId: string;
  companyName: string;
  onClose: () => void;
  onAdminAdded: () => void;
}
const AddAdminForm: React.FC<AddAdminFormProps> = ({
  companyId,
  companyName,
  onClose,
  onAdminAdded
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    title: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const validateForm = () => {
    const newErrors: {
      [key: string]: string;
    } = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Admin created:', {
        ...formData,
        companyId,
        role: 'admin'
      });
      // Notify parent component
      onAdminAdded();
      // Close the form
      onClose();
    } catch (error) {
      console.error('Error creating admin:', error);
      setErrors({
        form: 'Failed to create admin. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center">
            <UserPlusIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-white">
              Add Admin for {companyName}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <Input label="Full Name" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} error={errors.fullName} fullWidth />
            <Input label="Email" name="email" type="email" placeholder="admin@example.com" value={formData.email} onChange={handleChange} error={errors.email} fullWidth />
            <Input label="Phone Number" name="phone" placeholder="+1 (555) 123-4567" value={formData.phone} onChange={handleChange} error={errors.phone} fullWidth />
            <Input label="Job Title" name="title" placeholder="Company Administrator" value={formData.title} onChange={handleChange} error={errors.title} fullWidth />
            <Input label="Password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} error={errors.password} fullWidth />
            <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} fullWidth />
            {errors.form && <div className="text-red-500 text-sm">{errors.form}</div>}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Admin Account
            </Button>
          </div>
        </form>
      </div>
    </div>;
};
export default AddAdminForm;