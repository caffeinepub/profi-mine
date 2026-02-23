import { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { projectName } = useProject();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const exportToPdf = async () => {
    if (!actor) {
      throw new Error('Actor not available');
    }

    setIsExporting(true);

    try {
      // Check if user can export
      const canExport = await actor.canExport();
      if (!canExport) {
        throw new Error('Export limit reached. Upgrade to Premium for unlimited exports.');
      }

      // Decrement export count
      await actor.decrementExportCount();

      // Invalidate user profile to update export count
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });

      // Show instructions and trigger print dialog
      toast.info('Opening print dialog. Select "Save as PDF" as your printer destination.');
      
      // Small delay to ensure toast is visible before print dialog
      setTimeout(() => {
        window.print();
      }, 500);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPdf, isExporting };
}
