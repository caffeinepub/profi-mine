import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { calculateFinancials, type ProjectInputs, type FinancialCalculations } from '../utils/calculations';
import { useSaveProject, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
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
  if (!tier) return 3;
  if (tier.__kind__ === 'premium') return Number(tier.premium.MAX_OPERATIONS_PDF_AND_CSV);
  if (tier.__kind__ === 'free') return Number(tier.free.MAX_OPERATIONS_PDF_AND_CSV);
  if (tier.__kind__ === 'basic') return Number(tier.basic.MAX_OPERATIONS_PDF_AND_CSV);
  return 3;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<ProjectInputs>(DEFAULT_INPUTS);
  const [calculations, setCalculations] = useState<FinancialCalculations | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectId, setProjectId] = useState<Uint8Array | null>(null);

  const saveProjectMutation = useSaveProject();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  // Extract subscription information from user profile
  const subscriptionTier = getTierName(userProfile?.tier);
  const usageCount = Number(userProfile?.modelsCreatedAnnual || 0);
  const usageLimit = getUsageLimit(userProfile?.tier);
  const exportsRemaining = Number(userProfile?.exportsRemainingAnnual || 0);

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
    if (!identity) {
      throw new Error('User not authenticated');
    }

    const id = projectId || crypto.getRandomValues(new Uint8Array(16));
    const now = BigInt(Date.now()) * BigInt(1_000_000);

    await saveProjectMutation.mutateAsync({
      id,
      name,
      owner: identity.getPrincipal(),
      creationDate: now,
      lastModified: now,
      oreReserves: inputs.oreReserves,
      romTonnage: inputs.romTonnageSchedule.reduce((a, b) => a + b, 0) / inputs.romTonnageSchedule.length,
      oreGrade: inputs.oreGrade,
      recoveryRate: inputs.recoveryRate / 100,
      commodityPrice: inputs.commodityPrices[0] ?? 0,
      miningCost: inputs.miningCost,
      processingCost: inputs.processingCost,
      gAndACost: inputs.gAndACost,
      strippingRatio: inputs.strippingRatio,
      depreciation: inputs.sustainingCapex,
      capex: inputs.initialCapex,
      discountRate: inputs.discountRate / 100,
      averageTaxRate: inputs.taxRate / 100,
      lom: calculations.lom,
      annualProduction: calculations.yearlyData.length > 0
        ? calculations.yearlyData.reduce((s, d) => s + d.production, 0) / calculations.yearlyData.length
        : undefined,
      annualRevenue: calculations.yearlyData.length > 0
        ? calculations.yearlyData.reduce((s, d) => s + d.revenue, 0) / calculations.yearlyData.length
        : undefined,
      annualOpex: calculations.yearlyData.length > 0
        ? calculations.yearlyData.reduce((s, d) => s + d.opex, 0) / calculations.yearlyData.length
        : undefined,
      ebitda: calculations.avgEbitda,
      ocf: calculations.yearlyData.length > 0
        ? calculations.yearlyData.reduce((s, d) => s + d.ocf, 0) / calculations.yearlyData.length
        : undefined,
      fcf: calculations.yearlyData.length > 0
        ? calculations.yearlyData.reduce((s, d) => s + d.fcf, 0) / calculations.yearlyData.length
        : undefined,
      npv: calculations.npv,
      roi: calculations.roi,
      paybackPeriod: calculations.paybackPeriod,
    });

    setProjectId(id);
    setProjectName(name);
  };

  const loadProject = async (id: Uint8Array) => {
    setProjectId(id);
  };

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
