import { HardHat, TrendingUp } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import { useState } from 'react';
import SubscriptionModal from '../subscription/SubscriptionModal';
import { useProject } from '../../contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';

export default function DashboardHeader() {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { projectName, subscriptionTier, usageCount, usageLimit, exportsRemaining, subscriptionLoading } = useProject();

  // Calculate usage percentage for visual indicator
  const usagePercentage = (usageCount / usageLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usageCount >= usageLimit;

  // Display tier name
  const isFree = subscriptionTier === 'free';
  const displayTier = subscriptionTier === 'premium' ? 'Premium' : subscriptionTier === 'free' ? 'Free' : subscriptionTier;

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
                <h1 className="text-2xl font-bold text-foreground">ProFi Mine</h1>
                {projectName && (
                  <p className="text-xs text-muted-foreground">Project: {projectName}</p>
                )}
              </div>
            </div>

            {/* Subscription Info & Actions */}
            <div className="flex items-center gap-2">
              {/* Subscription Usage Display */}
              {!subscriptionLoading && (
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <TrendingUp className={`w-4 h-4 ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-warning' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">
                      {isFree ? 'Models & Exports' : 'Usage'}
                    </p>
                    <p className={`text-sm font-medium ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-warning' : 'text-foreground'}`}>
                      {usageCount}/{usageLimit}
                      {isFree && <span className="text-xs ml-1">({exportsRemaining}/2 exports)</span>}
                    </p>
                  </div>
                  <Badge variant={isAtLimit ? 'destructive' : 'outline'} className="text-xs">
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
      />
    </>
  );
}
