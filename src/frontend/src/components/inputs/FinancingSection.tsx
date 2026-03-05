import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GLOSSARY } from "../../constants/glossary";
import { useProject } from "../../contexts/ProjectContext";
import InfoTooltip from "../common/InfoTooltip";

export default function FinancingSection() {
  const { inputs, updateInput } = useProject();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Financing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="equityRatio" className="flex items-center gap-2">
              Equity Ratio (%)
              <InfoTooltip content={GLOSSARY.equityRatio} />
            </Label>
            <Input
              id="equityRatio"
              type="number"
              min="0"
              max="100"
              step="1"
              value={inputs.equityRatio}
              onChange={(e) =>
                updateInput(
                  "equityRatio",
                  Number.parseFloat(e.target.value) || 0,
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate" className="flex items-center gap-2">
              Interest Rate (%)
              <InfoTooltip content={GLOSSARY.interestRate} />
            </Label>
            <Input
              id="interestRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={inputs.interestRate}
              onChange={(e) =>
                updateInput(
                  "interestRate",
                  Number.parseFloat(e.target.value) || 0,
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
