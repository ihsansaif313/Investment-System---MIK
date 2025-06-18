import React from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  FileText, 
  Search, 
  Plus, 
  Database,
  Inbox,
  PieChart,
  Activity,
  DollarSign,
  Target
} from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  type?: 'companies' | 'users' | 'investments' | 'reports' | 'search' | 'general' | 'analytics' | 'activities' | 'portfolio' | 'marketplace';
  size?: 'sm' | 'md' | 'lg';
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  showIcon?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  type = 'general',
  size = 'md',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  showIcon = true
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'companies':
        return {
          icon: <Building2 className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Companies Found',
          defaultMessage: 'You haven\'t created any sub-companies yet. Create your first company to get started.',
          defaultActionLabel: 'Create Company'
        };
      case 'users':
        return {
          icon: <Users className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Users Found',
          defaultMessage: 'No users match your current filters. Try adjusting your search criteria.',
          defaultActionLabel: 'Add User'
        };
      case 'investments':
        return {
          icon: <TrendingUp className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Investments Found',
          defaultMessage: 'No investment opportunities are currently available. Check back later or create a new investment.',
          defaultActionLabel: 'Create Investment'
        };
      case 'reports':
        return {
          icon: <FileText className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Reports Available',
          defaultMessage: 'No reports have been generated yet. Generate your first report to see insights.',
          defaultActionLabel: 'Generate Report'
        };
      case 'search':
        return {
          icon: <Search className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Results Found',
          defaultMessage: 'We couldn\'t find anything matching your search. Try different keywords or filters.',
          defaultActionLabel: 'Clear Filters'
        };
      case 'analytics':
        return {
          icon: <PieChart className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Analytics Data',
          defaultMessage: 'Analytics data will appear here once you have some activity. Start by creating investments.',
          defaultActionLabel: 'View Investments'
        };
      case 'activities':
        return {
          icon: <Activity className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Recent Activity',
          defaultMessage: 'No recent activities to display. Activity will appear here as users interact with the system.',
          defaultActionLabel: 'Refresh'
        };
      case 'portfolio':
        return {
          icon: <DollarSign className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Investments in Portfolio',
          defaultMessage: 'Your portfolio is empty. Start investing to build your portfolio and track performance.',
          defaultActionLabel: 'Browse Investments'
        };
      case 'marketplace':
        return {
          icon: <Target className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Investment Opportunities',
          defaultMessage: 'No investment opportunities are currently available. New opportunities will appear here.',
          defaultActionLabel: 'Refresh'
        };
      default:
        return {
          icon: <Database className="w-12 h-12 text-slate-500" />,
          defaultTitle: 'No Data Available',
          defaultMessage: 'There\'s no data to display at the moment.',
          defaultActionLabel: 'Refresh'
        };
    }
  };

  const config = getEmptyStateConfig();
  const emptyTitle = title || config.defaultTitle;
  const emptyMessage = message || config.defaultMessage;
  const emptyIcon = icon || config.icon;
  const emptyActionLabel = actionLabel || config.defaultActionLabel;

  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      icon: 'w-16 h-16 mb-4',
      title: 'text-lg',
      message: 'text-sm',
      spacing: 'space-y-3'
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-20 h-20 mb-6',
      title: 'text-xl',
      message: 'text-base',
      spacing: 'space-y-4'
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-24 h-24 mb-8',
      title: 'text-2xl',
      message: 'text-lg',
      spacing: 'space-y-6'
    }
  };

  const sizeConfig = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeConfig.container} ${className}`}>
      {showIcon && (
        <div className={`flex items-center justify-center ${sizeConfig.icon}`}>
          {emptyIcon}
        </div>
      )}
      
      <div className={sizeConfig.spacing}>
        <h3 className={`font-semibold text-white ${sizeConfig.title}`}>
          {emptyTitle}
        </h3>
        
        <p className={`text-slate-400 ${sizeConfig.message} max-w-md mx-auto`}>
          {emptyMessage}
        </p>

        {(onAction || onSecondaryAction) && (
          <div className="flex gap-3 justify-center flex-wrap pt-2">
            {onAction && (
              <Button
                variant="primary"
                onClick={onAction}
                size={size === 'lg' ? 'md' : 'sm'}
                leftIcon={type === 'companies' || type === 'users' || type === 'investments' ? <Plus size={16} /> : undefined}
              >
                {emptyActionLabel}
              </Button>
            )}
            
            {onSecondaryAction && (
              <Button
                variant="secondary"
                onClick={onSecondaryAction}
                size={size === 'lg' ? 'md' : 'sm'}
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
