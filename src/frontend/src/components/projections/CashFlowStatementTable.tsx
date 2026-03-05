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

export default function CashFlowStatementTable() {
  const { calculations, inputs } = useProject();

  if (!calculations) return null;

  const years = calculations.yearlyData.length;
  const hasDebt = inputs.equityRatio < 1.0;
  const initialDebt = calculations.initialDebt ?? 0;
  const equityInvestment =
    calculations.equityInvestment ?? inputs.initialCapex * 1_000_000;

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
                Operating Cash Flow
              </TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell key={`ocf-${i + 1}`} className="text-right">
                  {formatCurrency(data.ocf)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">
                CAPEX
              </TableCell>
              <TableCell className="text-right text-red-600 dark:text-red-400">
                ({formatCurrency(inputs.initialCapex * 1_000_000)})
              </TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell
                  key={`capex-${i + 1}`}
                  className="text-right text-red-600 dark:text-red-400"
                >
                  ({formatCurrency(data.capex)})
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium print:static">
                Closure Costs
              </TableCell>
              <TableCell className="text-right">-</TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell
                  key={`closure-${i + 1}`}
                  className="text-right text-red-600 dark:text-red-400"
                >
                  {data.closureCosts > 0
                    ? `(${formatCurrency(data.closureCosts)})`
                    : "-"}
                </TableCell>
              ))}
            </TableRow>
            {hasDebt && (
              <>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium print:static">
                    Debt Drawdown
                  </TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400">
                    {formatCurrency(initialDebt)}
                  </TableCell>
                  {calculations.yearlyData.map((_, i) => (
                    <TableCell
                      key={`debt-drawdown-${i + 1}`}
                      className="text-right"
                    >
                      -
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium print:static">
                    Debt Repayment
                  </TableCell>
                  <TableCell className="text-right">-</TableCell>
                  {calculations.yearlyData.map((data, i) => (
                    <TableCell
                      key={`debt-repay-${i + 1}`}
                      className="text-right text-red-600 dark:text-red-400"
                    >
                      {data.debtRepayment > 0
                        ? `(${formatCurrency(data.debtRepayment)})`
                        : "-"}
                    </TableCell>
                  ))}
                </TableRow>
              </>
            )}
            <TableRow className="bg-muted/50">
              <TableCell className="sticky left-0 bg-muted/50 font-semibold print:static">
                Free Cash Flow
              </TableCell>
              <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">
                ({formatCurrency(equityInvestment)})
              </TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell
                  key={`fcf-${i + 1}`}
                  className="text-right font-semibold"
                >
                  {formatCurrency(data.fcf)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-muted/50 font-bold">
              <TableCell className="sticky left-0 bg-muted/50 print:static">
                Cumulative FCF
              </TableCell>
              <TableCell className="text-right text-red-600 dark:text-red-400">
                ({formatCurrency(equityInvestment)})
              </TableCell>
              {calculations.yearlyData.map((data, i) => (
                <TableCell
                  key={`cum-fcf-${i + 1}`}
                  className={`text-right ${data.cumulativeFcf >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
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
