import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}
const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const baseClasses = 'bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors';
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-red-500 focus:ring-red-500' : '';
  const paddingClass = leftIcon ? 'pl-10' : rightIcon || isPassword ? 'pr-10' : '';
  return <div className={`${widthClass} ${className}`}>
      {label && <label className="block text-sm font-medium text-slate-300 mb-1">
          {label}
        </label>}
      <div className="relative">
        {leftIcon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>}
        <input className={`${baseClasses} ${widthClass} ${errorClass} ${paddingClass} h-10 px-4 py-2`} type={isPassword ? showPassword ? 'text' : 'password' : type} {...props} />
        {rightIcon && !isPassword && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            {rightIcon}
          </div>}
        {isPassword && <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>;
};
export default Input;