# Chart Components Documentation

## Overview
This document provides comprehensive documentation for the chart components used in the Investment Management System. All charts are built using Recharts library with custom styling and optimizations.

## Available Chart Components

### 1. CustomLineChart
**Purpose**: Display trends and time-series data with multiple lines.

**Props**:
- `data: any[]` - Array of data points
- `xKey: string` - Key for X-axis values
- `lines: LineConfig[]` - Configuration for each line
- `height?: number` - Chart height (default: 300)
- `showGrid?: boolean` - Show grid lines (default: true)
- `showLegend?: boolean` - Show legend (default: true)
- `className?: string` - Additional CSS classes

**Usage Example**:
```tsx
<CustomLineChart
  data={performanceData}
  xKey="date"
  lines={[
    { key: 'revenue', name: 'Revenue', color: '#EAB308' },
    { key: 'profit', name: 'Profit', color: '#10B981' }
  ]}
  height={300}
/>
```

### 2. CustomAreaChart
**Purpose**: Display filled area charts for cumulative data visualization.

**Props**:
- `data: any[]` - Array of data points
- `xKey: string` - Key for X-axis values
- `areas: AreaConfig[]` - Configuration for each area
- `height?: number` - Chart height (default: 300)
- `showGrid?: boolean` - Show grid lines (default: true)
- `showLegend?: boolean` - Show legend (default: true)
- `className?: string` - Additional CSS classes

**Usage Example**:
```tsx
<CustomAreaChart
  data={portfolioData}
  xKey="month"
  areas={[
    { key: 'invested', name: 'Invested', color: '#3B82F6', fillOpacity: 0.3 },
    { key: 'value', name: 'Current Value', color: '#10B981', fillOpacity: 0.3 }
  ]}
  height={250}
/>
```

### 3. CustomBarChart
**Purpose**: Display categorical data with vertical bars.

**Props**:
- `data: any[]` - Array of data points
- `xKey: string` - Key for X-axis values
- `bars: BarConfig[]` - Configuration for each bar series
- `height?: number` - Chart height (default: 300)
- `showGrid?: boolean` - Show grid lines (default: true)
- `showLegend?: boolean` - Show legend (default: true)
- `className?: string` - Additional CSS classes

**Usage Example**:
```tsx
<CustomBarChart
  data={monthlyData}
  xKey="month"
  bars={[
    { key: 'investments', name: 'Investments', color: '#EAB308' }
  ]}
  height={250}
/>
```

### 4. CustomPieChart
**Purpose**: Display proportional data in a circular chart.

**Props**:
- `data: PieDataPoint[]` - Array with name, value, and color
- `height?: number` - Chart height (default: 300)
- `showLegend?: boolean` - Show legend (default: true)
- `innerRadius?: number` - Inner radius (default: 0)
- `outerRadius?: number` - Outer radius (default: 80)
- `className?: string` - Additional CSS classes

**Usage Example**:
```tsx
<CustomPieChart
  data={[
    { name: 'Technology', value: 45, color: '#EAB308' },
    { name: 'Healthcare', value: 25, color: '#10B981' },
    { name: 'Finance', value: 20, color: '#3B82F6' },
    { name: 'Energy', value: 10, color: '#8B5CF6' }
  ]}
  height={250}
/>
```

### 5. CustomDonutChart
**Purpose**: Pie chart with inner radius for better visual hierarchy.

**Props**: Same as CustomPieChart but with fixed inner radius of 60.

**Usage Example**:
```tsx
<CustomDonutChart
  data={portfolioDistribution}
  height={220}
  showLegend={true}
/>
```

### 6. MetricCard
**Purpose**: Display KPI metrics with mini charts.

**Props**:
- `title: string` - Card title
- `value: string | number` - Main metric value
- `change?: ChangeConfig` - Change indicator
- `chartData?: any[]` - Data for mini chart
- `chartType?: 'line' | 'area' | 'bar'` - Mini chart type
- `chartColor?: string` - Chart color (default: '#EAB308')
- `icon?: React.ReactNode` - Icon component
- `className?: string` - Additional CSS classes

**Usage Example**:
```tsx
<MetricCard
  title="Total Revenue"
  value="$125,000"
  change={{ value: 12.5, type: 'increase' }}
  icon={<TrendingUp className="w-6 h-6 text-green-500" />}
  chartData={revenueData}
  chartType="line"
/>
```

## Color Palette

### Primary Colors
- **Primary**: `#EAB308` (Yellow) - Main brand color
- **Success**: `#10B981` (Green) - Positive values, profits
- **Info**: `#3B82F6` (Blue) - Information, neutral data
- **Warning**: `#F59E0B` (Orange) - Warnings, attention
- **Danger**: `#EF4444` (Red) - Negative values, losses
- **Purple**: `#8B5CF6` - Secondary accent
- **Teal**: `#06B6D4` - Additional accent

### Background Colors
- **Chart Background**: `bg-slate-800` (#1E293B)
- **Border**: `border-slate-700` (#334155)
- **Text**: `text-slate-300` (#CBD5E1)
- **Muted Text**: `text-slate-400` (#94A3B8)

## Performance Optimizations

### React.memo
All chart components are wrapped with `React.memo` to prevent unnecessary re-renders:
```tsx
export const CustomLineChart = React.memo(({ ... }) => {
  // Component implementation
});
```

### Data Memoization
Chart data is memoized using `useMemo` to prevent expensive recalculations:
```tsx
const processedData = useMemo(() => data || [], [data]);
```

### ResponsiveContainer
All charts use Recharts' `ResponsiveContainer` for automatic resizing:
```tsx
<ResponsiveContainer width="100%" height={height}>
  <LineChart data={processedData}>
    {/* Chart content */}
  </LineChart>
</ResponsiveContainer>
```

## Responsive Design

### Breakpoints
- **Mobile** (< 768px): Single column layout, reduced chart heights
- **Tablet** (768px - 1024px): 2-column grid layout
- **Desktop** (> 1024px): 3-4 column grid layout

### Grid Classes
```tsx
// Responsive grid for metric cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Responsive grid for charts
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

## Empty State Handling

All chart components include proper empty state handling:
```tsx
if (!data || data.length === 0) {
  return (
    <div className="flex items-center justify-center text-slate-400">
      <div className="text-center">
        <ChartIcon className="w-12 h-12 mx-auto mb-2 text-slate-500" />
        <p className="text-sm">No data available</p>
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Data Structure
- Ensure consistent data structure across all chart components
- Use meaningful property names for better readability
- Include proper TypeScript types for data validation

### 2. Performance
- Limit data points to 100-200 for optimal performance
- Use data aggregation for large datasets
- Implement proper loading states

### 3. Accessibility
- Maintain proper color contrast ratios
- Include meaningful labels and tooltips
- Ensure charts are readable at all screen sizes

### 4. Styling
- Use consistent color palette across all charts
- Maintain proper spacing and typography
- Follow dark theme design standards

## Testing

### Manual Testing Checklist
- [ ] Charts render correctly with valid data
- [ ] Empty states display properly
- [ ] Responsive design works across breakpoints
- [ ] Tooltips show correct information
- [ ] Colors match design system
- [ ] Performance is acceptable with large datasets

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues
1. **Chart not rendering**: Check data structure and required props
2. **Performance issues**: Reduce data points or implement pagination
3. **Styling inconsistencies**: Verify color palette usage
4. **Responsive issues**: Check grid classes and breakpoints

### Debug Tips
- Use React DevTools Profiler for performance analysis
- Check browser console for Recharts warnings
- Verify data structure matches component expectations
- Test with different data sizes and edge cases
