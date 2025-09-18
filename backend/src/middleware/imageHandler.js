const fs = require('fs');
const path = require('path');

// Middleware to handle missing images
const handleMissingImage = (req, res, next) => {
  const filePath = path.join(__dirname, '../../uploads', req.params[0]);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    // File exists, serve it normally
    return next();
  }
  
  // File doesn't exist, create a placeholder response
  const placeholderSVG = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">
        📷 Image Not Found
      </text>
      <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="14" fill="#9ca3af">
        Original file was removed
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(placeholderSVG);
};

module.exports = { handleMissingImage };