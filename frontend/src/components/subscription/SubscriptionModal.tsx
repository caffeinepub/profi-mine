import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { useCreateCheckoutSession } from '../../hooks/useCreateCheckoutSession';
import { toast } from 'sonner';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: string;
  usageCount: number;
  usageLimit: number;
  exportsRemaining?: number;
  romUsageCount?: number;
  romLimit?: number;
}

export default function SubscriptionModal({
  open,
  onOpenChange,
  currentTier,
  usageCount,
  usageLimit,
  exportsRemaining,
  romUsageCount = 0,
  romLimit = 3,
}: SubscriptionModalProps) {
  const createCheckoutSession = useCreateCheckoutSession();

  const handleUpgrade = async () => {
    try {
      await createCheckoutSession.mutateAsync();
      // Redirect is handled inside the hook on success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to start checkout. Please try again. ${errorMessage}`);
    }
  };

  const isFree = currentTier === 'Free' || currentTier === 'free';
  const isPremium = currentTier === 'Premium' || currentTier === 'premium';
  const isProcessing = createCheckoutSession.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Subscription</DialogTitle>
          <DialogDescription>
            {isPremium
              ? 'You are currently on the Premium tier.'
              : isFree
              ? 'You are on the Free tier. Upgrade to Premium for more capacity.'
              : `You've reached your limit of ${usageLimit} models. Upgrade to Premium for more capacity.`}
          </DialogDescription>
        </DialogHeader>

        {/* Current Usage */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Usage</p>
              {isFree ? (
                <p className="text-2xl font-bold text-foreground">
                  {romUsageCount} / {romLimit} ROM Tonnage Edits
                </p>
              ) : (
                <p className="text-2xl font-bold text-foreground">
                  {usageCount} / {usageLimit} models
                </p>
              )}
            </div>
            <Badge variant="outline" className="text-sm">
              {currentTier} Tier
            </Badge>
          </div>
          {isFree && exportsRemaining !== undefined && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Exports remaining:{' '}
                <span className="font-semibold text-foreground">{exportsRemaining} / 2</span>
              </p>
            </div>
          )}
        </div>

        {/* Tier Cards */}
        <div className="py-4 space-y-4">
          {/* Free Tier Card (if user is on free tier) */}
          {isFree && (
            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Free Tier</CardTitle>
                <CardDescription>Current plan</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    '3 Free ROM Tonnage Editing',
                    '2 CSV exports per year',
                    'Basic financial projections',
                    'Sensitivity analysis',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Premium Tier Card */}
          <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-primary-foreground text-xs">
                {isPremium ? 'Current Plan' : 'Recommended'}
              </Badge>
            </div>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2">
                <Crown className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">Premium Tier</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold text-foreground">$235</span>
                <span className="text-muted-foreground"> / year</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {[
                  'Unlimited ROM Tonnage modeling',
                  '1,000 CSV exports per year',
                  'Advanced financial projections',
                  'Full sensitivity analysis',
                  'Priority support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {!isPremium && (
                <Button
                  className="w-full"
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium — $235/year
                    </>
                  )}
                </Button>
              )}

              {isPremium && (
                <div className="flex items-center gap-2 text-sm text-success font-medium">
                  <Check className="w-4 h-4" />
                  You are on the Premium plan
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
