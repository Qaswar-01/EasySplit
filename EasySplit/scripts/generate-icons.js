// Simple icon generation script for PWA
// This creates basic placeholder icons - in production, use proper design tools

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="url(#grad)"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">₨</text>
  </svg>`;
};

// Create maskable icon (needs safe area)
const createMaskableSVG = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#grad)"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">₨</text>
  </svg>`;
};

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
const icons = [
  { name: 'pwa-64x64.svg', size: 64, maskable: false },
  { name: 'pwa-192x192.svg', size: 192, maskable: false },
  { name: 'pwa-512x512.svg', size: 512, maskable: false },
  { name: 'maskable-icon-512x512.svg', size: 512, maskable: true }
];

icons.forEach(icon => {
  const svg = icon.maskable ? createMaskableSVG(icon.size) : createSVGIcon(icon.size);
  const filePath = path.join(publicDir, icon.name);
  fs.writeFileSync(filePath, svg);
  console.log(`Generated ${icon.name}`);
});

// Also create a favicon
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG);
console.log('Generated favicon.svg');

console.log('All icons generated successfully!');
console.log('Note: These are basic SVG icons. For production, consider using PNG icons created with proper design tools.');
