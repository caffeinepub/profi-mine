import { useMutation } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (!actor) {
        throw new Error("Not authenticated. Please log in and try again.");
      }

      // Build success/cancel URLs using the current app's actual origin
      // so Stripe redirects back to the correct domain after payment.
      const origin = window.location.origin;
      const successUrl = `${origin}/payment-success`;
      const cancelUrl = `${origin}/payment-failure`;

      // Call the backend which creates a Stripe Checkout session in subscription
      // mode using Price ID price_1T7ZMRHkLCsqzrQ2PzhJm1ME ($12/month).
      // The backend returns the Stripe-hosted checkout URL.
      const sessionUrl = await actor.createPremiumCheckoutSession(
        successUrl,
        cancelUrl,
      );

      if (!sessionUrl || typeof sessionUrl !== "string") {
        throw new Error("Failed to create checkout session. Please try again.");
      }

      // Extract the checkout URL from the Stripe JSON response if needed
      let checkoutUrl = sessionUrl;
      if (sessionUrl.startsWith("{")) {
        // Response is raw JSON — parse the url field
        try {
          const parsed = JSON.parse(sessionUrl) as { url?: string };
          if (parsed.url) {
            checkoutUrl = parsed.url;
          } else {
            throw new Error("No checkout URL in Stripe response.");
          }
        } catch {
          throw new Error("Invalid response from checkout session creation.");
        }
      }

      // Redirect browser to Stripe hosted checkout page
      window.location.href = checkoutUrl;
    },
  });
}
