import { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';

export function useExcelExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { inputs, calculations, projectName, subscriptionTier } = useProject();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const exportToExcel = async () => {
    if (!calculations) {
      throw new Error('No calculations available');
    }

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

      // Create CSV content for download
      let csvContent = '';
      
      // Summary Section
      csvContent += 'ProFi Mine - Financial Model Summary\n';
      csvContent += `Project Name:,${projectName || 'Untitled Project'}\n`;
      csvContent += '\n';
      csvContent += 'Key Performance Indicators\n';
      csvContent += `NPV ($M):,${(calculations.npv / 1000000).toFixed(2)}\n`;
      csvContent += `IRR (%):,${calculations.irr.toFixed(2)}\n`;
      csvContent += `ROI (%):,${calculations.roi.toFixed(2)}\n`;
      csvContent += `Life of Mine (years):,${calculations.lom.toFixed(1)}\n`;
      csvContent += `Average EBITDA ($M):,${(calculations.avgEbitda / 1000000).toFixed(2)}\n`;
      csvContent += `Payback Period (years):,${calculations.paybackPeriod.toFixed(1)}\n`;
      csvContent += '\n\n';
      
      // Assumptions Section
      csvContent += 'Input Assumptions\n';
      csvContent += '\n';
      csvContent += 'Reserves & Production\n';
      csvContent += `Ore Reserves (tonnes):,${inputs.oreReserves}\n`;
      csvContent += `Ore Grade (g/ton):,${inputs.oreGrade}\n`;
      csvContent += `Recovery Rate (%):,${inputs.recoveryRate}\n`;
      csvContent += `Stripping Ratio:,${inputs.strippingRatio}\n`;
      csvContent += '\n';
      csvContent += 'Economic Parameters\n';
      csvContent += `Inflation Rate (%):,${inputs.inflationRate}\n`;
      csvContent += `Discount Rate (%):,${inputs.discountRate}\n`;
      csvContent += `Tax Rate (%):,${inputs.taxRate}\n`;
      csvContent += '\n';
      csvContent += 'Cost Structure\n';
      csvContent += `Initial CAPEX ($M):,${inputs.initialCapex}\n`;
      csvContent += `Sustaining CAPEX ($M/year):,${inputs.sustainingCapex}\n`;
      csvContent += `Mining Cost ($/tonne):,${inputs.miningCost}\n`;
      csvContent += `Processing Cost ($/tonne):,${inputs.processingCost}\n`;
      csvContent += `G&A Cost ($/tonne):,${inputs.gAndACost}\n`;
      csvContent += `Royalties (%):,${inputs.royalties}\n`;
      csvContent += `Closure Costs ($M):,${inputs.closureCosts}\n`;
      csvContent += '\n\n';
      
      // Production Schedule
      csvContent += 'Production Schedule\n';
      csvContent += 'Year,ROM Tonnage,Commodity Price ($/g),Production (g)\n';
      calculations.yearlyData.forEach((data, i) => {
        csvContent += `${i + 1},${inputs.romTonnageSchedule[i]},${inputs.commodityPrices[i]},${data.production.toFixed(2)}\n`;
      });
      csvContent += '\n\n';
      
      // Income Statement
      csvContent += 'Income Statement\n';
      csvContent += 'Year,Revenue ($),OPEX ($),Royalties ($),EBITDA ($),Taxes ($),Net Income ($)\n';
      calculations.yearlyData.forEach((data, i) => {
        csvContent += `${i + 1},${data.revenue.toFixed(2)},${data.opex.toFixed(2)},${data.royalties.toFixed(2)},${data.ebitda.toFixed(2)},${data.taxes.toFixed(2)},${data.netIncome.toFixed(2)}\n`;
      });
      csvContent += '\n\n';
      
      // Cash Flow Statement
      csvContent += 'Cash Flow Statement\n';
      csvContent += 'Year,Operating Cash Flow ($),CAPEX ($),Free Cash Flow ($),Cumulative FCF ($)\n';
      calculations.yearlyData.forEach((data, i) => {
        csvContent += `${i + 1},${data.ocf.toFixed(2)},${data.capex.toFixed(2)},${data.fcf.toFixed(2)},${data.cumulativeFcf.toFixed(2)}\n`;
      });
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${projectName || 'mining-project'}_financial-model.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToExcel, isExporting };
}
