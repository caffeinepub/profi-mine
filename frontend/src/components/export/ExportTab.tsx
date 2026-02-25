import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Image, Download, Info, AlertCircle } from 'lucide-react';
import { useExcelExport } from '../../hooks/useExcelExport';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProject } from '../../contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';

export default function ExportTab() {
  const { exportToExcel, isExporting: isExportingExcel } = useExcelExport();
  const { subscriptionTier, exportsRemaining } = useProject();

  const isFree = subscriptionTier === 'free';
  const exportsExhausted = isFree && exportsRemaining === 0;

  const handleExcelExport = async () => {
    try {
      await exportToExcel();
      toast.success('CSV file exported successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export CSV file';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Export your financial data and charts. Use CSV for detailed data analysis in Excel, Google Sheets, or any spreadsheet application.
        </AlertDescription>
      </Alert>

      {/* Export Limit Warning for Free Tier */}
      {isFree && (
        <Alert variant={exportsExhausted ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {exportsExhausted ? (
              <span>
                You have used all your free exports. <strong>Upgrade to Premium for unlimited exports.</strong>
              </span>
            ) : (
              <span>
                <strong>Exports remaining: {exportsRemaining} / 2</strong>. Upgrade to Premium for unlimited exports.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                Download your financial projections in various formats
              </CardDescription>
            </div>
            {isFree && (
              <Badge variant={exportsExhausted ? 'destructive' : 'outline'}>
                {exportsRemaining} / 2 exports
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-border rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">CSV Spreadsheet</h3>
                <p className="text-sm text-muted-foreground">Comma-separated values</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Includes summary, assumptions, production, income statement, and cash flow data. Can be opened in Excel, Google Sheets, or any spreadsheet application.
            </p>
            <Button
              onClick={handleExcelExport}
              disabled={isExportingExcel || exportsExhausted}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExportingExcel ? 'Exporting...' : exportsExhausted ? 'No Exports Remaining' : 'Export to CSV'}
            </Button>
          </div>

          <div className="border border-border rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Image className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Chart Images</h3>
                <p className="text-sm text-muted-foreground">Individual chart export</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Each chart in the Projections tab has an export button in the top-right corner. Click it to download the chart as a PNG image file.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
