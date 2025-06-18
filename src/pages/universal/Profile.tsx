import React, { useState } from 'react';
import { UserIcon, MailIcon, KeyIcon, PhoneIcon, MapPinIcon, BellIcon, PaletteIcon, ShieldIcon, SaveIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
const Profile: React.FC = () => {
  const {
    user
  } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  // General settings form
  const [generalForm, setGeneralForm] = useState({
    fullName: user?.role && typeof user.role === 'object' && 'type' in user.role
      ? user.role.type === 'superadmin'
        ? 'Super Admin'
        : user.role.type === 'admin'
        ? 'Admin User'
        : 'John Investor'
      : 'John Investor',
    email: user?.email || 'user@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    bio: 'Investment professional with over 10 years of experience in portfolio management and financial analysis.'
  });
  // Password settings form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    investmentAlerts: true,
    marketUpdates: false,
    newsAndAnnouncements: true,
    performanceReports: true
  });
  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    compactMode: false,
    highContrast: false
  });
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setGeneralForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      checked
    } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value,
      type
    } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setAppearanceSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  const handleSaveGeneral = () => {
    // In a real app, this would save to the backend
    console.log('Saving general settings:', generalForm);
    // Show success message
  };
  const handleSavePassword = () => {
    // In a real app, this would validate and save to the backend
    console.log('Saving password:', passwordForm);
    // Show success message and clear form
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  return <DashboardLayout title="Profile Settings" subtitle="Manage your account preferences">
      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
        {/* Tabs navigation */}
        <div className="border-b border-slate-700">
          <div className="flex overflow-x-auto">
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'general' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('general')}>
              <UserIcon className="h-4 w-4 inline mr-2" />
              General
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'security' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('security')}>
              <ShieldIcon className="h-4 w-4 inline mr-2" />
              Security
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'notifications' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('notifications')}>
              <BellIcon className="h-4 w-4 inline mr-2" />
              Notifications
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'appearance' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('appearance')}>
              <PaletteIcon className="h-4 w-4 inline mr-2" />
              Appearance
            </button>
          </div>
        </div>
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && <div>
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-white mr-6">
                  {generalForm.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {generalForm.fullName}
                  </h2>
                  <p className="text-slate-400">Account Type: {user?.role && typeof user.role === 'object' && 'type' in user.role ? user.role.type : ''}</p>
                  <Button variant="secondary" size="sm" className="mt-2">
                    Upload Photo
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" name="fullName" value={generalForm.fullName} onChange={handleGeneralChange} leftIcon={<UserIcon size={18} />} fullWidth />
                <Input label="Email Address" name="email" type="email" value={generalForm.email} onChange={handleGeneralChange} leftIcon={<MailIcon size={18} />} fullWidth />
                <Input label="Phone Number" name="phone" value={generalForm.phone} onChange={handleGeneralChange} leftIcon={<PhoneIcon size={18} />} fullWidth />
                <Input label="Location" name="location" value={generalForm.location} onChange={handleGeneralChange} leftIcon={<MapPinIcon size={18} />} fullWidth />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Bio
                  </label>
                  <textarea name="bio" value={generalForm.bio} onChange={handleGeneralChange} rows={4} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={handleSaveGeneral} className="flex items-center">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>}
          {/* Security Settings */}
          {activeTab === 'security' && <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Change Password
              </h2>
              <div className="space-y-4 max-w-md">
                <Input label="Current Password" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} leftIcon={<KeyIcon size={18} />} fullWidth />
                <Input label="New Password" name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} leftIcon={<KeyIcon size={18} />} fullWidth />
                <Input label="Confirm New Password" name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} leftIcon={<KeyIcon size={18} />} fullWidth />
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-white mb-3">
                  Two-Factor Authentication
                </h3>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <ShieldIcon className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-white font-medium">
                        Enhance Your Account Security
                      </h4>
                      <p className="text-slate-400 text-sm mt-1">
                        Two-factor authentication adds an extra layer of
                        security to your account. In addition to your password,
                        you'll need to enter a code from your phone.
                      </p>
                      <Button variant="secondary" size="sm" className="mt-3">
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={handleSavePassword} className="flex items-center">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </div>}
          {/* Notification Settings */}
          {activeTab === 'notifications' && <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div>
                    <h3 className="text-white font-medium">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-slate-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="emailNotifications" checked={notificationSettings.emailNotifications} onChange={handleNotificationChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div>
                    <h3 className="text-white font-medium">
                      Investment Alerts
                    </h3>
                    <p className="text-sm text-slate-400">
                      Important updates about your investments
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="investmentAlerts" checked={notificationSettings.investmentAlerts} onChange={handleNotificationChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div>
                    <h3 className="text-white font-medium">Market Updates</h3>
                    <p className="text-sm text-slate-400">
                      Daily market news and trend updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="marketUpdates" checked={notificationSettings.marketUpdates} onChange={handleNotificationChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div>
                    <h3 className="text-white font-medium">
                      News & Announcements
                    </h3>
                    <p className="text-sm text-slate-400">
                      Company news and feature announcements
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="newsAndAnnouncements" checked={notificationSettings.newsAndAnnouncements} onChange={handleNotificationChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div>
                    <h3 className="text-white font-medium">
                      Performance Reports
                    </h3>
                    <p className="text-sm text-slate-400">
                      Weekly and monthly performance summaries
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="performanceReports" checked={notificationSettings.performanceReports} onChange={handleNotificationChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="primary" className="flex items-center">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </div>}
          {/* Appearance Settings */}
          {activeTab === 'appearance' && <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Appearance Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`border ${appearanceSettings.theme === 'dark' ? 'border-yellow-500' : 'border-slate-600'} rounded-lg p-3 cursor-pointer`} onClick={() => setAppearanceSettings(prev => ({
                  ...prev,
                  theme: 'dark'
                }))}>
                      <div className="h-20 bg-slate-800 rounded-md mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center">
                        <input type="radio" name="theme" value="dark" checked={appearanceSettings.theme === 'dark'} onChange={handleAppearanceChange} className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-slate-600 rounded-full" />
                        <span className="ml-2 text-white">Dark</span>
                      </div>
                    </div>
                    <div className={`border ${appearanceSettings.theme === 'light' ? 'border-yellow-500' : 'border-slate-600'} rounded-lg p-3 cursor-pointer`} onClick={() => setAppearanceSettings(prev => ({
                  ...prev,
                  theme: 'light'
                }))}>
                      <div className="h-20 bg-slate-200 rounded-md mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center">
                        <input type="radio" name="theme" value="light" checked={appearanceSettings.theme === 'light'} onChange={handleAppearanceChange} className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-slate-600 rounded-full" />
                        <span className="ml-2 text-white">Light</span>
                      </div>
                    </div>
                    <div className={`border ${appearanceSettings.theme === 'system' ? 'border-yellow-500' : 'border-slate-600'} rounded-lg p-3 cursor-pointer`} onClick={() => setAppearanceSettings(prev => ({
                  ...prev,
                  theme: 'system'
                }))}>
                      <div className="h-20 bg-gradient-to-r from-slate-800 to-slate-200 rounded-md mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center">
                        <input type="radio" name="theme" value="system" checked={appearanceSettings.theme === 'system'} onChange={handleAppearanceChange} className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-slate-600 rounded-full" />
                        <span className="ml-2 text-white">System</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div>
                      <h3 className="text-white font-medium">Compact Mode</h3>
                      <p className="text-sm text-slate-400">
                        Reduce spacing for more content
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="compactMode" checked={appearanceSettings.compactMode} onChange={handleAppearanceChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div>
                      <h3 className="text-white font-medium">High Contrast</h3>
                      <p className="text-sm text-slate-400">
                        Increase contrast for better readability
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="highContrast" checked={appearanceSettings.highContrast} onChange={handleAppearanceChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="primary" className="flex items-center">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </div>}
        </div>
      </div>
    </DashboardLayout>;
};
export default Profile;