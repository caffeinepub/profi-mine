export function useChartExport() {
  const exportChart = async (chartElement: HTMLElement | null, chartName: string) => {
    if (!chartElement) {
      throw new Error('Chart element not found');
    }

    try {
      // Find all SVG elements within the chart container
      const svgElements = chartElement.querySelectorAll('svg');
      if (!svgElements.length) {
        throw new Error('SVG element not found in chart');
      }

      // Pick the largest SVG (the chart itself, not any icon SVGs)
      let svgElement: SVGSVGElement | null = null;
      let maxArea = 0;
      svgElements.forEach((svg) => {
        const rect = svg.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area > maxArea) {
          maxArea = area;
          svgElement = svg as SVGSVGElement;
        }
      });

      if (!svgElement) {
        throw new Error('Chart SVG element not found');
      }

      // Get SVG dimensions
      const svgRect = (svgElement as SVGSVGElement).getBoundingClientRect();
      const width = svgRect.width || 600;
      const height = svgRect.height || 300;

      // Clone the SVG to avoid modifying the original
      const clonedSvg = (svgElement as SVGSVGElement).cloneNode(true) as SVGSVGElement;

      // Ensure the cloned SVG has explicit width/height attributes
      clonedSvg.setAttribute('width', String(width));
      clonedSvg.setAttribute('height', String(height));
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // Inline computed styles for all elements in the cloned SVG
      // This ensures colors and styles are preserved when rendering to canvas
      const originalElements = (svgElement as SVGSVGElement).querySelectorAll('*');
      const clonedElements = clonedSvg.querySelectorAll('*');
      originalElements.forEach((origEl, idx) => {
        const clonedEl = clonedElements[idx];
        if (clonedEl && origEl instanceof Element) {
          const computedStyle = window.getComputedStyle(origEl);
          // Copy key style properties
          const styleProps = ['fill', 'stroke', 'stroke-width', 'font-size', 'font-family', 'opacity'];
          styleProps.forEach((prop) => {
            const val = computedStyle.getPropertyValue(prop);
            if (val) {
              (clonedEl as HTMLElement).style.setProperty(prop, val);
            }
          });
        }
      });

      const svgData = new XMLSerializer().serializeToString(clonedSvg);

      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas dimensions at 2x for better quality
      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2);

      // Create an image from the SVG
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Draw white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);

          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);

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
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

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
