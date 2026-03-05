import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { type ProjectInputs, calculateFinancials } from "../utils/calculations";
import { useProject } from "./ProjectContext";

interface SensitivityAdjustments {
  commodityPrice: number;
  oreGrade: number;
  recoveryRate: number;
  capex: number;
  opex: number;
}

interface AdjustedResults {
  npv: number;
  irr: number;
  roi: number;
  baseNpv: number;
  baseIrr: number;
  baseRoi: number;
}

interface TornadoDataPoint {
  variable: string;
  low: number;
  high: number;
}

interface SensitivityContextType {
  adjustments: SensitivityAdjustments;
  updateAdjustment: (key: keyof SensitivityAdjustments, value: number) => void;
  resetAdjustments: () => void;
  adjustedResults: AdjustedResults | null;
  tornadoData: TornadoDataPoint[];
}

const SensitivityContext = createContext<SensitivityContextType | undefined>(
  undefined,
);

const DEFAULT_ADJUSTMENTS: SensitivityAdjustments = {
  commodityPrice: 0,
  oreGrade: 0,
  recoveryRate: 0,
  capex: 0,
  opex: 0,
};

export function SensitivityProvider({ children }: { children: ReactNode }) {
  const { inputs, calculations } = useProject();
  const [adjustments, setAdjustments] =
    useState<SensitivityAdjustments>(DEFAULT_ADJUSTMENTS);
  const [adjustedResults, setAdjustedResults] =
    useState<AdjustedResults | null>(null);
  const [tornadoData, setTornadoData] = useState<TornadoDataPoint[]>([]);

  useEffect(() => {
    if (!calculations) return;

    // Calculate adjusted results
    const adjustedInputs: ProjectInputs = {
      ...inputs,
      commodityPrices: inputs.commodityPrices.map(
        (p) => p * (1 + adjustments.commodityPrice / 100),
      ),
      oreGrade: inputs.oreGrade * (1 + adjustments.oreGrade / 100),
      recoveryRate: inputs.recoveryRate * (1 + adjustments.recoveryRate / 100),
      initialCapex: inputs.initialCapex * (1 + adjustments.capex / 100),
      sustainingCapex: inputs.sustainingCapex * (1 + adjustments.capex / 100),
      miningCost: inputs.miningCost * (1 + adjustments.opex / 100),
      processingCost: inputs.processingCost * (1 + adjustments.opex / 100),
      gAndACost: inputs.gAndACost * (1 + adjustments.opex / 100),
    };

    const adjusted = calculateFinancials(adjustedInputs);

    setAdjustedResults({
      npv: adjusted.npv,
      irr: adjusted.irr,
      roi: adjusted.roi,
      baseNpv: calculations.npv,
      baseIrr: calculations.irr,
      baseRoi: calculations.roi,
    });

    // Calculate tornado data
    const variables: Array<{
      key: keyof SensitivityAdjustments;
      label: string;
    }> = [
      { key: "commodityPrice", label: "Commodity Price" },
      { key: "oreGrade", label: "Ore Grade" },
      { key: "recoveryRate", label: "Recovery Rate" },
      { key: "capex", label: "CAPEX" },
      { key: "opex", label: "OPEX" },
    ];

    const tornado: TornadoDataPoint[] = variables.map(({ key, label }) => {
      const lowInputs = { ...inputs };
      const highInputs = { ...inputs };

      if (key === "commodityPrice") {
        lowInputs.commodityPrices = inputs.commodityPrices.map((p) => p * 0.8);
        highInputs.commodityPrices = inputs.commodityPrices.map((p) => p * 1.2);
      } else if (key === "oreGrade") {
        lowInputs.oreGrade = inputs.oreGrade * 0.8;
        highInputs.oreGrade = inputs.oreGrade * 1.2;
      } else if (key === "recoveryRate") {
        lowInputs.recoveryRate = inputs.recoveryRate * 0.8;
        highInputs.recoveryRate = inputs.recoveryRate * 1.2;
      } else if (key === "capex") {
        lowInputs.initialCapex = inputs.initialCapex * 0.8;
        lowInputs.sustainingCapex = inputs.sustainingCapex * 0.8;
        highInputs.initialCapex = inputs.initialCapex * 1.2;
        highInputs.sustainingCapex = inputs.sustainingCapex * 1.2;
      } else if (key === "opex") {
        lowInputs.miningCost = inputs.miningCost * 0.8;
        lowInputs.processingCost = inputs.processingCost * 0.8;
        lowInputs.gAndACost = inputs.gAndACost * 0.8;
        highInputs.miningCost = inputs.miningCost * 1.2;
        highInputs.processingCost = inputs.processingCost * 1.2;
        highInputs.gAndACost = inputs.gAndACost * 1.2;
      }

      const lowCalc = calculateFinancials(lowInputs);
      const highCalc = calculateFinancials(highInputs);

      return {
        variable: label,
        low: lowCalc.npv - calculations.npv,
        high: highCalc.npv - calculations.npv,
      };
    });

    setTornadoData(tornado);
  }, [inputs, calculations, adjustments]);

  const updateAdjustment = (
    key: keyof SensitivityAdjustments,
    value: number,
  ) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const resetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
  };

  return (
    <SensitivityContext.Provider
      value={{
        adjustments,
        updateAdjustment,
        resetAdjustments,
        adjustedResults,
        tornadoData,
      }}
    >
      {children}
    </SensitivityContext.Provider>
  );
}

export function useSensitivity() {
  const context = useContext(SensitivityContext);
  if (!context) {
    throw new Error("useSensitivity must be used within SensitivityProvider");
  }
  return context;
}
