import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useProject } from '../../contexts/ProjectContext';
import InfoTooltip from '../common/InfoTooltip';
import { GLOSSARY } from '../../constants/glossary';
import DynamicArrayInput from './DynamicArrayInput';

export default function EconomicParametersSection() {
  const { inputs, updateInput } = useProject();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Economic Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inflationRate" className="flex items-center gap-2">
              Inflation Rate (%)
              <InfoTooltip content={GLOSSARY.inflationRate} />
            </Label>
            <Input
              id="inflationRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={inputs.inflationRate}
              onChange={(e) => updateInput('inflationRate', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountRate" className="flex items-center gap-2">
              Discount Rate (%)
              <InfoTooltip content={GLOSSARY.discountRate} />
            </Label>
            <Input
              id="discountRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={inputs.discountRate}
              onChange={(e) => updateInput('discountRate', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate" className="flex items-center gap-2">
              Tax Rate (%)
              <InfoTooltip content={GLOSSARY.taxRate} />
            </Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={inputs.taxRate}
              onChange={(e) => updateInput('taxRate', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Commodity Price Forecast ($/gram)
          <InfoTooltip content={GLOSSARY.commodityPrice} />
        </Label>
        <DynamicArrayInput
          values={inputs.commodityPrices}
          onChange={(values) => updateInput('commodityPrices', values)}
          label="Year"
          unit="$/gram"
          step={0.01}
        />
      </div>
    </div>
  );
}
