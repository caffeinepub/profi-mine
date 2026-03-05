import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useRef } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { useProject } from "../../contexts/ProjectContext";
import { useChartExport } from "../../hooks/useChartExport";
import { formatCurrency } from "../../utils/formatters";

const COLORS = [
  "oklch(0.55 0.15 60)",
  "oklch(0.50 0.12 50)",
  "oklch(0.45 0.10 40)",
  "oklch(0.60 0.18 70)",
  "oklch(0.40 0.08 30)",
];

export default function CostBreakdownPieChart() {
  const { calculations } = useProject();
  const { exportChart } = useChartExport();
  // Ref points only to the chart wrapper, NOT the button
  const chartOnlyRef = useRef<HTMLDivElement>(null);

  if (!calculations) return null;

  const totalMining = calculations.yearlyData.reduce(
    (sum, d) => sum + d.miningCost,
    0,
  );
  const totalProcessing = calculations.yearlyData.reduce(
    (sum, d) => sum + d.processingCost,
    0,
  );
  const totalGA = calculations.yearlyData.reduce((sum, d) => sum + d.gaCost, 0);
  const totalRoyalties = calculations.yearlyData.reduce(
    (sum, d) => sum + d.royalties,
    0,
  );
  const totalClosure = calculations.yearlyData.reduce(
    (sum, d) => sum + d.closureCosts,
    0,
  );

  const data = [
    { name: "Mining", value: totalMining },
    { name: "Processing", value: totalProcessing },
    { name: "G&A", value: totalGA },
    { name: "Royalties", value: totalRoyalties },
    { name: "Closure", value: totalClosure },
  ].filter((item) => item.value > 0);

  const handleExport = async () => {
    try {
      await exportChart(chartOnlyRef.current, "cost-breakdown-chart");
      toast.success("Chart exported successfully!");
    } catch (error) {
      toast.error("Failed to export chart");
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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(1)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_entry, index) => (
                <Cell
                  key={`cell-${_entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "oklch(var(--card))",
                border: "1px solid oklch(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
