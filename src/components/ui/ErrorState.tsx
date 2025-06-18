import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: string | Error;
  onRetry?: () => void;
  onRefresh?: () => void;
  type?: 'general' | 'network' | 'permission' | 'notFound';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDetails?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  error,
  onRetry,
  onRefresh,
  type = 'general',
  size = 'md',
  className = '',
  showDetails = false
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff className="w-8 h-8 text-red-500" />,
          defaultTitle: 'Connection Error',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
          bgColor: 'bg-red-500/20',
          iconColor: 'text-red-500'
        };
      case 'permission':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
          defaultTitle: 'Access Denied',
          defaultMessage: 'You don\'t have permission to access this resource.',
          bgColor: 'bg-yellow-500/20',
          iconColor: 'text-yellow-500'
        };
      case 'notFound':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-blue-500" />,
          defaultTitle: 'Not Found',
          defaultMessage: 'The requested resource could not be found.',
          bgColor: 'bg-blue-500/20',
          iconColor: 'text-blue-500'
        };
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          defaultTitle: 'Something went wrong',
          defaultMessage: 'An unexpected error occurred. Please try again.',
          bgColor: 'bg-red-500/20',
          iconColor: 'text-red-500'
        };
    }
  };

  const config = getErrorConfig();
  const errorTitle = title || config.defaultTitle;
  const errorMessage = message || config.defaultMessage;

  const sizeClasses = {
    sm: {
      container: 'p-4',
      icon: 'w-12 h-12 mb-3',
      title: 'text-lg',
      message: 'text-sm',
      spacing: 'space-y-3'
    },
    md: {
      container: 'p-6',
      icon: 'w-16 h-16 mb-4',
      title: 'text-xl',
      message: 'text-base',
      spacing: 'space-y-4'
    },
    lg: {
      container: 'p-8',
      icon: 'w-20 h-20 mb-6',
      title: 'text-2xl',
      message: 'text-lg',
      spacing: 'space-y-6'
    }
  };

  const sizeConfig = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeConfig.container} ${className}`}>
      <div className={`${config.bgColor} rounded-full flex items-center justify-center ${sizeConfig.icon}`}>
        {config.icon}
      </div>
      
      <div className={sizeConfig.spacing}>
        <h3 className={`font-semibold text-white ${sizeConfig.title}`}>
          {errorTitle}
        </h3>
        
        <p className={`text-slate-400 ${sizeConfig.message} max-w-md`}>
          {errorMessage}
        </p>

        {showDetails && error && import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-slate-700 rounded text-left max-w-md">
            <h4 className="text-sm font-medium text-red-400 mb-2">Error Details:</h4>
            <pre className="text-xs text-slate-300 overflow-auto whitespace-pre-wrap">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </div>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          {onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
              size={size === 'lg' ? 'md' : 'sm'}
            >
              Try Again
            </Button>
          )}
          
          {onRefresh && (
            <Button
              variant="secondary"
              onClick={onRefresh}
              leftIcon={<RefreshCw size={16} />}
              size={size === 'lg' ? 'md' : 'sm'}
            >
              Refresh
            </Button>
          )}

          {type === 'network' && (
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              leftIcon={<Wifi size={16} />}
              size={size === 'lg' ? 'md' : 'sm'}
            >
              Reload Page
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
