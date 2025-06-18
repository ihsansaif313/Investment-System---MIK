import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../ui/Card';
interface InvestmentData {
  name: string;
  value: number;
  roi: number;
  company: string;
  fill: string;
}
interface InvestmentTreemapProps {
  data: InvestmentData[];
  title: string;
  className?: string;
}
const CustomTooltip = ({
  active,
  payload
}: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-lg">
        <p className="font-medium text-white">{data.name}</p>
        <p className="text-sm text-slate-300">Company: {data.company}</p>
        <p className="text-sm text-green-500">
          ${data.value.toLocaleString()} • ROI: {data.roi}%
        </p>
      </div>;
  }
  return null;
};
const InvestmentTreemap: React.FC<InvestmentTreemapProps> = ({
  data,
  title,
  className = ''
}) => {
  return <Card className={`${className}`} title={title}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={data} dataKey="value" aspectRatio={4 / 3} stroke="#0f172a" fill="#2dd4bf" content={({
          root,
          depth,
          x,
          y,
          width,
          height,
          index,
          payload,
          colors,
          rank,
          name
        }) => {
          return <g>
                  <rect x={x} y={y} width={width} height={height} style={{
              fill: data[index]?.fill || '#2dd4bf',
              stroke: '#0f172a',
              strokeWidth: 2,
              strokeOpacity: 1
            }} />
                  {width > 30 && height > 30 && <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={width < 50 ? 8 : 12} fontWeight="bold">
                      {name}
                    </text>}
                </g>;
        }}>
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </Card>;
};
export default InvestmentTreemap;