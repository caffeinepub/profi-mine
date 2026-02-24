import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useProject } from '../../contexts/ProjectContext';
import { formatCurrency } from '../../utils/formatters';

export default function CashFlowStatementTable() {
  const { calculations, inputs } = useProject();

  if (!calculations) return null;

  const years = calculations.yearlyData.length;

  return (
    <div className="print-table-container">
      <ScrollArea className="w-full print-scroll-area">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-10 print:static">Item</TableHead>
              <TableHead className="text-right">Year 0</TableHead>
              {Array.from({ length: years }, (_, i) => (
                <TableHead key={i} className="text-right">Year {i + 1}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">Operating Cash Flow</TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={i} className="text-right">{formatCurrency(data.ocf)}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">CAPEX</TableCell>
              <TableCell className="text-right text-red-600 dark:text-red-400">({formatCurrency(inputs.initialCapex)})</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={i} className="text-right text-red-600 dark:text-red-400">({formatCurrency(data.capex)})</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">Closure Costs</TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={i} className="text-right text-red-600 dark:text-red-400">
                  {data.closureCosts > 0 ? `(${formatCurrency(data.closureCosts)})` : '-'}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-muted/50">
              <TableCell className="sticky left-0 bg-muted/50 font-semibold print:static">Free Cash Flow</TableCell>
              <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">({formatCurrency(inputs.initialCapex)})</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={i} className="text-right font-semibold">{formatCurrency(data.fcf)}</TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-muted/50 font-bold">
              <TableCell className="sticky left-0 bg-muted/50 print:static">Cumulative FCF</TableCell>
              <TableCell className="text-right text-red-600 dark:text-red-400">({formatCurrency(inputs.initialCapex)})</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={i} className={`text-right ${data.cumulativeFcf >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(data.cumulativeFcf)}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
