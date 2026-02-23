import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SummaryKPIsTable from './SummaryKPIsTable';
import IncomeStatementTable from './IncomeStatementTable';
import CashFlowStatementTable from './CashFlowStatementTable';
import CumulativeCashFlowChart from '../charts/CumulativeCashFlowChart';
import ProductionBarChart from '../charts/ProductionBarChart';
import CostBreakdownPieChart from '../charts/CostBreakdownPieChart';
import { useProject } from '../../contexts/ProjectContext';

export default function ProjectionsTab() {
  const { calculations } = useProject();

  if (!calculations) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Enter project inputs to generate financial projections</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" id="projections-content" data-printable="projections">
      <Card>
        <CardHeader>
          <CardTitle>Summary KPIs</CardTitle>
          <CardDescription>Key financial metrics for the project</CardDescription>
        </CardHeader>
        <CardContent>
          <SummaryKPIsTable />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <CumulativeCashFlowChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Annual Production</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductionBarChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <CostBreakdownPieChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income Statement</CardTitle>
          <CardDescription>Annual revenue, costs, and profitability</CardDescription>
        </CardHeader>
        <CardContent>
          <IncomeStatementTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Statement</CardTitle>
          <CardDescription>Operating and free cash flows</CardDescription>
        </CardHeader>
        <CardContent>
          <CashFlowStatementTable />
        </CardContent>
      </Card>
    </div>
  );
}
