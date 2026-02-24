import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { useCreateCheckoutSession } from '../../hooks/useCreateCheckoutSession';
import type { ShoppingItem } from '../../backend';
import { toast } from 'sonner';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: string;
  usageCount: number;
  usageLimit: number;
  exportsRemaining?: number;
}

export default function SubscriptionModal({
  open,
  onOpenChange,
  currentTier,
  usageCount,
  usageLimit,
  exportsRemaining,
}: SubscriptionModalProps) {
  const createCheckoutSession = useCreateCheckoutSession();

  const handleUpgrade = async () => {
    try {
      const shoppingItem: ShoppingItem = {
        productName: 'Premium Tier',
        productDescription: 'Annual subscription with 300 models per year',
        priceInCents: BigInt(23500),
        quantity: BigInt(1),
        currency: 'usd',
      };

      console.log('Creating checkout session with:', {
        tier: 'Premium Tier',
        price: 235,
        priceInCents: 23500,
        shoppingItem: {
          ...shoppingItem,
          priceInCents: shoppingItem.priceInCents.toString(),
          quantity: shoppingItem.quantity.toString(),
        },
      });

      const session = await createCheckoutSession.mutateAsync([shoppingItem]);

      console.log('Checkout session created:', session);

      if (!session?.url) {
        console.error('Session missing URL:', session);
        throw new Error('Stripe session missing url');
      }

      // Redirect to Stripe Checkout
      console.log('Redirecting to Stripe checkout:', session.url);
      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to checkout. Please try again. ${errorMessage}`);
    }
  };

  const isFree = currentTier === 'Free' || currentTier === 'free';
  const isPremium = currentTier === 'Premium' || currentTier === 'premium';

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
              : `You've reached your limit of ${usageLimit} models. Upgrade to Premium for more capacity.`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Current Usage */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Usage</p>
              <p className="text-2xl font-bold text-foreground">
                {usageCount} / {usageLimit} models
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {currentTier} Tier
            </Badge>
          </div>
          {isFree && exportsRemaining !== undefined && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">Exports remaining: <span className="font-semibold text-foreground">{exportsRemaining} / 2</span></p>
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
                <CardTitle className="text-xl">Free Tier</CardTitle>
                <CardDescription>3 models per year</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                </div>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>3 models per year</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>2 total exports (CSV & PDF combined)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>All calculation features</span>
                  </li>
                </ul>

                <Badge variant="secondary" className="w-full justify-center">
                  Current Plan
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Premium Tier Card */}
          <Card className="border-primary shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Premium Tier</CardTitle>
              <CardDescription>300 models per year</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$235</span>
                  <span className="text-muted-foreground">/year</span>
                </div>
              </div>

              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>300 models per year</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>All calculation features</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Unlimited exports (CSV & PDF)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Priority email support</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Advanced sensitivity analysis</span>
                </li>
              </ul>

              {isPremium ? (
                <Badge variant="secondary" className="w-full justify-center">
                  Current Plan
                </Badge>
              ) : (
                <Button
                  onClick={handleUpgrade}
                  disabled={createCheckoutSession.isPending}
                  className="w-full"
                >
                  {createCheckoutSession.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upgrade to Premium'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">
            All plans include secure payment processing via Stripe. You can cancel or change your subscription at any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
