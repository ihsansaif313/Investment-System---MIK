import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] touch-manipulation';
  const variantClasses = {
    primary: 'bg-yellow-500 text-slate-900 hover:bg-yellow-600 focus-visible:ring-yellow-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-teal-500 text-white hover:bg-teal-600 focus-visible:ring-teal-500 shadow-lg hover:shadow-xl',
    outline: 'border border-slate-600 bg-transparent hover:bg-slate-800 text-slate-200 hover:border-slate-500 focus-visible:ring-slate-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-lg hover:shadow-xl'
  };
  const sizeClasses = {
    sm: 'h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm',
    md: 'h-9 sm:h-10 px-3 sm:px-4 text-sm sm:text-base',
    lg: 'h-10 sm:h-11 px-4 sm:px-6 text-base sm:text-lg'
  };
  const widthClass = fullWidth ? 'w-full' : '';

  return <button
    className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
      {isLoading && <svg className="animate-spin -ml-1 mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>}
      {!isLoading && leftIcon && <span className="mr-1.5 sm:mr-2 flex-shrink-0">{leftIcon}</span>}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon && <span className="ml-1.5 sm:ml-2 flex-shrink-0">{rightIcon}</span>}
    </button>;
};
export default Button;