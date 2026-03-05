import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";
import { useMarkUserAsPremium } from "../../hooks/useQueries";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const markAsPremium = useMarkUserAsPremium();
  const hasCalled = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount only
  useEffect(() => {
    // Only call once per mount to avoid duplicate calls
    if (!hasCalled.current) {
      hasCalled.current = true;
      markAsPremium.mutate();
    }
  }, []);

  const handleRetry = () => {
    hasCalled.current = false;
    markAsPremium.reset();
    hasCalled.current = true;
    markAsPremium.mutate();
  };

  const isPending = markAsPremium.isPending;
  const isError = markAsPremium.isError;
  const isSuccess = markAsPremium.isSuccess;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {isPending && (
            <>
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
              </div>
              <CardTitle className="text-2xl">
                Finalizing your upgrade…
              </CardTitle>
              <CardDescription>
                Please wait while we activate your Premium subscription.
              </CardDescription>
            </>
          )}

          {isSuccess && (
            <>
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription>
                Your Premium subscription is now active!
              </CardDescription>
            </>
          )}

          {isError && (
            <>
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <CardTitle className="text-2xl">
                Upgrade Activation Failed
              </CardTitle>
              <CardDescription>
                Your payment was received, but we couldn't activate your Premium
                subscription automatically.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {isPending && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground text-center">
                Activating your Premium features…
              </p>
            </div>
          )}

          {isSuccess && (
            <>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  Thank you for upgrading to Premium. Your new features are now
                  active:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Unlimited ROM Tonnage modeling</li>
                  <li>1,000 CSV exports per year</li>
                  <li>Advanced financial projections</li>
                </ul>
              </div>
              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </>
          )}

          {isError && (
            <>
              <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
                <p className="text-sm text-muted-foreground mb-2">
                  Your payment was processed successfully by Stripe. To activate
                  your Premium account, please try again or contact support.
                </p>
                <p className="text-xs text-muted-foreground">
                  Error:{" "}
                  {markAsPremium.error instanceof Error
                    ? markAsPremium.error.message
                    : "Unknown error"}
                </p>
              </div>
              <Button
                onClick={handleRetry}
                variant="default"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Activation
              </Button>
              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                variant="outline"
                className="w-full"
              >
                Go to Dashboard
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                If the issue persists, please contact support with your payment
                confirmation.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
