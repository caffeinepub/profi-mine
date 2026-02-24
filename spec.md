# Specification

## Summary
**Goal:** Remove PDF export, fix the project Save action, and eliminate duplicate input fields in the ProFi Mine application.

**Planned changes:**
- Remove the PDF export button and all PDF-related UI from the Export tab, remove `usePdfExport` calls, and remove PDF print styles from `index.css`
- Fix the failing Save action in `SaveProjectModal.tsx` so it correctly calls the backend `saveProject` mutation, shows a success toast on completion, and displays an error message on failure
- Fix duplicate Equity Ratio and Interest Rate fields in the Inputs dashboard by auditing `InputsTab.tsx` and `FinancingSection.tsx` and removing the duplicate instances

**User-visible outcome:** The Export tab only shows CSV export. Saving a project works correctly with appropriate feedback. The Inputs dashboard shows Equity Ratio and Interest Rate exactly once each.
