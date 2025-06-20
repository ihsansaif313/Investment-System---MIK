import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, BuildingIcon, MapPinIcon, UsersIcon, GlobeIcon, CalendarIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
// Changed import from useCompany to useData
import { useData } from '../../contexts/DataContext';
import { INDUSTRY_OPTIONS } from '../../constants/formOptions';

const CreateSubCompany: React.FC = () => {
  const navigate = useNavigate();
  // Changed to useData hook
  const {
    createSubCompany,
    state: { loading }
  } = useData();

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    founded: '',
    location: '',
    employees: '',
    website: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=100&h=100&auto=format&fit=crop'
  });
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  const validateForm = () => {
    const newErrors: {
      [key: string]: string;
    } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.founded.trim()) {
      newErrors.founded = 'Founded year is required';
    } else if (!/^\d{4}$/.test(formData.founded)) {
      newErrors.founded = 'Please enter a valid year (YYYY)';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.employees.trim()) {
      newErrors.employees = 'Number of employees is required';
    } else if (isNaN(Number(formData.employees))) {
      newErrors.employees = 'Please enter a valid number';
    }
    if (formData.website.trim() && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      // Create a new company object
      const newCompany = {
        ...formData,
        employees: Number(formData.employees),
        status: 'active',
        performance: {
          profit: 0,
          loss: 0,
          roi: 0
        },
        contacts: []
      };
      // Prepare data matching CreateSubCompanyForm type
      const subCompanyData = {
        name: newCompany.name,
        industry: newCompany.industry,
        description: newCompany.description,
        address: newCompany.location,
        established_date: new Date(Number(formData.founded), 0, 1),
        contact_email: newCompany.adminEmail,
        phone: '', // no phone field in form, set empty string
        adminEmail: newCompany.adminEmail,
        adminFirstName: newCompany.adminFirstName,
        adminLastName: newCompany.adminLastName,
        adminPhone: '', // no adminPhone field in form, set empty string
      };
      await createSubCompany(subCompanyData);
      navigate('/superadmin/companies');
    } catch (error: any) {
      console.error('Error creating company:', error);
      if (error.response?.status === 429) {
        alert('Too many requests. Please wait and try again later.');
      } else if (error.response?.status === 401) {
        alert('Unauthorized. Please login again.');
        window.location.href = '/login';
      } else {
        alert('Failed to create company. Please try again.');
      }
    }
  };
  const handleBack = () => {
    navigate('/superadmin/companies');
  };
  // Use industry options from constants
  return <DashboardLayout title="Create Sub-Company" subtitle="Add a new subsidiary company to your portfolio">
      <div className="mb-6">
        <Button variant="secondary" onClick={handleBack} className="flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
      </div>
      <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center">
            <BuildingIcon className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-white">
              Company Information
            </h2>
          </div>
          <p className="text-slate-400 mt-1">
            Fill in the details to create a new subsidiary company
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input label="Company Name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter company name" error={errors.name} fullWidth />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Industry
              </label>
              <div className="relative">
                <select name="industry" value={formData.industry} onChange={handleChange} className={`w-full bg-slate-700 border ${errors.industry ? 'border-red-500' : 'border-slate-600'} rounded-md py-2 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}>
                  <option value="">Select an industry</option>
                  {INDUSTRY_OPTIONS.map(industry => <option key={industry} value={industry}>
                      {industry}
                    </option>)}
                </select>
                <div className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
              {errors.industry && <p className="mt-1 text-xs text-red-500">{errors.industry}</p>}
            </div>
            <div>
              <Input label="Founded Year" name="founded" value={formData.founded} onChange={handleChange} placeholder="YYYY" error={errors.founded} leftIcon={<CalendarIcon size={18} />} fullWidth />
            </div>
            <div>
              <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" error={errors.location} leftIcon={<MapPinIcon size={18} />} fullWidth />
            </div>
            <div>
              <Input label="Number of Employees" name="employees" value={formData.employees} onChange={handleChange} placeholder="e.g. 50" error={errors.employees} leftIcon={<UsersIcon size={18} />} fullWidth />
            </div>
            <div>
              <Input label="Website" name="website" value={formData.website} onChange={handleChange} placeholder="www.example.com" error={errors.website} leftIcon={<GlobeIcon size={18} />} fullWidth />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Company Description
              </label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter a brief description of the company" rows={4} className={`w-full bg-slate-700 border ${errors.description ? 'border-red-500' : 'border-slate-600'} rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}></textarea>
              {errors.description && <p className="mt-1 text-xs text-red-500">
                  {errors.description}
                </p>}
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-400 mb-4">
                Note: Company performance data, contacts, and documents can be
                added after creating the company.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={handleBack}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading.companies}>
              Create Company
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>;
};
export default CreateSubCompany;
