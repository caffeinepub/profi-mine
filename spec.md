# Specification

## Summary
**Goal:** Fix two broken export features: PDF export not rendering financial projections correctly, and chart image export capturing the download button icon instead of the chart graphic.

**Planned changes:**
- Update print media CSS so scrollable table containers expand fully, ensuring all rows of the income statement, cash flow, and KPI tables are visible in the exported PDF.
- Fix the `usePdfExport` hook to trigger the print dialog only after all projections content and chart SVGs are fully rendered.
- Fix the `useChartExport` hook to correctly target the Recharts SVG element within the chart container ref, excluding the export button from the capture target.
- Ensure each chart (CumulativeCashFlowChart, ProductionBarChart, CostBreakdownPieChart) exports as a PNG containing only the chart graphic on a white background at 2x resolution.

**User-visible outcome:** Users can export a complete PDF with all financial projection tables and charts fully rendered, and can download each chart as a PNG image showing the actual chart graphic rather than the download button icon.
