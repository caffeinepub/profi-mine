# Specification

## Summary
**Goal:** Add a Free Tier subscription plan and enable chart export functionality with usage limits.

**Planned changes:**
- Add Free Tier plan at $0/year with a limit of 3 models per year
- Update profile setup and subscription modals to display and allow selection between Free and Premium tiers
- Limit Free Tier users to 2 total export operations (CSV and PDF combined) with a counter displayed in the UI
- Add individual export buttons to each chart component (CostBreakdownPieChart, CumulativeCashFlowChart, ProductionBarChart) that download the chart as a PNG image
- Update DashboardHeader to show both model usage and export usage separately for Free tier users

**User-visible outcome:** Users can sign up for a Free Tier plan with limited models and exports, or choose Premium for full access. All users can export individual charts as PNG images. Free tier users see their remaining export count and are prompted to upgrade after using their 2 free exports.
