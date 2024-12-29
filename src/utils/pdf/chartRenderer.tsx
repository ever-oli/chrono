import domtoimage from 'dom-to-image-more';

export const generateChartImage = async (chartRef: HTMLElement): Promise<string> => {
  // Wait for chart to render fully (especially important for iOS Safari)
  await new Promise(r => setTimeout(r, 250));
  
  try {
    return await domtoimage.toPng(chartRef, {
      quality: 1,
      width: 600,
      height: 300,
      style: {
        transform: 'scale(2)', // Increase resolution
      }
    });
  } catch (error) {
    console.error('Error generating chart image:', error);
    throw error;
  }
};