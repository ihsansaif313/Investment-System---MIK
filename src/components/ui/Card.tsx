import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  glassmorphism?: boolean;
}
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  footer,
  glassmorphism = false
}) => {
  const baseClasses = 'rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl overflow-hidden transition-all duration-200';
  const glassmorphismClasses = glassmorphism
    ? 'bg-slate-800/60 backdrop-blur-md border border-slate-700/50'
    : 'bg-slate-800 border border-slate-700 hover:border-slate-600';

  return <div className={`${baseClasses} ${glassmorphismClasses} ${className}`}>
      {(title || subtitle) && <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-700">
          {title && <h3 className="text-base sm:text-lg lg:text-xl font-medium text-white">{title}</h3>}
          {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>}
      <div className="p-3 sm:p-4 lg:p-6">{children}</div>
      {footer && <div className="p-3 sm:p-4 lg:p-6 border-t border-slate-700 bg-slate-800/50">
          {footer}
        </div>}
    </div>;
};
export default Card;