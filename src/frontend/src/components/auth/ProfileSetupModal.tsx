import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, Pickaxe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SubscriptionTier, UserProfile } from "../../backend";
import { useSaveCallerUserProfile } from "../../hooks/useQueries";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      const tier: SubscriptionTier = {
        __kind__: "free",
        free: {
          MAX_OPERATIONS_PDF_AND_CSV: BigInt(999999),
          CSV_AND_PDF_COMBINED_MAX: BigInt(999999),
        },
      };

      const newProfile: UserProfile = {
        name: name.trim(),
        email: email.trim() || undefined,
        organization: organization.trim() || undefined,
        tier,
        modelsCreatedAnnual: BigInt(0),
        exportsRemainingAnnual: BigInt(999999),
        lastResetTimestamp: BigInt(Date.now() * 1000000),
        romUsageCount: BigInt(0),
        isActive: true,
      };

      await saveProfile.mutateAsync(newProfile);
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to ProFi Mine!</DialogTitle>
          <DialogDescription>
            Please set up your profile to get started with financial modeling.
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
                data-ocid="profile.name.input"
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
                data-ocid="profile.email.input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization (optional)</Label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Your company or organization"
                data-ocid="profile.organization.input"
              />
            </div>
          </div>

          {/* Exploration Tier info */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[oklch(0.55_0.15_60)] to-[oklch(0.45_0.12_50)] flex items-center justify-center">
                <Pickaxe className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Exploration Tier
                </p>
                <p className="text-xs text-muted-foreground">
                  Your account plan
                </p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                Unlimited ROM Edits
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                Unlimited CSV exports
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                Full sensitivity analysis
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                All financial modeling features
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending}
            data-ocid="profile.submit_button"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Profile & Get Started"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
