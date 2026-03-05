import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useProject } from "../contexts/ProjectContext";
import { useActor } from "./useActor";

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { projectName } = useProject();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const exportToPdf = async () => {
    if (!actor) {
      throw new Error("Actor not available");
    }

    setIsExporting(true);

    try {
      // Check if user can export
      const canExport = await actor.canExport();
      if (!canExport) {
        throw new Error(
          "Export limit reached. Upgrade to Premium for unlimited exports.",
        );
      }

      // Decrement export count
      await actor.decrementExportCount();

      // Invalidate user profile to update export count
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });

      // Show instructions
      toast.info(
        'Preparing PDF... Opening print dialog shortly. Select "Save as PDF" as your printer destination.',
      );

      // Wait for DOM to fully render (charts, tables, etc.) before printing
      // Use multiple rAF + setTimeout to ensure Recharts SVGs are fully painted
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              resolve();
            }, 800);
          });
        });
      });

      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPdf, isExporting, projectName };
}
