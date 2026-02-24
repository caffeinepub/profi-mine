import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useProject } from '../../contexts/ProjectContext';
import { formatCurrency } from '../../utils/formatters';

export default function IncomeStatementTable() {
  const { calculations } = useProject();

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
              <TableCell className="sticky left-0 bg-background font-medium print:static">Revenue</TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={i} className="text-right">{formatCurrency(data.revenue)}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">OPEX</TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={i} className="text-right text-red-600 dark:text-red-400">({formatCurrency(data.opex)})</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">Royalties</TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={i} className="text-right text-red-600 dark:text-red-400">({formatCurrency(data.royalties)})</TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-muted/50">
              <TableCell className="sticky left-0 bg-muted/50 font-semibold print:static">EBITDA</TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={i} className="text-right font-semibold">{formatCurrency(data.ebitda)}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">Taxes</TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={i} className="text-right text-red-600 dark:text-red-400">({formatCurrency(data.taxes)})</TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-muted/50 font-bold">
              <TableCell className="sticky left-0 bg-muted/50 print:static">Net Income</TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={i} className="text-right">{formatCurrency(data.netIncome)}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
