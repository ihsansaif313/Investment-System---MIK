import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

// Custom Tooltip Component
const CustomTooltip: React.FC<TooltipProps<any, any>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
        <p className="text-slate-300 text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Line Chart Component
interface LineChartProps {
  data: any[];
  xKey: string;
  lines: {
    key: string;
    name: string;
    color: string;
    strokeWidth?: number;
  }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

export const CustomLineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  lines,
  height = 300,
  showGrid = true,
  showLegend = true,
  className = '',
}) => {
  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
        <div
          className="flex items-center justify-center text-slate-400"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 text-slate-500" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
          <XAxis
            dataKey={xKey}
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Area Chart Component
interface AreaChartProps {
  data: any[];
  xKey: string;
  areas: {
    key: string;
    name: string;
    color: string;
    fillOpacity?: number;
  }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

export const CustomAreaChart: React.FC<AreaChartProps> = ({
  data,
  xKey,
  areas,
  height = 300,
  showGrid = true,
  showLegend = true,
  className = '',
}) => {
  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
        <div
          className="flex items-center justify-center text-slate-400"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-slate-500" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
          <XAxis
            dataKey={xKey}
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {areas.map((area) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              name={area.name}
              stroke={area.color}
              fill={area.color}
              fillOpacity={area.fillOpacity || 0.3}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: any[];
  xKey: string;
  bars: {
    key: string;
    name: string;
    color: string;
  }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

export const CustomBarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  bars,
  height = 300,
  showGrid = true,
  showLegend = true,
  className = '',
}) => {
  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
        <div
          className="flex items-center justify-center text-slate-400"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <PieChart className="w-12 h-12 mx-auto mb-2 text-slate-500" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
          <XAxis
            dataKey={xKey}
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Pie Chart Component
interface PieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

export const CustomPieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  className = '',
}) => {
  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
        <div
          className="flex items-center justify-center text-slate-400"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <PieChart className="w-12 h-12 mx-auto mb-2 text-slate-500" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Donut Chart Component (Pie chart with inner radius)
export const CustomDonutChart: React.FC<PieChartProps> = (props) => {
  return <CustomPieChart {...props} innerRadius={60} />;
};

// Metric Card with Mini Chart
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  chartData?: any[];
  chartType?: 'line' | 'area' | 'bar';
  chartColor?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  chartData,
  chartType = 'line',
  chartColor = '#EAB308',
  icon,
  className = '',
}) => {
  const renderMiniChart = () => {
    if (!chartData || chartData.length === 0) return null;

    const chartProps = {
      data: chartData,
      height: 60,
      showGrid: false,
      showLegend: false,
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart {...chartProps}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                fill={chartColor}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={60}>
            <BarChart {...chartProps}>
              <Bar dataKey="value" fill={chartColor} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={60}>
            <LineChart {...chartProps}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-slate-400">{title}</h3>
            <p className="text-2xl font-bold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        </div>
        
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            change.type === 'increase' ? 'text-green-400' : 'text-red-400'
          }`}>
            <span>{change.type === 'increase' ? '↗' : '↘'}</span>
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
      
      {chartData && chartData.length > 0 && (
        <div className="mt-4">
          {renderMiniChart()}
        </div>
      )}
    </div>
  );
};
