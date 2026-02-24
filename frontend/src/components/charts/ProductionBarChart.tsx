import { useProject } from '../../contexts/ProjectContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../../utils/formatters';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useChartExport } from '../../hooks/useChartExport';
import { toast } from 'sonner';
import { useRef } from 'react';

export default function ProductionBarChart() {
  const { calculations } = useProject();
  const { exportChart } = useChartExport();
  // Ref points only to the chart wrapper, NOT the button
  const chartOnlyRef = useRef<HTMLDivElement>(null);

  if (!calculations) return null;

  const data = calculations.yearlyData.map((d, i) => ({
    year: `Year ${i + 1}`,
    production: d.production / 1000, // Convert to kg
  }));

  const handleExport = async () => {
    try {
      await exportChart(chartOnlyRef.current, 'production-bar-chart');
      toast.success('Chart exported successfully!');
    } catch (error) {
      toast.error('Failed to export chart');
      console.error(error);
    }
  };

  return (
    <div className="relative print-chart-container">
      {/* Export button is outside the chartOnlyRef so its SVG icon is not captured */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 hover:bg-muted no-print"
        onClick={handleExport}
        title="Export chart as image"
      >
        <Download className="w-4 h-4" />
      </Button>
      {/* Only this div is passed to exportChart */}
      <div ref={chartOnlyRef} className="chart-svg-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
            <XAxis dataKey="year" stroke="oklch(var(--foreground))" />
            <YAxis stroke="oklch(var(--foreground))" tickFormatter={(value) => `${value.toFixed(0)}kg`} />
            <Tooltip
              formatter={(value: number) => `${formatNumber(value, 2)} kg`}
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="production" fill="oklch(0.50 0.12 50)" name="Recovered Metal (kg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
