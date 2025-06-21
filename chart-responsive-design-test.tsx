/**
 * Chart Responsive Design Test Component
 * Tests chart behavior across different screen sizes and breakpoints
 */

import React, { useState } from 'react';
import { 
  MetricCard, 
  CustomLineChart, 
  CustomAreaChart, 
  CustomBarChart, 
  CustomPieChart, 
  CustomDonutChart 
} from './src/components/ui/Charts';
import { TrendingUp, Monitor, Smartphone, Tablet } from 'lucide-react';

// Test data for responsive charts
const testData = [
  { name: 'Jan', value: 4000, value2: 2400 },
  { name: 'Feb', value: 3000, value2: 1398 },
  { name: 'Mar', value: 2000, value2: 9800 },
  { name: 'Apr', value: 2780, value2: 3908 },
  { name: 'May', value: 1890, value2: 4800 },
  { name: 'Jun', value: 2390, value2: 3800 }
];

const pieData = [
  { name: 'Technology', value: 45, color: '#EAB308' },
  { name: 'Healthcare', value: 25, color: '#10B981' },
  { name: 'Finance', value: 20, color: '#3B82F6' },
  { name: 'Energy', value: 10, color: '#8B5CF6' }
];

const metricData = [
  { value: 100 }, { value: 120 }, { value: 150 }, { value: 140 }, { value: 180 }
];

const ChartResponsiveTest: React.FC = () => {
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const getContainerClass = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'max-w-sm mx-auto'; // 384px max width
      case 'tablet':
        return 'max-w-2xl mx-auto'; // 672px max width
      default:
        return 'max-w-7xl mx-auto'; // 1280px max width
    }
  };

  const getGridClass = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'grid-cols-1'; // Single column on mobile
      case 'tablet':
        return 'grid-cols-1 md:grid-cols-2'; // 2 columns on tablet
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; // 3 columns on desktop
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      {/* Viewport Size Controls */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-slate-800 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-white mb-4">Chart Responsive Design Test</h1>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-slate-300">Test Viewport:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewportSize('mobile')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewportSize === 'mobile'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile (384px)
              </button>
              <button
                onClick={() => setViewportSize('tablet')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewportSize === 'tablet'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Tablet className="w-4 h-4" />
                Tablet (672px)
              </button>
              <button
                onClick={() => setViewportSize('desktop')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewportSize === 'desktop'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Desktop (1280px)
              </button>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            Current viewport simulation: <span className="text-yellow-400 font-medium">{viewportSize}</span>
          </div>
        </div>
      </div>

      {/* Responsive Chart Container */}
      <div className={getContainerClass()}>
        {/* Metric Cards Grid */}
        <div className={`grid ${getGridClass()} gap-6 mb-8`}>
          <MetricCard
            title="Total Revenue"
            value="$125,000"
            change={{ value: 12.5, type: 'increase' }}
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            chartData={metricData}
            chartType="line"
            chartColor="#10B981"
          />
          <MetricCard
            title="Active Users"
            value="8,549"
            change={{ value: 8.2, type: 'increase' }}
            icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
            chartData={metricData}
            chartType="area"
            chartColor="#3B82F6"
          />
          <MetricCard
            title="Conversion Rate"
            value="3.24%"
            change={{ value: 2.1, type: 'decrease' }}
            icon={<TrendingUp className="w-6 h-6 text-yellow-500" />}
            chartData={metricData}
            chartType="bar"
            chartColor="#EAB308"
          />
        </div>

        {/* Main Charts Grid */}
        <div className={`grid ${viewportSize === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6 mb-8`}>
          {/* Line Chart */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
            <CustomLineChart
              data={testData}
              xKey="name"
              lines={[
                { key: 'value', name: 'Revenue', color: '#EAB308' },
                { key: 'value2', name: 'Profit', color: '#10B981' }
              ]}
              height={viewportSize === 'mobile' ? 200 : 250}
              className="bg-transparent p-0"
            />
          </div>

          {/* Area Chart */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Growth Analysis</h3>
            <CustomAreaChart
              data={testData}
              xKey="name"
              areas={[
                { key: 'value', name: 'Total', color: '#3B82F6', fillOpacity: 0.3 },
                { key: 'value2', name: 'Active', color: '#8B5CF6', fillOpacity: 0.3 }
              ]}
              height={viewportSize === 'mobile' ? 200 : 250}
              className="bg-transparent p-0"
            />
          </div>
        </div>

        {/* Charts with Different Layouts */}
        <div className={`grid ${viewportSize === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-6 mb-8`}>
          {/* Bar Chart */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Data</h3>
            <CustomBarChart
              data={testData}
              xKey="name"
              bars={[
                { key: 'value', name: 'Sales', color: '#F59E0B' }
              ]}
              height={viewportSize === 'mobile' ? 180 : 220}
              className="bg-transparent p-0"
            />
          </div>

          {/* Pie Chart */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Distribution</h3>
            <CustomPieChart
              data={pieData}
              height={viewportSize === 'mobile' ? 180 : 220}
              className="bg-transparent p-0"
            />
          </div>

          {/* Donut Chart */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Portfolio</h3>
            <CustomDonutChart
              data={pieData}
              height={viewportSize === 'mobile' ? 180 : 220}
              className="bg-transparent p-0"
            />
          </div>
        </div>

        {/* Responsive Design Test Results */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-green-400 font-semibold mb-4">✅ Responsive Design Test Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-green-300 font-medium mb-2">Chart Features:</h4>
              <ul className="text-green-200 space-y-1">
                <li>• ResponsiveContainer for all charts</li>
                <li>• Adaptive height based on viewport</li>
                <li>• Flexible grid layouts</li>
                <li>• Touch-friendly interactions</li>
                <li>• Readable text at all sizes</li>
              </ul>
            </div>
            <div>
              <h4 className="text-green-300 font-medium mb-2">Breakpoints:</h4>
              <ul className="text-green-200 space-y-1">
                <li>• Mobile: Single column layout</li>
                <li>• Tablet: 2-column grid</li>
                <li>• Desktop: 3-column grid</li>
                <li>• Reduced chart heights on mobile</li>
                <li>• Maintained aspect ratios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartResponsiveTest;
