export interface ProjectInputs {
  oreReserves: number;
  oreGrade: number;
  recoveryRate: number;
  strippingRatio: number;
  romTonnageSchedule: number[];
  commodityPrices: number[];
  inflationRate: number;
  discountRate: number;
  taxRate: number;
  initialCapex: number;
  sustainingCapex: number;
  miningCost: number;
  processingCost: number;
  gAndACost: number;
  royalties: number;
  closureCosts: number;
  closureYear: number;
  equityRatio: number;
  interestRate: number;
}

export interface YearlyData {
  year: number;
  production: number;
  revenue: number;
  miningCost: number;
  processingCost: number;
  gaCost: number;
  opex: number;
  royalties: number;
  ebitda: number;
  taxes: number;
  netIncome: number;
  ocf: number;
  capex: number;
  closureCosts: number;
  fcf: number;
  cumulativeFcf: number;
}

export interface FinancialCalculations {
  yearlyData: YearlyData[];
  npv: number;
  irr: number;
  roi: number;
  lom: number;
  avgEbitda: number;
  paybackPeriod: number;
}

function calculateIRR(cashFlows: number[], initialInvestment: number): number {
  // Newton-Raphson method to find IRR
  let irr = 0.1; // Initial guess
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = -initialInvestment;
    let derivative = 0;

    cashFlows.forEach((cf, year) => {
      const factor = Math.pow(1 + irr, year + 1);
      npv += cf / factor;
      derivative -= (year + 1) * cf / Math.pow(1 + irr, year + 2);
    });

    const newIrr = irr - npv / derivative;

    if (Math.abs(newIrr - irr) < tolerance) {
      return newIrr * 100; // Return as percentage
    }

    irr = newIrr;
  }

  return irr * 100; // Return as percentage
}

export function calculateFinancials(inputs: ProjectInputs): FinancialCalculations {
  const years = inputs.romTonnageSchedule.length;
  const yearlyData: YearlyData[] = [];
  let cumulativeFcf = -inputs.initialCapex * 1000000; // Convert to dollars

  // Calculate Life of Mine
  const totalRomTonnage = inputs.romTonnageSchedule.reduce((sum, tonnage) => sum + tonnage, 0);
  const lom = totalRomTonnage > 0 ? inputs.oreReserves / (totalRomTonnage / years) : 0;

  for (let i = 0; i < years; i++) {
    const year = i + 1;
    const romTonnage = inputs.romTonnageSchedule[i];
    
    // Production (grams of recovered metal)
    const production = romTonnage * inputs.oreGrade * (inputs.recoveryRate / 100);
    
    // Revenue (adjusted for inflation)
    const inflationFactor = Math.pow(1 + inputs.inflationRate / 100, year);
    const adjustedPrice = inputs.commodityPrices[i] * inflationFactor;
    const revenue = production * adjustedPrice;
    
    // OPEX calculation including stripping ratio
    const baseMiningCost = inputs.miningCost * romTonnage;
    const strippingCost = inputs.strippingRatio * inputs.miningCost * romTonnage;
    const miningCost = baseMiningCost + strippingCost;
    const processingCost = inputs.processingCost * romTonnage;
    const gaCost = inputs.gAndACost * romTonnage;
    const opex = miningCost + processingCost + gaCost;
    
    // Royalties
    const royalties = revenue * (inputs.royalties / 100);
    
    // EBITDA
    const ebitda = revenue - opex - royalties;
    
    // Taxes
    const taxes = Math.max(0, ebitda * (inputs.taxRate / 100));
    
    // Net Income
    const netIncome = ebitda - taxes;
    
    // Operating Cash Flow
    const ocf = netIncome;
    
    // CAPEX
    const capex = inputs.sustainingCapex * 1000000;
    
    // Closure Costs
    const closureCosts = year === inputs.closureYear ? inputs.closureCosts * 1000000 : 0;
    
    // Free Cash Flow
    const fcf = ocf - capex - closureCosts;
    cumulativeFcf += fcf;
    
    yearlyData.push({
      year,
      production,
      revenue,
      miningCost,
      processingCost,
      gaCost,
      opex,
      royalties,
      ebitda,
      taxes,
      netIncome,
      ocf,
      capex,
      closureCosts,
      fcf,
      cumulativeFcf,
    });
  }

  // Calculate NPV
  const npv = yearlyData.reduce((sum, data, i) => {
    const discountFactor = Math.pow(1 + inputs.discountRate / 100, i + 1);
    return sum + data.fcf / discountFactor;
  }, -inputs.initialCapex * 1000000);

  // Calculate IRR
  const irr = calculateIRR(
    yearlyData.map(d => d.fcf),
    inputs.initialCapex * 1000000
  );

  // Calculate ROI
  const totalCapex = inputs.initialCapex + inputs.sustainingCapex * years;
  const roi = totalCapex > 0 ? (npv / (totalCapex * 1000000)) * 100 : 0;

  // Calculate average EBITDA
  const avgEbitda = yearlyData.reduce((sum, d) => sum + d.ebitda, 0) / years;

  // Calculate payback period
  let paybackPeriod = 0;
  for (let i = 0; i < yearlyData.length; i++) {
    if (yearlyData[i].cumulativeFcf >= 0) {
      paybackPeriod = i + 1;
      break;
    }
  }

  return {
    yearlyData,
    npv,
    irr,
    roi,
    lom,
    avgEbitda,
    paybackPeriod,
  };
}
