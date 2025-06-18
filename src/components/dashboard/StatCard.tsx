import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import Card from '../ui/Card';
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
}
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  className = ''
}) => {
  const isTrendPositive = trend && trend > 0;
  const isTrendNegative = trend && trend < 0;
  return <Card className={`${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h4 className="mt-1 text-2xl font-semibold text-white">{value}</h4>
          {trend !== undefined && <div className="flex items-center mt-2">
              {isTrendPositive && <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />}
              {isTrendNegative && <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />}
              <span className={`text-sm font-medium ${isTrendPositive ? 'text-green-500' : isTrendNegative ? 'text-red-500' : 'text-slate-400'}`}>
                {trend > 0 ? '+' : ''}
                {trend}% {trendLabel || ''}
              </span>
            </div>}
        </div>
        <div className="rounded-lg p-2 bg-slate-700/50">{icon}</div>
      </div>
    </Card>;
};
export default StatCard;