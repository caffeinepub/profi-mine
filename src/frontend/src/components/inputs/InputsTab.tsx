import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CostStructureSection from "./CostStructureSection";
import EconomicParametersSection from "./EconomicParametersSection";
import FinancingSection from "./FinancingSection";
import ReservesProductionSection from "./ReservesProductionSection";

export default function InputsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Inputs</CardTitle>
          <CardDescription>
            Enter all mining project parameters to generate financial
            projections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <ReservesProductionSection />
          <EconomicParametersSection />
          <CostStructureSection />
          <FinancingSection />
        </CardContent>
      </Card>
    </div>
  );
}
