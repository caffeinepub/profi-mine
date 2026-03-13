import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GLOSSARY } from "../../constants/glossary";
import { useProject } from "../../contexts/ProjectContext";
import InfoTooltip from "../common/InfoTooltip";
import DynamicArrayInput from "./DynamicArrayInput";

export default function ReservesProductionSection() {
  const { inputs, updateInput } = useProject();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          Reserves &amp; Production
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="oreReserves" className="flex items-center gap-2">
              Ore Reserves (tonnes)
              <InfoTooltip content={GLOSSARY.oreReserves} />
            </Label>
            <Input
              id="oreReserves"
              type="number"
              min="0"
              step="1000"
              value={inputs.oreReserves}
              onChange={(e) =>
                updateInput(
                  "oreReserves",
                  Number.parseFloat(e.target.value) || 0,
                )
              }
              data-ocid="inputs.ore_reserves.input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="oreGrade" className="flex items-center gap-2">
              Ore Grade (g/ton)
              <InfoTooltip content={GLOSSARY.oreGrade} />
            </Label>
            <Input
              id="oreGrade"
              type="number"
              min="0"
              step="0.1"
              value={inputs.oreGrade}
              onChange={(e) =>
                updateInput("oreGrade", Number.parseFloat(e.target.value) || 0)
              }
              data-ocid="inputs.ore_grade.input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoveryRate" className="flex items-center gap-2">
              Recovery Rate (%)
              <InfoTooltip content={GLOSSARY.recoveryRate} />
            </Label>
            <Input
              id="recoveryRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={inputs.recoveryRate}
              onChange={(e) =>
                updateInput(
                  "recoveryRate",
                  Number.parseFloat(e.target.value) || 0,
                )
              }
              data-ocid="inputs.recovery_rate.input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strippingRatio" className="flex items-center gap-2">
              Stripping Ratio
              <InfoTooltip content={GLOSSARY.strippingRatio} />
            </Label>
            <Input
              id="strippingRatio"
              type="number"
              min="0"
              step="0.1"
              value={inputs.strippingRatio}
              onChange={(e) =>
                updateInput(
                  "strippingRatio",
                  Number.parseFloat(e.target.value) || 0,
                )
              }
              data-ocid="inputs.stripping_ratio.input"
            />
          </div>
        </div>
      </div>

      {/* Annual ROM Tonnage Schedule */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          Annual ROM Tonnage Schedule
          <InfoTooltip content={GLOSSARY.rom} />
        </Label>
        <DynamicArrayInput
          values={inputs.romTonnageSchedule}
          onChange={(values) => updateInput("romTonnageSchedule", values)}
          label="Year"
          unit="tonnes"
          step={1000}
        />
      </div>
    </div>
  );
}
