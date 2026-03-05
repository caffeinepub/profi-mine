import { Badge } from "@/components/ui/badge";
import { HardHat, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useProject } from "../../contexts/ProjectContext";
import LoginButton from "../auth/LoginButton";
import SubscriptionModal from "../subscription/SubscriptionModal";

const FREE_TIER_ROM_LIMIT = 3;

export default function DashboardHeader() {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const {
    projectName,
    subscriptionTier,
    usageCount,
    usageLimit,
    exportsRemaining,
    subscriptionLoading,
    romUsageCount,
  } = useProject();

  const isFree = subscriptionTier === "free";
  const isPremium = subscriptionTier === "premium";
  const displayTier = isPremium
    ? "Premium"
    : subscriptionTier === "free"
      ? "Free"
      : subscriptionTier;

  // ROM Tonnage usage for free tier
  const romLimit = FREE_TIER_ROM_LIMIT;
  const romAtLimit = isFree && romUsageCount >= romLimit;
  const romNearLimit = isFree && romUsageCount >= romLimit - 1;

  // Export usage indicator
  const exportsAtLimit = isFree && exportsRemaining <= 0;

  // Overall alert state
  const isAtLimit = romAtLimit || exportsAtLimit;
  const isNearLimit = romNearLimit || (isFree && exportsRemaining <= 1);

  return (
    <>
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[oklch(0.55_0.15_60)] to-[oklch(0.45_0.12_50)] flex items-center justify-center shadow-md">
                <HardHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  ProFi Mine
                </h1>
                {projectName && (
                  <p className="text-xs text-muted-foreground">
                    Project: {projectName}
                  </p>
                )}
              </div>
            </div>

            {/* Subscription Info & Actions */}
            <div className="flex items-center gap-2">
              {/* Subscription Usage Display */}
              {!subscriptionLoading && (
                <button
                  type="button"
                  onClick={() => setShowSubscriptionModal(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <TrendingUp
                    className={`w-4 h-4 ${
                      isAtLimit
                        ? "text-destructive"
                        : isNearLimit
                          ? "text-warning"
                          : "text-muted-foreground"
                    }`}
                  />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">
                      Models &amp; Exports
                    </p>
                    {isFree ? (
                      <div className="flex flex-col gap-0.5">
                        <p
                          className={`text-sm font-medium leading-tight ${
                            romAtLimit
                              ? "text-destructive"
                              : romNearLimit
                                ? "text-warning"
                                : "text-foreground"
                          }`}
                        >
                          {romUsageCount}/{romLimit} ROM Tonnage Edits
                        </p>
                        <p
                          className={`text-xs leading-tight ${
                            exportsAtLimit
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {exportsRemaining}/2 exports left
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-foreground">
                        Unlimited ROM Tonnage &middot; {exportsRemaining}{" "}
                        exports left
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={isAtLimit ? "destructive" : "outline"}
                    className="text-xs"
                  >
                    {displayTier}
                  </Badge>
                </button>
              )}

              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <SubscriptionModal
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
        currentTier={displayTier}
        usageCount={usageCount}
        usageLimit={usageLimit}
        exportsRemaining={exportsRemaining}
        romUsageCount={romUsageCount}
        romLimit={FREE_TIER_ROM_LIMIT}
      />
    </>
  );
}
