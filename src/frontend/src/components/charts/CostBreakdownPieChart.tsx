import { useProject } from '../../contexts/ProjectContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useChartExport } from '../../hooks/useChartExport';
import { toast } from 'sonner';
import { useRef } from 'react';

const COLORS = [
  'oklch(0.55 0.15 60)',
  'oklch(0.50 0.12 50)',
  'oklch(0.45 0.10 40)',
  'oklch(0.60 0.18 70)',
  'oklch(0.40 0.08 30)',
];

export default function CostBreakdownPieChart() {
  const { calculations } = useProject();
  const { exportChart } = useChartExport();
  const chartRef = useRef<HTMLDivElement>(null);

  if (!calculations) return null;

  const totalMining = calculations.yearlyData.reduce((sum, d) => sum + d.miningCost, 0);
  const totalProcessing = calculations.yearlyData.reduce((sum, d) => sum + d.processingCost, 0);
  const totalGA = calculations.yearlyData.reduce((sum, d) => sum + d.gaCost, 0);
  const totalRoyalties = calculations.yearlyData.reduce((sum, d) => sum + d.royalties, 0);
  const totalClosure = calculations.yearlyData.reduce((sum, d) => sum + d.closureCosts, 0);

  const data = [
    { name: 'Mining', value: totalMining },
    { name: 'Processing', value: totalProcessing },
    { name: 'G&A', value: totalGA },
    { name: 'Royalties', value: totalRoyalties },
    { name: 'Closure', value: totalClosure },
  ].filter(item => item.value > 0);

  const handleExport = async () => {
    try {
      await exportChart(chartRef.current, 'cost-breakdown-chart');
      toast.success('Chart exported successfully!');
    } catch (error) {
      toast.error('Failed to export chart');
      console.error(error);
    }
  };

  return (
    <div ref={chartRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 hover:bg-muted"
        onClick={handleExport}
        title="Export chart as image"
      >
        <Download className="w-4 h-4" />
      </Button>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'oklch(var(--card))',
              border: '1px solid oklch(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
