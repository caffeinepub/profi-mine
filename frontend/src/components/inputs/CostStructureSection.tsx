import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProject } from '../../contexts/ProjectContext';
import InfoTooltip from '../common/InfoTooltip';
import { GLOSSARY } from '../../constants/glossary';

export default function CostStructureSection() {
  const { inputs, updateInput } = useProject();

  // Calculate the number of years based on ROM tonnage schedule
  const numberOfYears = inputs.romTonnageSchedule.length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Cost Structure</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initialCapex" className="flex items-center gap-2">
                Initial CAPEX ($M)
                <InfoTooltip content={GLOSSARY.capex} />
              </Label>
              <Input
                id="initialCapex"
                type="number"
                min="0"
                step="0.1"
                value={inputs.initialCapex}
                onChange={(e) => updateInput('initialCapex', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sustainingCapex" className="flex items-center gap-2">
                Sustaining CAPEX (Annual $M)
                <InfoTooltip content={GLOSSARY.sustainingCapex} />
              </Label>
              <Input
                id="sustainingCapex"
                type="number"
                min="0"
                step="0.1"
                value={inputs.sustainingCapex}
                onChange={(e) => updateInput('sustainingCapex', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="miningCost" className="flex items-center gap-2">
                Mining Cost ($/tonne)
                <InfoTooltip content={GLOSSARY.opex} />
              </Label>
              <Input
                id="miningCost"
                type="number"
                min="0"
                step="0.1"
                value={inputs.miningCost}
                onChange={(e) => updateInput('miningCost', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="processingCost" className="flex items-center gap-2">
                Processing Cost ($/tonne)
                <InfoTooltip content={GLOSSARY.processingCost} />
              </Label>
              <Input
                id="processingCost"
                type="number"
                min="0"
                step="0.1"
                value={inputs.processingCost}
                onChange={(e) => updateInput('processingCost', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gAndACost" className="flex items-center gap-2">
                G&A Cost ($/tonne)
                <InfoTooltip content={GLOSSARY.gAndA} />
              </Label>
              <Input
                id="gAndACost"
                type="number"
                min="0"
                step="0.1"
                value={inputs.gAndACost}
                onChange={(e) => updateInput('gAndACost', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="royalties" className="flex items-center gap-2">
                Royalties (%)
                <InfoTooltip content={GLOSSARY.royalties} />
              </Label>
              <Input
                id="royalties"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={inputs.royalties}
                onChange={(e) => updateInput('royalties', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closureCosts" className="flex items-center gap-2">
                Closure Costs ($M)
                <InfoTooltip content={GLOSSARY.closureCosts} />
              </Label>
              <Input
                id="closureCosts"
                type="number"
                min="0"
                step="0.1"
                value={inputs.closureCosts}
                onChange={(e) => updateInput('closureCosts', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closureYear" className="flex items-center gap-2">
                Closure Year
                <InfoTooltip content="The year when closure costs will be incurred. Select the year within your project timeline when mine closure activities will take place." />
              </Label>
              <Select
                value={inputs.closureYear.toString()}
                onValueChange={(value) => updateInput('closureYear', parseInt(value))}
              >
                <SelectTrigger id="closureYear">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: numberOfYears }, (_, i) => i + 1).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
                onChange={(e) => updateInput('equityRatio', parseFloat(e.target.value) || 0)}
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
                step="0.1"
                value={inputs.interestRate}
                onChange={(e) => updateInput('interestRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
