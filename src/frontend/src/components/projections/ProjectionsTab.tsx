import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Printer } from "lucide-react";
import { useProject } from "../../contexts/ProjectContext";
import CostBreakdownPieChart from "../charts/CostBreakdownPieChart";
import CumulativeCashFlowChart from "../charts/CumulativeCashFlowChart";
import ProductionBarChart from "../charts/ProductionBarChart";
import CashFlowStatementTable from "./CashFlowStatementTable";
import IncomeStatementTable from "./IncomeStatementTable";
import SummaryKPIsTable from "./SummaryKPIsTable";

export default function ProjectionsTab() {
  const { calculations } = useProject();

  const handleSaveProjections = () => {
    window.print();
  };

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
    <div
      className="space-y-6"
      id="projections-content"
      data-printable="projections"
    >
      {/* Save Projections button - hidden during print */}
      <div className="flex justify-end no-print">
        <Button
          onClick={handleSaveProjections}
          data-ocid="projections.save_button"
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          Save Projections
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary KPIs</CardTitle>
          <CardDescription>
            Key financial metrics for the project
          </CardDescription>
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
          <CardDescription>
            Annual revenue, costs, and profitability
          </CardDescription>
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
