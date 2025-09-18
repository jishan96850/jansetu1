// Simple placeholder image generator for missing photos
const generatePlaceholderDataURL = (title) => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, 400, 300);
  
  // Text
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('📷 Photo Not Available', 200, 120);
  
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px Arial';
  ctx.fillText('Original image was removed', 200, 150);
  ctx.fillText(`Report: ${title.substring(0, 30)}...`, 200, 180);
  
  return canvas.toDataURL('image/png');
};

export { generatePlaceholderDataURL };