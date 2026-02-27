import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { calculateFinancials, type ProjectInputs, type FinancialCalculations } from '../utils/calculations';
import { useSaveProjectMutation, useLoadProject as useLoadProjectMutation, useGetCallerUserProfile, useIncrementRomUsage } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { SubscriptionTier } from '../backend';

interface ProjectContextType {
  inputs: ProjectInputs;
  updateInput: <K extends keyof ProjectInputs>(key: K, value: ProjectInputs[K]) => void;
  calculations: FinancialCalculations | null;
  projectName: string;
  setProjectName: (name: string) => void;
  projectId: Uint8Array | null;
  saveProject: (name: string) => Promise<void>;
  loadProject: (id: Uint8Array) => Promise<void>;
  subscriptionTier: string;
  usageCount: number;
  usageLimit: number;
  exportsRemaining: number;
  subscriptionLoading: boolean;
  romUsageCount: number;
  incrementRomUsage: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const DEFAULT_INPUTS: ProjectInputs = {
  oreReserves: 1000000,
  oreGrade: 2.5,
  recoveryRate: 90,
  strippingRatio: 2.5,
  romTonnageSchedule: [100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000],
  commodityPrices: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68],
  inflationRate: 2.5,
  discountRate: 10,
  taxRate: 30,
  initialCapex: 50,
  sustainingCapex: 5,
  miningCost: 15,
  processingCost: 20,
  gAndACost: 5,
  royalties: 5,
  closureCosts: 10,
  closureYear: 10,
  equityRatio: 60,
  interestRate: 8,
};

// Free tier model limit constant
const FREE_TIER_MODEL_LIMIT = 3;

// Helper function to get tier name from SubscriptionTier
function getTierName(tier: SubscriptionTier | undefined): string {
  if (!tier) return 'free';
  if (tier.__kind__ === 'premium') return 'premium';
  if (tier.__kind__ === 'free') return 'free';
  if (tier.__kind__ === 'basic') return 'basic';
  return 'free';
}

// Helper function to get usage limit from SubscriptionTier
function getUsageLimit(tier: SubscriptionTier | undefined): number {
  if (!tier) return FREE_TIER_MODEL_LIMIT;
  // Free tier always uses the frontend-defined limit of 3
  if (tier.__kind__ === 'free') return FREE_TIER_MODEL_LIMIT;
  if (tier.__kind__ === 'premium') return Number(tier.premium.MAX_OPERATIONS_PDF_AND_CSV);
  if (tier.__kind__ === 'basic') return Number(tier.basic.MAX_OPERATIONS_PDF_AND_CSV);
  return FREE_TIER_MODEL_LIMIT;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<ProjectInputs>(DEFAULT_INPUTS);
  const [calculations, setCalculations] = useState<FinancialCalculations | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectId, setProjectId] = useState<Uint8Array | null>(null);

  const saveProjectMutation = useSaveProjectMutation();
  const loadProjectMutation = useLoadProjectMutation();
  const incrementRomUsageMutation = useIncrementRomUsage();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  // Extract subscription information from user profile
  const subscriptionTier = getTierName(userProfile?.tier);
  const usageCount = Number(userProfile?.modelsCreatedAnnual || 0);
  const usageLimit = getUsageLimit(userProfile?.tier);
  const exportsRemaining = Number(userProfile?.exportsRemainingAnnual || 0);
  const romUsageCount = Number(userProfile?.romUsageCount || 0);

  useEffect(() => {
    const calcs = calculateFinancials(inputs);
    setCalculations(calcs);
  }, [inputs]);

  const updateInput = <K extends keyof ProjectInputs>(key: K, value: ProjectInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const saveProject = async (name: string) => {
    if (!calculations) {
      throw new Error('No calculations available');
    }

    const id = projectId || crypto.getRandomValues(new Uint8Array(16));
    
    await saveProjectMutation.mutateAsync({
      id,
      name,
      inputs,
      calculations,
    });

    setProjectId(id);
    setProjectName(name);
  };

  const loadProject = useCallback(async (id: Uint8Array) => {
    const project = await loadProjectMutation.mutateAsync(id);

    // Reconstruct the LOM (number of years) from the saved lom value
    const lom = project.lom != null && project.lom > 0 ? Math.round(project.lom) : DEFAULT_INPUTS.romTonnageSchedule.length;
    const numYears = Math.max(1, Math.min(lom, 50));

    // Reconstruct romTonnageSchedule: fill with the saved average romTonnage
    const romTonnage = project.romTonnage > 0 ? project.romTonnage : DEFAULT_INPUTS.romTonnageSchedule[0];
    const romTonnageSchedule = Array(numYears).fill(romTonnage);

    // Reconstruct commodityPrices: fill with the saved average commodityPrice
    const commodityPrice = project.commodityPrice > 0 ? project.commodityPrice : DEFAULT_INPUTS.commodityPrices[0];
    const commodityPrices = Array(numYears).fill(commodityPrice);

    // Map MiningProject fields back to ProjectInputs
    const restoredInputs: ProjectInputs = {
      oreReserves: project.oreReserves > 0 ? project.oreReserves : DEFAULT_INPUTS.oreReserves,
      oreGrade: project.oreGrade > 0 ? project.oreGrade : DEFAULT_INPUTS.oreGrade,
      // recoveryRate is stored as a fraction (0-1) in the backend, convert back to percentage
      recoveryRate: project.recoveryRate > 0
        ? (project.recoveryRate <= 1 ? project.recoveryRate * 100 : project.recoveryRate)
        : DEFAULT_INPUTS.recoveryRate,
      strippingRatio: project.strippingRatio >= 0 ? project.strippingRatio : DEFAULT_INPUTS.strippingRatio,
      romTonnageSchedule,
      commodityPrices,
      // inflationRate is not stored in MiningProject; keep default
      inflationRate: DEFAULT_INPUTS.inflationRate,
      // discountRate is stored as a fraction (0-1) in the backend, convert back to percentage
      discountRate: project.discountRate > 0
        ? (project.discountRate <= 1 ? project.discountRate * 100 : project.discountRate)
        : DEFAULT_INPUTS.discountRate,
      // averageTaxRate is stored as a fraction (0-1) in the backend, convert back to percentage
      taxRate: project.averageTaxRate > 0
        ? (project.averageTaxRate <= 1 ? project.averageTaxRate * 100 : project.averageTaxRate)
        : DEFAULT_INPUTS.taxRate,
      initialCapex: project.capex > 0 ? project.capex : DEFAULT_INPUTS.initialCapex,
      // sustainingCapex is not stored separately; keep default
      sustainingCapex: DEFAULT_INPUTS.sustainingCapex,
      miningCost: project.miningCost > 0 ? project.miningCost : DEFAULT_INPUTS.miningCost,
      processingCost: project.processingCost > 0 ? project.processingCost : DEFAULT_INPUTS.processingCost,
      gAndACost: project.gAndACost > 0 ? project.gAndACost : DEFAULT_INPUTS.gAndACost,
      // royalties, closureCosts, closureYear are not stored in MiningProject; keep defaults
      royalties: DEFAULT_INPUTS.royalties,
      closureCosts: DEFAULT_INPUTS.closureCosts,
      closureYear: numYears,
      // equityRatio and interestRate are not stored in MiningProject; keep defaults
      equityRatio: DEFAULT_INPUTS.equityRatio,
      interestRate: DEFAULT_INPUTS.interestRate,
    };

    setInputs(restoredInputs);
    setProjectId(id);
    setProjectName(project.name);
  }, [loadProjectMutation]);

  const incrementRomUsage = useCallback(async () => {
    try {
      await incrementRomUsageMutation.mutateAsync();
    } catch (error) {
      // Silently handle limit-exceeded errors; the UI already blocks further input
      const msg = error instanceof Error ? error.message : String(error);
      if (!msg.includes('limit exceeded')) {
        toast.error('Failed to track ROM usage. Please try again.');
      }
    }
  }, [incrementRomUsageMutation]);

  return (
    <ProjectContext.Provider
      value={{
        inputs,
        updateInput,
        calculations,
        projectName,
        setProjectName,
        projectId,
        saveProject,
        loadProject,
        subscriptionTier,
        usageCount,
        usageLimit,
        exportsRemaining,
        subscriptionLoading: profileLoading,
        romUsageCount,
        incrementRomUsage,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
