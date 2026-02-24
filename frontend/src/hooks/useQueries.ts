import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, MiningProject, StripeConfiguration } from '../backend';
import type { ProjectInputs, FinancialCalculations } from '../utils/calculations';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useLoadProjects() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MiningProject[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const projects = await actor.getSortedProjects('lastModified');
      return projects;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLoadProject() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: Uint8Array) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProject(id);
    },
  });
}

export function useSaveProjectMutation() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      inputs,
      calculations,
    }: {
      id: Uint8Array;
      name: string;
      inputs: ProjectInputs;
      calculations: FinancialCalculations;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('User not authenticated');

      // Note: The backend doesn't have a saveProject method
      // This is a placeholder that will need backend implementation
      // For now, we'll throw an error to indicate this needs backend support
      throw new Error('saveProject backend method not implemented. Please add saveProject(project: MiningProject) to the backend.');
    },
    onSuccess: () => {
      // Invalidate both projects and user profile to update usage count
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: Uint8Array) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export function useCanExport() {
  const { actor } = useActor();

  return useQuery<boolean>({
    queryKey: ['canExport'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.canExport();
    },
    enabled: !!actor,
  });
}
