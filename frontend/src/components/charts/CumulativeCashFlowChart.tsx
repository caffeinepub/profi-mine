import { useProject } from '../../contexts/ProjectContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useChartExport } from '../../hooks/useChartExport';
import { toast } from 'sonner';
import { useRef } from 'react';

export default function CumulativeCashFlowChart() {
  const { calculations, inputs } = useProject();
  const { exportChart } = useChartExport();
  // Ref points only to the chart wrapper, NOT the button
  const chartOnlyRef = useRef<HTMLDivElement>(null);

  if (!calculations) return null;

  const data = [
    { year: 'Year 0', cumulativeFcf: -inputs.initialCapex },
    ...calculations.yearlyData.map((d, i) => ({
      year: `Year ${i + 1}`,
      cumulativeFcf: d.cumulativeFcf,
    })),
  ];

  const handleExport = async () => {
    try {
      await exportChart(chartOnlyRef.current, 'cumulative-cash-flow-chart');
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
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
            <XAxis dataKey="year" stroke="oklch(var(--foreground))" />
            <YAxis stroke="oklch(var(--foreground))" tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="oklch(var(--muted-foreground))" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="cumulativeFcf"
              stroke="oklch(0.55 0.15 60)"
              strokeWidth={2}
              name="Cumulative FCF"
              dot={{ fill: 'oklch(0.55 0.15 60)', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
