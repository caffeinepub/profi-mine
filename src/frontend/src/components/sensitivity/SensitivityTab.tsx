import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ScenarioComparison from "./ScenarioComparison";
import SensitivityControls from "./SensitivityControls";
import SensitivityTornado from "./SensitivityTornado";

export default function SensitivityTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sensitivity Analysis</CardTitle>
          <CardDescription>
            Adjust key variables to see their impact on project NPV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SensitivityControls />
          <SensitivityTornado />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Scenario Comparison</CardTitle>
          <CardDescription>
            Compare base, optimistic, and pessimistic scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScenarioComparison />
        </CardContent>
      </Card>
    </div>
  );
}
