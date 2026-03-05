/**
 * Commodity price forecasts in $/gram for up to 20 years.
 * Values reflect realistic base prices with annual fluctuations
 * (mild trend + cycle variance) to simulate real-world price movements.
 *
 * Sources: approximate 2024 market prices, extrapolated with conservative
 * growth/volatility assumptions for financial modeling purposes.
 */

export type CommodityKey =
  | "gold"
  | "silver"
  | "platinum"
  | "copper"
  | "manganese"
  | "iron"
  | "nickel";

export interface CommodityInfo {
  label: string;
  symbol: string;
  unit: string;
  /** 20-year price schedule in $/gram */
  prices: number[];
}

export const COMMODITY_PRICES: Record<CommodityKey, CommodityInfo> = {
  gold: {
    label: "Gold",
    symbol: "Au",
    unit: "$/gram",
    // Base ~$62/g (≈$1,930/oz) with moderate upward trend + cycle swings
    prices: [
      62.0, 63.5, 65.2, 67.8, 64.9, 66.4, 69.1, 71.5, 70.2, 73.0, 75.8, 74.5,
      77.2, 79.6, 78.1, 81.3, 84.0, 82.7, 86.0, 88.5,
    ],
  },
  silver: {
    label: "Silver",
    symbol: "Ag",
    unit: "$/gram",
    // Base ~$0.77/g (≈$24/oz) with higher volatility than gold
    prices: [
      0.77, 0.79, 0.82, 0.76, 0.8, 0.85, 0.83, 0.87, 0.91, 0.88, 0.92, 0.96,
      0.94, 0.98, 1.02, 0.99, 1.03, 1.07, 1.05, 1.09,
    ],
  },
  platinum: {
    label: "Platinum",
    symbol: "Pt",
    unit: "$/gram",
    // Base ~$30/g (≈$935/oz) with moderate growth
    prices: [
      30.0, 30.8, 31.5, 29.9, 30.6, 31.8, 32.4, 31.7, 33.0, 34.2, 33.5, 34.8,
      35.6, 34.9, 36.2, 37.0, 36.4, 37.8, 38.6, 39.4,
    ],
  },
  copper: {
    label: "Copper",
    symbol: "Cu",
    unit: "$/gram",
    // Base ~$0.0093/g (≈$4.20/lb) — strong industrial demand trend
    prices: [
      0.0093, 0.0096, 0.0098, 0.0101, 0.0099, 0.0103, 0.0106, 0.0104, 0.0108,
      0.0111, 0.0109, 0.0113, 0.0116, 0.0114, 0.0118, 0.0121, 0.0119, 0.0123,
      0.0126, 0.0129,
    ],
  },
  manganese: {
    label: "Manganese",
    symbol: "Mn",
    unit: "$/gram",
    // Base ~$0.0020/g (≈$2,000/tonne) — steady industrial use
    prices: [
      0.002, 0.00204, 0.00208, 0.00202, 0.0021, 0.00215, 0.00212, 0.00218,
      0.00222, 0.0022, 0.00225, 0.00229, 0.00227, 0.00232, 0.00236, 0.00234,
      0.00239, 0.00243, 0.00241, 0.00246,
    ],
  },
  iron: {
    label: "Iron",
    symbol: "Fe",
    unit: "$/gram",
    // Base ~$0.00012/g (≈$120/tonne iron ore) — cyclical commodity
    prices: [
      0.00012, 0.000118, 0.000122, 0.000125, 0.000121, 0.000124, 0.000127,
      0.00013, 0.000128, 0.000126, 0.000129, 0.000133, 0.000131, 0.000135,
      0.000138, 0.000136, 0.00014, 0.000143, 0.000141, 0.000145,
    ],
  },
  nickel: {
    label: "Nickel",
    symbol: "Ni",
    unit: "$/gram",
    // Base ~$0.0155/g (≈$15,500/tonne) — EV battery demand driver
    prices: [
      0.0155, 0.0159, 0.0163, 0.0157, 0.0162, 0.0167, 0.0165, 0.017, 0.0174,
      0.0172, 0.0176, 0.018, 0.0178, 0.0182, 0.0186, 0.0184, 0.0189, 0.0193,
      0.0191, 0.0195,
    ],
  },
};

export const COMMODITY_OPTIONS: {
  value: CommodityKey;
  label: string;
  symbol: string;
}[] = [
  { value: "gold", label: "Gold (Au)", symbol: "Au" },
  { value: "silver", label: "Silver (Ag)", symbol: "Ag" },
  { value: "platinum", label: "Platinum (Pt)", symbol: "Pt" },
  { value: "copper", label: "Copper (Cu)", symbol: "Cu" },
  { value: "manganese", label: "Manganese (Mn)", symbol: "Mn" },
  { value: "iron", label: "Iron (Fe)", symbol: "Fe" },
  { value: "nickel", label: "Nickel (Ni)", symbol: "Ni" },
];

/**
 * Returns a price array of the requested length for the given commodity.
 * If more years are needed than available data, the last known value is
 * extrapolated with the same average annual growth rate.
 */
export function getCommodityPriceArray(
  commodity: CommodityKey,
  years: number,
): number[] {
  const data = COMMODITY_PRICES[commodity].prices;
  if (years <= data.length) {
    return data.slice(0, years).map((v) => Number.parseFloat(v.toPrecision(6)));
  }

  // Extrapolate beyond available data using average annual growth rate
  const result = [...data];
  const growthRate =
    data.length > 1
      ? (data[data.length - 1] / data[0]) ** (1 / (data.length - 1))
      : 1.02;
  let last = data[data.length - 1];
  for (let i = data.length; i < years; i++) {
    last = last * growthRate;
    result.push(Number.parseFloat(last.toPrecision(6)));
  }
  return result;
}
