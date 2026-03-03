import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (): Promise<CheckoutSession> => {
      if (!actor) {
        throw new Error('Actor not available');
      }

      const result = await actor.createPremiumCheckoutSession();

      let session: CheckoutSession;
      try {
        session = JSON.parse(result) as CheckoutSession;
      } catch (parseError) {
        throw new Error(
          `Failed to parse checkout session response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
        );
      }

      if (!session?.url || session.url.trim() === '') {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
      return session;
    },
  });
}
