import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  MiningProject,
  StripeConfiguration,
  UserProfile,
} from "../backend";
import type {
  FinancialCalculations,
  ProjectInputs,
} from "../utils/calculations";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      // Register the caller first (first user becomes admin automatically)
      await actor._initializeAccessControl();
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
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useLoadProjects() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MiningProject[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const projects = await actor.getSortedProjects("lastModified");
      return projects;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLoadProject() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: Uint8Array) => {
      if (!actor) throw new Error("Actor not available");
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
      if (!actor) throw new Error("Actor not available");
      if (!identity) throw new Error("User not authenticated");

      const principal = identity.getPrincipal();
      const now = BigInt(Date.now()) * BigInt(1_000_000); // nanoseconds

      // Derive single-value fields from arrays (use averages)
      const avgRomTonnage =
        inputs.romTonnageSchedule.length > 0
          ? inputs.romTonnageSchedule.reduce((a, b) => a + b, 0) /
            inputs.romTonnageSchedule.length
          : 0;
      const avgCommodityPrice =
        inputs.commodityPrices.length > 0
          ? inputs.commodityPrices.reduce((a, b) => a + b, 0) /
            inputs.commodityPrices.length
          : 0;

      // Compute average yearly values from calculations
      const years = calculations.yearlyData.length;
      const avgAnnualProduction =
        years > 0
          ? calculations.yearlyData.reduce((s, d) => s + d.production, 0) /
            years
          : undefined;
      const avgAnnualRevenue =
        years > 0
          ? calculations.yearlyData.reduce((s, d) => s + d.revenue, 0) / years
          : undefined;
      const avgAnnualOpex =
        years > 0
          ? calculations.yearlyData.reduce((s, d) => s + d.opex, 0) / years
          : undefined;

      const project: MiningProject = {
        id,
        name,
        owner: principal,
        creationDate: now,
        lastModified: now,
        oreReserves: inputs.oreReserves,
        romTonnage: avgRomTonnage,
        oreGrade: inputs.oreGrade,
        recoveryRate: inputs.recoveryRate / 100,
        commodityPrice: avgCommodityPrice,
        miningCost: inputs.miningCost,
        processingCost: inputs.processingCost,
        gAndACost: inputs.gAndACost,
        strippingRatio: inputs.strippingRatio,
        depreciation: 0,
        capex: inputs.initialCapex,
        discountRate: inputs.discountRate / 100,
        averageTaxRate: inputs.taxRate / 100,
        lom: calculations.lom,
        annualProduction: avgAnnualProduction,
        annualRevenue: avgAnnualRevenue,
        annualOpex: avgAnnualOpex,
        ebitda: calculations.avgEbitda,
        ocf:
          years > 0
            ? calculations.yearlyData.reduce((s, d) => s + d.ocf, 0) / years
            : undefined,
        fcf:
          years > 0
            ? calculations.yearlyData.reduce((s, d) => s + d.fcf, 0) / years
            : undefined,
        npv: calculations.npv,
        roi: calculations.roi,
        paybackPeriod: calculations.paybackPeriod,
      };

      await actor.saveProject(project);

      // Increment modelsCreatedAnnual in the user profile
      const currentProfile = await actor.getCallerUserProfile();
      if (currentProfile) {
        const updatedProfile: UserProfile = {
          ...currentProfile,
          modelsCreatedAnnual: currentProfile.modelsCreatedAnnual + BigInt(1),
        };
        await actor.saveCallerUserProfile(updatedProfile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
    onError: (error: Error) => {
      console.error("Save project error:", error);
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: Uint8Array) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useCheckStripeConfiguration() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
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
      if (!actor) throw new Error("Actor not available");
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripeConfigured"] });
    },
  });
}

export function useCanExport() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["canExport"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.canExport();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useDecrementExportCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.decrementExportCount();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["canExport"] });
    },
  });
}

export function useIncrementRomUsage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.incrementRomUsage();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
    onError: (error: Error) => {
      console.error("Increment ROM usage error:", error);
    },
  });
}

export function useMarkUserAsPremium() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.markUserAsPremium();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
