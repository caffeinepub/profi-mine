# Specification

## Summary
**Goal:** Remove Save/Load model UI buttons from the dashboard and enforce a 3-use limit on ROM (Annual Tonnage Schedule) inputs for Free Tier users.

**Planned changes:**
- Remove the Save and Load model buttons from the DashboardHeader component, including all related modal triggers, click handlers, and references to SaveProjectModal and ProjectListModal throughout the application
- Add a `romUsageCount` field (default 0) to the user profile data structure on the backend, with methods to get and increment the count; Free Tier users are blocked from incrementing beyond 3
- Update ProjectContext to expose `romUsageCount` and an `incrementRomUsage()` helper that calls the backend and refreshes the user profile
- In ReservesProductionSection, call `incrementRomUsage()` each time a Free Tier user applies ROM inputs; when `romUsageCount >= 3`, disable all Annual ROM Tonnage Schedule inputs and display an inline upgrade prompt with a button that opens the SubscriptionModal

**User-visible outcome:** Free Tier users can use the ROM tonnage inputs up to 3 times; after the 3rd use the inputs are locked and an upgrade prompt appears. The Save and Load model buttons are no longer visible anywhere in the app.
