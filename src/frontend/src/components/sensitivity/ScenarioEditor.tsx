import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useScenarios } from "../../contexts/ScenarioContext";

interface ScenarioEditorProps {
  scenario: "base" | "optimistic" | "pessimistic";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ScenarioEditor({
  scenario,
  open,
  onOpenChange,
}: ScenarioEditorProps) {
  const { scenarioAdjustments, updateScenarioAdjustment } = useScenarios();
  const [adjustments, setAdjustments] = useState(scenarioAdjustments[scenario]);

  useEffect(() => {
    setAdjustments(scenarioAdjustments[scenario]);
  }, [scenario, scenarioAdjustments]);

  const handleSave = () => {
    updateScenarioAdjustment(scenario, adjustments);
    toast.success(
      `${scenario.charAt(0).toUpperCase() + scenario.slice(1)} scenario updated`,
    );
    onOpenChange(false);
  };

  const scenarioLabels = {
    base: "Base Case",
    optimistic: "Optimistic Case",
    pessimistic: "Pessimistic Case",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {scenarioLabels[scenario]}</DialogTitle>
          <DialogDescription>
            Adjust key parameters as percentage changes from base inputs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Commodity Price Adjustment (%)</Label>
            <Input
              type="number"
              step="1"
              value={adjustments.commodityPrice}
              onChange={(e) =>
                setAdjustments({
                  ...adjustments,
                  commodityPrice: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Ore Grade Adjustment (%)</Label>
            <Input
              type="number"
              step="1"
              value={adjustments.oreGrade}
              onChange={(e) =>
                setAdjustments({
                  ...adjustments,
                  oreGrade: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Recovery Rate Adjustment (%)</Label>
            <Input
              type="number"
              step="1"
              value={adjustments.recoveryRate}
              onChange={(e) =>
                setAdjustments({
                  ...adjustments,
                  recoveryRate: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>CAPEX Adjustment (%)</Label>
            <Input
              type="number"
              step="1"
              value={adjustments.capex}
              onChange={(e) =>
                setAdjustments({
                  ...adjustments,
                  capex: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>OPEX Adjustment (%)</Label>
            <Input
              type="number"
              step="1"
              value={adjustments.opex}
              onChange={(e) =>
                setAdjustments({
                  ...adjustments,
                  opex: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
