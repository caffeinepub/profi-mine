export function useChartExport() {
  const exportChart = async (chartElement: HTMLElement | null, chartName: string) => {
    if (!chartElement) {
      throw new Error('Chart element not found');
    }

    try {
      // Find the SVG element within the chart container
      const svgElement = chartElement.querySelector('svg');
      if (!svgElement) {
        throw new Error('SVG element not found in chart');
      }

      // Get SVG dimensions
      const svgRect = svgElement.getBoundingClientRect();
      const svgData = new XMLSerializer().serializeToString(svgElement);

      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas dimensions
      canvas.width = svgRect.width * 2; // 2x for better quality
      canvas.height = svgRect.height * 2;

      // Create an image from the SVG
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Draw white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert canvas to blob and download
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }

            const link = document.createElement('a');
            const downloadUrl = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            
            link.href = downloadUrl;
            link.download = `${chartName}_${timestamp}.png`;
            link.click();

            URL.revokeObjectURL(url);
            URL.revokeObjectURL(downloadUrl);
            resolve();
          }, 'image/png');
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG image'));
        };

        img.src = url;
      });
    } catch (error) {
      console.error('Error exporting chart:', error);
      throw error;
    }
  };

  return { exportChart };
}
