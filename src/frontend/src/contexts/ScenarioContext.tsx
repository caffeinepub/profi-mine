import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useProject } from './ProjectContext';
import { calculateFinancials, type ProjectInputs } from '../utils/calculations';

interface ScenarioAdjustments {
  commodityPrice: number;
  oreGrade: number;
  recoveryRate: number;
  capex: number;
  opex: number;
}

interface ScenarioResults {
  npv: number;
  irr: number;
  roi: number;
  lom: number;
}

interface ScenarioContextType {
  scenarios: {
    base: ScenarioResults;
    optimistic: ScenarioResults;
    pessimistic: ScenarioResults;
  };
  scenarioAdjustments: {
    base: ScenarioAdjustments;
    optimistic: ScenarioAdjustments;
    pessimistic: ScenarioAdjustments;
  };
  activeScenario: 'base' | 'optimistic' | 'pessimistic';
  setActiveScenario: (scenario: 'base' | 'optimistic' | 'pessimistic') => void;
  updateScenarioAdjustment: (scenario: 'base' | 'optimistic' | 'pessimistic', adjustments: ScenarioAdjustments) => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

const DEFAULT_ADJUSTMENTS: Record<'base' | 'optimistic' | 'pessimistic', ScenarioAdjustments> = {
  base: { commodityPrice: 0, oreGrade: 0, recoveryRate: 0, capex: 0, opex: 0 },
  optimistic: { commodityPrice: 15, oreGrade: 10, recoveryRate: 5, capex: -10, opex: -10 },
  pessimistic: { commodityPrice: -15, oreGrade: -10, recoveryRate: -5, capex: 15, opex: 15 },
};

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const { inputs, calculations } = useProject();
  const [activeScenario, setActiveScenario] = useState<'base' | 'optimistic' | 'pessimistic'>('base');
  const [scenarioAdjustments, setScenarioAdjustments] = useState(DEFAULT_ADJUSTMENTS);
  const [scenarios, setScenarios] = useState<{
    base: ScenarioResults;
    optimistic: ScenarioResults;
    pessimistic: ScenarioResults;
  }>({
    base: { npv: 0, irr: 0, roi: 0, lom: 0 },
    optimistic: { npv: 0, irr: 0, roi: 0, lom: 0 },
    pessimistic: { npv: 0, irr: 0, roi: 0, lom: 0 },
  });

  useEffect(() => {
    if (!calculations) return;

    const calculateScenario = (adjustments: ScenarioAdjustments): ScenarioResults => {
      const adjustedInputs: ProjectInputs = {
        ...inputs,
        commodityPrices: inputs.commodityPrices.map(p => p * (1 + adjustments.commodityPrice / 100)),
        oreGrade: inputs.oreGrade * (1 + adjustments.oreGrade / 100),
        recoveryRate: inputs.recoveryRate * (1 + adjustments.recoveryRate / 100),
        initialCapex: inputs.initialCapex * (1 + adjustments.capex / 100),
        sustainingCapex: inputs.sustainingCapex * (1 + adjustments.capex / 100),
        miningCost: inputs.miningCost * (1 + adjustments.opex / 100),
        processingCost: inputs.processingCost * (1 + adjustments.opex / 100),
        gAndACost: inputs.gAndACost * (1 + adjustments.opex / 100),
      };

      const calc = calculateFinancials(adjustedInputs);
      return {
        npv: calc.npv,
        irr: calc.irr,
        roi: calc.roi,
        lom: calc.lom,
      };
    };

    setScenarios({
      base: calculateScenario(scenarioAdjustments.base),
      optimistic: calculateScenario(scenarioAdjustments.optimistic),
      pessimistic: calculateScenario(scenarioAdjustments.pessimistic),
    });
  }, [inputs, calculations, scenarioAdjustments]);

  const updateScenarioAdjustment = (
    scenario: 'base' | 'optimistic' | 'pessimistic',
    adjustments: ScenarioAdjustments
  ) => {
    setScenarioAdjustments((prev) => ({
      ...prev,
      [scenario]: adjustments,
    }));
  };

  return (
    <ScenarioContext.Provider
      value={{
        scenarios,
        scenarioAdjustments,
        activeScenario,
        setActiveScenario,
        updateScenarioAdjustment,
      }}
    >
      <SensitivityProvider>{children}</SensitivityProvider>
    </ScenarioContext.Provider>
  );
}

// Import SensitivityProvider here to wrap it
import { SensitivityProvider } from './SensitivityContext';

export function useScenarios() {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenarios must be used within ScenarioProvider');
  }
  return context;
}
