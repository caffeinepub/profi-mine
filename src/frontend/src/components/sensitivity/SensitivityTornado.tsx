import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSensitivity } from "../../contexts/SensitivityContext";
import { formatCurrency } from "../../utils/formatters";

export default function SensitivityTornado() {
  const { tornadoData } = useSensitivity();

  if (!tornadoData || tornadoData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Tornado chart will appear here after calculations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tornado Chart</h3>
      <p className="text-sm text-muted-foreground">
        Impact of ±20% variation in key variables on NPV
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={tornadoData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
          <XAxis
            type="number"
            stroke="oklch(var(--foreground))"
            tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
          />
          <YAxis
            type="category"
            dataKey="variable"
            stroke="oklch(var(--foreground))"
            width={120}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: "oklch(var(--card))",
              border: "1px solid oklch(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar
            dataKey="low"
            fill="oklch(0.60 0.15 20)"
            name="-20%"
            stackId="a"
          />
          <Bar
            dataKey="high"
            fill="oklch(0.55 0.15 140)"
            name="+20%"
            stackId="a"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
