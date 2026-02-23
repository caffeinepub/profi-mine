import ReservesProductionSection from './ReservesProductionSection';
import EconomicParametersSection from './EconomicParametersSection';
import CostStructureSection from './CostStructureSection';
import FinancingSection from './FinancingSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InputsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Inputs</CardTitle>
          <CardDescription>
            Enter all mining project parameters to generate financial projections
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
