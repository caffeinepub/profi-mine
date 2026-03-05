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
  interestExpense: number;
  taxes: number;
  netIncome: number;
  ocf: number;
  capex: number;
  closureCosts: number;
  debtRepayment: number;
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
  // Debt financing summary
  initialDebt: number;
  equityInvestment: number;
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
      const factor = (1 + irr) ** (year + 1);
      npv += cf / factor;
      derivative -= ((year + 1) * cf) / (1 + irr) ** (year + 2);
    });

    const newIrr = irr - npv / derivative;

    if (Math.abs(newIrr - irr) < tolerance) {
      return newIrr * 100; // Return as percentage
    }

    irr = newIrr;
  }

  return irr * 100; // Return as percentage
}

export function calculateFinancials(
  inputs: ProjectInputs,
): FinancialCalculations {
  const years = inputs.romTonnageSchedule.length;
  const yearlyData: YearlyData[] = [];

  // Clamp equity ratio between 0 and 1
  const equityRatio = Math.min(1, Math.max(0, inputs.equityRatio ?? 1));
  const debtRatio = 1 - equityRatio;

  // Split initial CAPEX into equity and debt portions (convert M$ to $)
  const totalInitialCapex = inputs.initialCapex * 1_000_000;
  const initialDebt = totalInitialCapex * debtRatio;
  const equityInvestment = totalInitialCapex * equityRatio;

  // Annual interest rate (as decimal)
  const annualInterestRate = (inputs.interestRate ?? 0) / 100;

  // Straight-line principal repayment over the life of mine
  const annualPrincipalRepayment = years > 0 ? initialDebt / years : 0;

  // Track outstanding debt balance
  let outstandingDebt = initialDebt;

  // Equity investor's initial outlay (used for NPV/IRR from equity perspective)
  let cumulativeFcf = -equityInvestment;

  // Calculate Life of Mine
  const totalRomTonnage = inputs.romTonnageSchedule.reduce(
    (sum, tonnage) => sum + tonnage,
    0,
  );
  const lom =
    totalRomTonnage > 0 ? inputs.oreReserves / (totalRomTonnage / years) : 0;

  for (let i = 0; i < years; i++) {
    const year = i + 1;
    const romTonnage = inputs.romTonnageSchedule[i];

    // Production (grams of recovered metal)
    const production =
      romTonnage * inputs.oreGrade * (inputs.recoveryRate / 100);

    // Revenue (adjusted for inflation)
    const inflationFactor = (1 + inputs.inflationRate / 100) ** year;
    const adjustedPrice = inputs.commodityPrices[i] * inflationFactor;
    const revenue = production * adjustedPrice;

    // OPEX calculation including stripping ratio
    const baseMiningCost = inputs.miningCost * romTonnage;
    const strippingCost =
      inputs.strippingRatio * inputs.miningCost * romTonnage;
    const miningCost = baseMiningCost + strippingCost;
    const processingCost = inputs.processingCost * romTonnage;
    const gaCost = inputs.gAndACost * romTonnage;
    const opex = miningCost + processingCost + gaCost;

    // Royalties
    const royalties = revenue * (inputs.royalties / 100);

    // EBITDA
    const ebitda = revenue - opex - royalties;

    // Interest expense on outstanding debt (before this year's repayment)
    const interestExpense = outstandingDebt * annualInterestRate;

    // Taxable income = EBITDA - interest expense
    const taxableIncome = ebitda - interestExpense;
    const taxes = Math.max(0, taxableIncome * (inputs.taxRate / 100));

    // Net Income (after interest and taxes)
    const netIncome = taxableIncome - taxes;

    // Operating Cash Flow
    const ocf = netIncome;

    // Sustaining CAPEX
    const capex = inputs.sustainingCapex * 1_000_000;

    // Closure Costs
    const closureCosts =
      year === inputs.closureYear ? inputs.closureCosts * 1_000_000 : 0;

    // Debt repayment (principal only; interest already deducted above)
    const debtRepayment = Math.min(annualPrincipalRepayment, outstandingDebt);

    // Free Cash Flow (equity perspective: after debt service)
    const fcf = ocf - capex - closureCosts - debtRepayment;
    cumulativeFcf += fcf;

    // Reduce outstanding debt
    outstandingDebt = Math.max(0, outstandingDebt - debtRepayment);

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
      interestExpense,
      taxes,
      netIncome,
      ocf,
      capex,
      closureCosts,
      debtRepayment,
      fcf,
      cumulativeFcf,
    });
  }

  // NPV from equity perspective: discount FCFs against equity investment
  const npv = yearlyData.reduce((sum, data, i) => {
    const discountFactor = (1 + inputs.discountRate / 100) ** (i + 1);
    return sum + data.fcf / discountFactor;
  }, -equityInvestment);

  // IRR from equity perspective
  const irr = calculateIRR(
    yearlyData.map((d) => d.fcf),
    equityInvestment,
  );

  // ROI based on total capital (equity + debt = full CAPEX)
  const totalCapex = inputs.initialCapex + inputs.sustainingCapex * years;
  const roi = totalCapex > 0 ? (npv / (totalCapex * 1_000_000)) * 100 : 0;

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
    initialDebt,
    equityInvestment,
  };
}
