import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ShoppingItem } from '../backend';

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      console.log('useCreateCheckoutSession: Starting mutation with items:', items.map(item => ({
        ...item,
        priceInCents: item.priceInCents.toString(),
        quantity: item.quantity.toString(),
      })));

      if (!actor) {
        console.error('useCreateCheckoutSession: Actor not available');
        throw new Error('Actor not available');
      }
      
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      
      console.log('useCreateCheckoutSession: Calling backend with URLs:', { successUrl, cancelUrl });

      try {
        const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
        
        console.log('useCreateCheckoutSession: Raw backend response:', result);
        console.log('useCreateCheckoutSession: Response type:', typeof result);
        console.log('useCreateCheckoutSession: Response length:', result?.length);

        // JSON parsing is important!
        let session: CheckoutSession;
        try {
          session = JSON.parse(result) as CheckoutSession;
          console.log('useCreateCheckoutSession: Parsed session:', session);
        } catch (parseError) {
          console.error('useCreateCheckoutSession: JSON parse error:', parseError);
          console.error('useCreateCheckoutSession: Failed to parse result:', result);
          throw new Error(`Failed to parse checkout session response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
        }
        
        if (!session) {
          console.error('useCreateCheckoutSession: Session is null or undefined after parsing');
          throw new Error('Checkout session is null');
        }

        if (!session.url) {
          console.error('useCreateCheckoutSession: Session missing URL property:', session);
          throw new Error('Stripe session missing url');
        }

        if (session.url.trim() === '') {
          console.error('useCreateCheckoutSession: Session URL is empty string');
          throw new Error('Stripe session URL is empty');
        }
        
        console.log('useCreateCheckoutSession: Successfully created session with URL:', session.url);
        return session;
      } catch (error) {
        console.error('useCreateCheckoutSession: Backend call failed:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          items: items.map(item => ({
            ...item,
            priceInCents: item.priceInCents.toString(),
            quantity: item.quantity.toString(),
          })),
        });
        throw error;
      }
    },
  });
}
