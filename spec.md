# Specification

## Summary
**Goal:** Remove the PDF export option from the Export tab and fix the Save project action so it correctly persists the project to the backend.

**Planned changes:**
- Remove the PDF export button, description, and limit indicator from the Export tab UI; CSV export remains intact.
- Investigate and fix the `saveProject` mutation flow in `ProjectContext.tsx` and `useQueries.ts` so the backend save call succeeds.
- Display a success toast on successful save and an error toast on failure.

**User-visible outcome:** The Export tab only shows the CSV export option. Clicking Save in the dashboard header successfully saves the project and shows a confirmation toast.
