interface StripeRedirectToCheckoutOptions {
  lineItems: Array<{ price: string; quantity: number }>;
  mode: "payment" | "subscription" | "setup";
  successUrl: string;
  cancelUrl: string;
}

interface StripeInstance {
  redirectToCheckout(
    options: StripeRedirectToCheckoutOptions,
  ): Promise<{ error?: { message: string } }>;
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance;
  }
}

export {};
