import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GLOSSARY } from "../../constants/glossary";
import { useProject } from "../../contexts/ProjectContext";
import {
  COMMODITY_OPTIONS,
  type CommodityKey,
  getCommodityPriceArray,
} from "../../data/commodityPrices";
import InfoTooltip from "../common/InfoTooltip";
import DynamicArrayInput from "./DynamicArrayInput";

export default function EconomicParametersSection() {
  const { inputs, updateInput } = useProject();
  const [selectedCommodity, setSelectedCommodity] =
    useState<CommodityKey>("gold");

  const handleAutoFill = () => {
    const years = inputs.commodityPrices.length;
    const prices = getCommodityPriceArray(selectedCommodity, years);
    updateInput("commodityPrices", prices);
    const commodity = COMMODITY_OPTIONS.find(
      (c) => c.value === selectedCommodity,
    );
    toast.success(
      `Auto-filled ${years}-year price forecast for ${commodity?.label ?? selectedCommodity}`,
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Economic Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inflationRate" className="flex items-center gap-2">
              Inflation Rate (%)
              <InfoTooltip content={GLOSSARY.inflationRate} />
            </Label>
            <Input
              id="inflationRate"
              data-ocid="inflation_rate.input"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={inputs.inflationRate}
              onChange={(e) =>
                updateInput(
                  "inflationRate",
                  Number.parseFloat(e.target.value) || 0,
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountRate" className="flex items-center gap-2">
              Discount Rate (%)
              <InfoTooltip content={GLOSSARY.discountRate} />
            </Label>
            <Input
              id="discountRate"
              data-ocid="discount_rate.input"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={inputs.discountRate}
              onChange={(e) =>
                updateInput(
                  "discountRate",
                  Number.parseFloat(e.target.value) || 0,
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate" className="flex items-center gap-2">
              Tax Rate (%)
              <InfoTooltip content={GLOSSARY.taxRate} />
            </Label>
            <Input
              id="taxRate"
              data-ocid="tax_rate.input"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={inputs.taxRate}
              onChange={(e) =>
                updateInput("taxRate", Number.parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>
      </div>

      {/* Commodity Price Forecast */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          Commodity Price Forecast ($/gram)
          <InfoTooltip content={GLOSSARY.commodityPrice} />
        </Label>

        {/* Auto-fill row */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Auto-fill from:
          </span>

          <Select
            value={selectedCommodity}
            onValueChange={(v) => setSelectedCommodity(v as CommodityKey)}
          >
            <SelectTrigger className="w-48" data-ocid="commodity_price.select">
              <SelectValue placeholder="Select commodity" />
            </SelectTrigger>
            <SelectContent>
              {COMMODITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAutoFill}
            data-ocid="commodity_price.button"
            className="gap-2 whitespace-nowrap"
          >
            <Wand2 className="w-4 h-4" />
            Auto-fill Prices
          </Button>

          <span className="text-xs text-muted-foreground italic">
            Fills {inputs.commodityPrices.length}-year forecast with
            market-based price fluctuations
          </span>
        </div>

        <DynamicArrayInput
          values={inputs.commodityPrices}
          onChange={(values) => updateInput("commodityPrices", values)}
          label="Year"
          unit="$/gram"
          step={0.001}
        />
      </div>
    </div>
  );
}
