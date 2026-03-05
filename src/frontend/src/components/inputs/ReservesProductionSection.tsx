import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Lock } from "lucide-react";
import { useCallback, useState } from "react";
import { GLOSSARY } from "../../constants/glossary";
import { useProject } from "../../contexts/ProjectContext";
import InfoTooltip from "../common/InfoTooltip";
import SubscriptionModal from "../subscription/SubscriptionModal";
import DynamicArrayInput from "./DynamicArrayInput";

const FREE_TIER_ROM_LIMIT = 3;

export default function ReservesProductionSection() {
  const {
    inputs,
    updateInput,
    subscriptionTier,
    romUsageCount,
    incrementRomUsage,
    usageCount,
    usageLimit,
    exportsRemaining,
  } = useProject();

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  // Track whether the user has already triggered an increment in this session
  // to avoid double-counting on rapid changes before blur
  const [hasIncrementedThisSession, setHasIncrementedThisSession] =
    useState(false);

  const isFree = subscriptionTier === "free";
  const romLimitReached = isFree && romUsageCount >= FREE_TIER_ROM_LIMIT;

  // Called when the user finishes editing any ROM tonnage value (on blur / array change)
  const handleRomChange = useCallback(
    (values: number[]) => {
      updateInput("romTonnageSchedule", values);

      // Only increment if Free tier, limit not yet reached, and not already incremented this session
      if (isFree && !romLimitReached && !hasIncrementedThisSession) {
        setHasIncrementedThisSession(true);
        incrementRomUsage();
      }
    },
    [
      updateInput,
      isFree,
      romLimitReached,
      hasIncrementedThisSession,
      incrementRomUsage,
    ],
  );

  const displayTier = subscriptionTier === "premium" ? "Premium" : "Free";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          Reserves & Production
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
            />
          </div>
        </div>
      </div>

      {/* Annual ROM Tonnage Schedule */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          Annual ROM Tonnage Schedule
          <InfoTooltip content={GLOSSARY.rom} />
          {isFree && (
            <span className="ml-auto text-xs text-muted-foreground font-normal">
              {Math.min(romUsageCount, FREE_TIER_ROM_LIMIT)}/
              {FREE_TIER_ROM_LIMIT} uses
            </span>
          )}
        </Label>

        {romLimitReached ? (
          /* Locked state: show upgrade prompt */
          <div className="space-y-3">
            {/* Read-only display of current values */}
            <div className="opacity-50 pointer-events-none select-none">
              <DynamicArrayInput
                values={inputs.romTonnageSchedule}
                onChange={() => {
                  /* blocked */
                }}
                label="Year"
                unit="tonnes"
                step={1000}
                disabled
              />
            </div>

            {/* Upgrade alert */}
            <Alert className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
              <Lock className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-400 font-semibold">
                Free Tier Limit Reached
              </AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300 space-y-3">
                <p>
                  You have used all{" "}
                  <strong>
                    {FREE_TIER_ROM_LIMIT} free ROM Tonnage Schedule edits
                  </strong>
                  . Upgrade to Premium to continue editing the Annual ROM
                  Tonnage Schedule without restrictions.
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowSubscriptionModal(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white border-0 gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Premium
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          /* Normal interactive state */
          <div className="space-y-1">
            {isFree && romUsageCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {FREE_TIER_ROM_LIMIT - romUsageCount} free{" "}
                {FREE_TIER_ROM_LIMIT - romUsageCount === 1 ? "edit" : "edits"}{" "}
                remaining
              </p>
            )}
            <DynamicArrayInput
              values={inputs.romTonnageSchedule}
              onChange={handleRomChange}
              label="Year"
              unit="tonnes"
              step={1000}
            />
          </div>
        )}
      </div>

      <SubscriptionModal
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
        currentTier={displayTier}
        usageCount={usageCount}
        usageLimit={usageLimit}
        exportsRemaining={exportsRemaining}
      />
    </div>
  );
}
