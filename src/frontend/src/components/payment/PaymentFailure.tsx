import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>Your payment could not be processed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              We couldn't complete your payment. This could be due to:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Payment was cancelled</li>
              <li>Insufficient funds</li>
              <li>Card declined</li>
              <li>Technical issue</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => navigate({ to: "/dashboard" })}
              className="w-full"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  "mailto:support@profimine.com?subject=Payment Issue",
                  "_blank",
                )
              }
              className="w-full"
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
