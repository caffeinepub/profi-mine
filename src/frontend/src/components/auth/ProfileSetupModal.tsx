import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SubscriptionTier, UserProfile } from "../../backend";
import { useCreateCheckoutSession } from "../../hooks/useCreateCheckoutSession";
import { useSaveCallerUserProfile } from "../../hooks/useQueries";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [selectedTier, setSelectedTier] = useState<"free" | "premium">("free");
  const saveProfile = useSaveCallerUserProfile();
  const createCheckoutSession = useCreateCheckoutSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // If premium is selected, first save profile as free tier then redirect to Stripe
    if (selectedTier === "premium") {
      try {
        // Save profile with free tier first so the user exists in the system
        const freeTier: SubscriptionTier = {
          __kind__: "free",
          free: {
            MAX_OPERATIONS_PDF_AND_CSV: BigInt(2),
            CSV_AND_PDF_COMBINED_MAX: BigInt(2),
          },
        };
        const newProfile: UserProfile = {
          name: name.trim(),
          email: email.trim() || undefined,
          organization: organization.trim() || undefined,
          tier: freeTier,
          modelsCreatedAnnual: BigInt(0),
          exportsRemainingAnnual: BigInt(2),
          lastResetTimestamp: BigInt(Date.now() * 1000000),
          romUsageCount: BigInt(0),
        };
        await saveProfile.mutateAsync(newProfile);
        // Then redirect to Stripe checkout
        await createCheckoutSession.mutateAsync();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(
          `Failed to start checkout. Please try again. ${errorMessage}`,
        );
        console.error(error);
      }
      return;
    }

    try {
      const tier: SubscriptionTier = {
        __kind__: "free",
        free: {
          MAX_OPERATIONS_PDF_AND_CSV: BigInt(2),
          CSV_AND_PDF_COMBINED_MAX: BigInt(2),
        },
      };

      const newProfile: UserProfile = {
        name: name.trim(),
        email: email.trim() || undefined,
        organization: organization.trim() || undefined,
        tier,
        modelsCreatedAnnual: BigInt(0),
        exportsRemainingAnnual: BigInt(2),
        lastResetTimestamp: BigInt(Date.now() * 1000000),
        romUsageCount: BigInt(0),
      };

      await saveProfile.mutateAsync(newProfile);
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    }
  };

  const isProcessing = saveProfile.isPending || createCheckoutSession.isPending;

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to ProFi Mine!</DialogTitle>
          <DialogDescription>
            Please set up your profile and choose your subscription tier to get
            started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization (optional)</Label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Your company or organization"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Choose Your Subscription Tier *</Label>
            <RadioGroup
              value={selectedTier}
              onValueChange={(value) =>
                setSelectedTier(value as "free" | "premium")
              }
            >
              <Card
                className={`cursor-pointer transition-all ${selectedTier === "free" ? "border-primary ring-2 ring-primary" : "border-border"}`}
                data-ocid="profile.free_tier.card"
                onClick={() => setSelectedTier("free")}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="free" id="free" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="free" className="cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold">
                            Free Tier
                          </span>
                          <span className="text-2xl font-bold">
                            $0
                            <span className="text-sm text-muted-foreground">
                              /year
                            </span>
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>3 ROM Edits</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>2 total CSV exports</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>All calculation features</span>
                          </li>
                        </ul>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${selectedTier === "premium" ? "border-primary ring-2 ring-primary" : "border-border"}`}
                data-ocid="profile.premium_tier.card"
                onClick={() => setSelectedTier("premium")}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value="premium"
                      id="premium"
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="premium" className="cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold">
                            Premium Tier
                          </span>
                          <span className="text-2xl font-bold">
                            $12
                            <span className="text-sm text-muted-foreground">
                              /month
                            </span>
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Unlimited ROM Edits</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Unlimited CSV exports</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>All calculation features</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Priority email support</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Advanced sensitivity analysis</span>
                          </li>
                        </ul>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing}
            data-ocid="profile.submit_button"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {selectedTier === "premium"
                  ? "Redirecting to Stripe..."
                  : "Creating Profile..."}
              </>
            ) : selectedTier === "premium" ? (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Continue to Premium — $12/month
              </>
            ) : (
              "Create Free Profile"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
