export const GUIDE_CONTENT = {
  sections: [
    {
      id: 'overview',
      title: 'Application Overview',
      content: `
        <p>ProFi Mine is a comprehensive financial modeling tool designed specifically for mining projects. It enables users to:</p>
        <ul>
          <li>Input detailed mining project parameters</li>
          <li>Generate 10-year (or custom length) financial projections</li>
          <li>Perform sensitivity analysis on key variables</li>
          <li>Compare multiple scenarios (base, optimistic, pessimistic)</li>
          <li>Export professional reports for investor presentations</li>
        </ul>
        <p>The application uses industry-standard financial metrics including NPV, IRR, ROI, and payback period to evaluate project viability.</p>
      `,
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: `
        <p><strong>Step 1:</strong> Log in using Internet Identity authentication</p>
        <p><strong>Step 2:</strong> Navigate to the Inputs tab to enter your project parameters</p>
        <p><strong>Step 3:</strong> Review calculated projections in the Projections tab</p>
        <p><strong>Step 4:</strong> Perform sensitivity analysis to understand key risk factors</p>
        <p><strong>Step 5:</strong> Save your project for future reference</p>
        <p><strong>Step 6:</strong> Export results to Excel or PDF for presentations</p>
      `,
    },
    {
      id: 'input-guide',
      title: 'Input Guide',
      content: `
        <h3>Reserves & Production</h3>
        <p><strong>Ore Reserves:</strong> Total mineable ore in tonnes. This determines the overall project scale.</p>
        <p><strong>Ore Grade:</strong> Concentration of valuable mineral in grams per tonne. Higher grades mean more valuable ore.</p>
        <p><strong>Recovery Rate:</strong> Percentage of mineral recovered during processing (typically 80-95%).</p>
        <p><strong>Stripping Ratio:</strong> Ratio of waste to ore. A ratio of 2.5 means 2.5 tonnes of waste must be moved for each tonne of ore.</p>
        <p><strong>ROM Tonnage Schedule:</strong> Annual mining rate for each year. Can be extended beyond 10 years.</p>
        
        <h3>Economic Parameters</h3>
        <p><strong>Commodity Prices:</strong> Expected prices in $/gram for each year. Include your price forecast assumptions.</p>
        <p><strong>Inflation Rate:</strong> Expected annual inflation (typically 2-3%).</p>
        <p><strong>Discount Rate:</strong> Required rate of return for the project (typically 8-12% for mining).</p>
        <p><strong>Tax Rate:</strong> Corporate tax rate in the jurisdiction.</p>
        
        <h3>Cost Structure</h3>
        <p><strong>Initial CAPEX:</strong> Upfront capital investment in millions of dollars.</p>
        <p><strong>Sustaining CAPEX:</strong> Annual capital expenditure to maintain operations.</p>
        <p><strong>Operating Costs:</strong> Per-tonne costs for mining, processing, and G&A.</p>
      `,
    },
    {
      id: 'calculations',
      title: 'Understanding Calculations',
      content: `
        <h3>Production Profile</h3>
        <p>Annual Production (grams) = ROM Tonnage × Ore Grade × Recovery Rate</p>
        
        <h3>Revenue</h3>
        <p>Revenue = Production × Commodity Price × (1 + Inflation Rate)^Year</p>
        
        <h3>Operating Costs (OPEX)</h3>
        <p>OPEX = (Mining Cost + Processing Cost + G&A Cost) × ROM Tonnage + (Stripping Ratio × Mining Cost × ROM Tonnage)</p>
        <p>The stripping ratio increases mining costs by requiring additional waste removal.</p>
        
        <h3>EBITDA</h3>
        <p>EBITDA = Revenue - OPEX - Royalties</p>
        
        <h3>Cash Flows</h3>
        <p>Operating Cash Flow (OCF) = EBITDA - Taxes</p>
        <p>Free Cash Flow (FCF) = OCF - CAPEX - Closure Costs</p>
        
        <h3>Net Present Value (NPV)</h3>
        <p>NPV = Sum of [FCF / (1 + Discount Rate)^Year] - Initial CAPEX</p>
        <p>Positive NPV indicates the project creates value.</p>
        
        <h3>Internal Rate of Return (IRR)</h3>
        <p>The discount rate at which NPV equals zero. Higher IRR indicates better returns.</p>
        
        <h3>Life of Mine (LOM)</h3>
        <p>LOM = Total Ore Reserves / Average Annual ROM Tonnage</p>
      `,
    },
    {
      id: 'interpreting-outputs',
      title: 'Interpreting Outputs',
      content: `
        <h3>Key Performance Indicators</h3>
        <p><strong>NPV:</strong> Positive values indicate profitable projects. Compare against investment alternatives.</p>
        <p><strong>IRR:</strong> Should exceed the discount rate and cost of capital. Typical mining projects target 15%+.</p>
        <p><strong>ROI:</strong> Return as percentage of invested capital. Higher is better.</p>
        <p><strong>Payback Period:</strong> Years until cumulative cash flow becomes positive. Shorter is better.</p>
        
        <h3>Charts</h3>
        <p><strong>Cumulative Cash Flow:</strong> Shows when the project breaks even and total value creation.</p>
        <p><strong>Production Chart:</strong> Visualizes annual output over the mine life.</p>
        <p><strong>Cost Breakdown:</strong> Identifies major cost drivers for optimization opportunities.</p>
      `,
    },
    {
      id: 'sensitivity-guide',
      title: 'Sensitivity Analysis Guide',
      content: `
        <p>Sensitivity analysis helps identify which variables have the greatest impact on project economics.</p>
        
        <h3>Using the Sensitivity Controls</h3>
        <p>1. Adjust sliders to vary key parameters by ±20%</p>
        <p>2. Observe real-time changes to NPV, IRR, and ROI</p>
        <p>3. Identify which variables have the largest impact</p>
        
        <h3>Tornado Chart</h3>
        <p>The tornado chart shows the impact of ±20% variations in each variable on NPV. Variables with the widest bars have the greatest impact and represent key project risks.</p>
        
        <h3>Scenario Comparison</h3>
        <p>Create three scenarios to bracket project outcomes:</p>
        <p><strong>Base Case:</strong> Most likely assumptions</p>
        <p><strong>Optimistic:</strong> Favorable conditions (higher prices, lower costs)</p>
        <p><strong>Pessimistic:</strong> Unfavorable conditions (lower prices, higher costs)</p>
      `,
    },
    {
      id: 'export-options',
      title: 'Export Options',
      content: `
        <h3>Excel Export</h3>
        <p>Generates a comprehensive workbook with multiple tabs:</p>
        <ul>
          <li>Summary: Key metrics and KPIs</li>
          <li>Assumptions: All input parameters</li>
          <li>Production: Annual tonnage and output</li>
          <li>Income Statement: Revenue, costs, and profitability</li>
          <li>Cash Flow: Operating and free cash flows</li>
        </ul>
        
        <h3>PDF Export</h3>
        <p>Creates a professional investor report including:</p>
        <ul>
          <li>Executive summary</li>
          <li>Key assumptions</li>
          <li>Financial tables</li>
          <li>Charts and visualizations</li>
        </ul>
        
        <h3>Chart Images</h3>
        <p>Individual charts can be exported as high-resolution PNG images from the Projections tab.</p>
      `,
    },
  ],
};
