import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RotateCcw } from "lucide-react";
import { useSensitivity } from "../../contexts/SensitivityContext";
import { formatPercentage } from "../../utils/formatters";

export default function SensitivityControls() {
  const { adjustments, updateAdjustment, resetAdjustments, adjustedResults } =
    useSensitivity();

  const variables = [
    {
      key: "commodityPrice" as const,
      label: "Commodity Price",
      min: -20,
      max: 20,
    },
    { key: "oreGrade" as const, label: "Ore Grade", min: -20, max: 20 },
    { key: "recoveryRate" as const, label: "Recovery Rate", min: -20, max: 20 },
    { key: "capex" as const, label: "CAPEX", min: -20, max: 20 },
    { key: "opex" as const, label: "OPEX", min: -20, max: 20 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Adjust Variables</h3>
        <Button variant="outline" size="sm" onClick={resetAdjustments}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {variables.map((variable) => (
          <div key={variable.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{variable.label}</Label>
              <span className="text-sm font-medium text-muted-foreground">
                {formatPercentage(adjustments[variable.key])}
              </span>
            </div>
            <Slider
              value={[adjustments[variable.key]]}
              onValueChange={([value]) => updateAdjustment(variable.key, value)}
              min={variable.min}
              max={variable.max}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{variable.min}%</span>
              <span>0%</span>
              <span>+{variable.max}%</span>
            </div>
          </div>
        ))}
      </div>

      {adjustedResults && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-3">Adjusted Results</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">NPV</p>
              <p className="text-lg font-semibold">
                ${(adjustedResults.npv / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-muted-foreground">
                Base: ${(adjustedResults.baseNpv / 1000000).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IRR</p>
              <p className="text-lg font-semibold">
                {formatPercentage(adjustedResults.irr)}
              </p>
              <p className="text-xs text-muted-foreground">
                Base: {formatPercentage(adjustedResults.baseIrr)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className="text-lg font-semibold">
                {formatPercentage(adjustedResults.roi)}
              </p>
              <p className="text-xs text-muted-foreground">
                Base: {formatPercentage(adjustedResults.baseRoi)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
