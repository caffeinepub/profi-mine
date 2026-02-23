import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useProject } from '../../contexts/ProjectContext';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';

export default function SummaryKPIsTable() {
  const { calculations } = useProject();

  if (!calculations) return null;

  const kpis = [
    { label: 'Net Present Value (NPV)', value: formatCurrency(calculations.npv), positive: calculations.npv > 0 },
    { label: 'Internal Rate of Return (IRR)', value: formatPercentage(calculations.irr), positive: calculations.irr > 0 },
    { label: 'Return on Investment (ROI)', value: formatPercentage(calculations.roi), positive: calculations.roi > 0 },
    { label: 'Life of Mine (LOM)', value: `${formatNumber(calculations.lom, 1)} years`, positive: true },
    { label: 'Average Annual EBITDA', value: formatCurrency(calculations.avgEbitda), positive: calculations.avgEbitda > 0 },
    { label: 'Payback Period', value: calculations.paybackPeriod > 0 ? `${formatNumber(calculations.paybackPeriod, 1)} years` : 'N/A', positive: true },
  ];

  return (
    <Table>
      <TableBody>
        {kpis.map((kpi) => (
          <TableRow key={kpi.label}>
            <TableCell className="font-medium">{kpi.label}</TableCell>
            <TableCell className={`text-right font-semibold ${kpi.positive && kpi.value !== 'N/A' ? 'text-green-600 dark:text-green-400' : ''}`}>
              {kpi.value}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
