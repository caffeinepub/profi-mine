import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProject } from "../../contexts/ProjectContext";
import { formatCurrency } from "../../utils/formatters";

export default function IncomeStatementTable() {
  const { calculations, inputs } = useProject();

  if (!calculations) return null;

  const years = calculations.yearlyData.length;
  const hasDebt = inputs.equityRatio < 1.0;

  return (
    <div className="print-table-container">
      <ScrollArea className="w-full print-scroll-area">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-10 print:static">
                Item
              </TableHead>
              <TableHead className="text-right">Year 0</TableHead>
              {Array.from({ length: years }, (_, i) => (
                <TableHead key={`head-year-${i + 1}`} className="text-right">
                  Year {i + 1}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">
                Revenue
              </TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={`rev-${i + 1}`} className="text-right">
                  {formatCurrency(data.revenue)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">
                OPEX
              </TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell
                  key={`opex-${i + 1}`}
                  className="text-right text-red-600 dark:text-red-400"
                >
                  ({formatCurrency(data.opex)})
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">
                Royalties
              </TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell
                  key={`royalties-${i + 1}`}
                  className="text-right text-red-600 dark:text-red-400"
                >
                  ({formatCurrency(data.royalties)})
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-muted/50">
              <TableCell className="sticky left-0 bg-muted/50 font-semibold print:static">
                EBITDA
              </TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell
                  key={`ebitda-${i + 1}`}
                  className="text-right font-semibold"
                >
                  {formatCurrency(data.ebitda)}
                </TableCell>
              ))}
            </TableRow>
            {hasDebt && (
              <TableRow>
                <TableCell className="sticky left-0 bg-background font-medium print:static">
                  Interest Expense
                </TableCell>
                <TableCell className="text-right">-</TableCell>
                {calculations.yearlyData.map((data, i) => (
                  <TableCell
                    key={`interest-${i + 1}`}
                    className="text-right text-red-600 dark:text-red-400"
                  >
                    {data.interestExpense > 0
                      ? `(${formatCurrency(data.interestExpense)})`
                      : "-"}
                  </TableCell>
                ))}
              </TableRow>
            )}
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">
                Taxes
              </TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell
                  key={`taxes-${i + 1}`}
                  className="text-right text-red-600 dark:text-red-400"
                >
                  ({formatCurrency(data.taxes)})
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-muted/50 font-bold">
              <TableCell className="sticky left-0 bg-muted/50 print:static">
                Net Income
              </TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={`net-income-${i + 1}`} className="text-right">
                  {formatCurrency(data.netIncome)}
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
