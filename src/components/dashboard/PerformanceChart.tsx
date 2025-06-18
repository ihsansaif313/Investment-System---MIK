import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
interface PerformanceChartProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
    benchmark?: number;
  }>;
  className?: string;
}
const PerformanceChart: React.FC<PerformanceChartProps> = ({
  title,
  data,
  className = ''
}) => {
  return <Card className={`${className}`} title={title}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 5
        }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{
            fill: '#94a3b8'
          }} tickLine={{
            stroke: '#475569'
          }} />
            <YAxis stroke="#94a3b8" tick={{
            fill: '#94a3b8'
          }} tickLine={{
            stroke: '#475569'
          }} tickFormatter={value => `$${value}`} />
            <Tooltip contentStyle={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            color: '#f8fafc'
          }} />
            <Line type="monotone" dataKey="value" name="Performance" stroke="#e6b325" activeDot={{
            r: 8,
            fill: '#e6b325',
            stroke: '#0f172a'
          }} strokeWidth={2} />
            {data[0]?.benchmark !== undefined && <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="#2dd4bf" strokeDasharray="5 5" strokeWidth={2} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>;
};
export default PerformanceChart;