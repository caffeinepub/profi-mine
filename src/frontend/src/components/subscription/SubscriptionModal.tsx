import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Pickaxe } from "lucide-react";

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
  romUsageCount = 0,
}: SubscriptionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Account Plan</DialogTitle>
          <DialogDescription>
            Your current plan and usage information.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[oklch(0.55_0.15_60)] to-[oklch(0.45_0.12_50)] flex items-center justify-center">
                <Pickaxe className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Exploration Tier</CardTitle>
                <Badge variant="outline" className="text-xs mt-0.5">
                  Current Plan
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {[
                "Unlimited ROM Edits",
                "Unlimited CSV exports",
                "Full sensitivity analysis",
                "All financial modeling features",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                ROM Tonnage Edits this session:{" "}
                <span className="font-semibold text-foreground">
                  {romUsageCount}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
