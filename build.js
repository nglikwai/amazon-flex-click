const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Build main process with TypeScript
console.log('Building Electron main process...');
execSync('tsc -p tsconfig.main.json', { stdio: 'inherit' });

// Build renderer process with Vite
console.log('Building renderer process with Vite...');
execSync('vite build', { stdio: 'inherit' });

// Copy eng.traineddata for OCR
console.log('Copying static files...');
const distRoot = path.join(__dirname, 'dist');
if (fs.existsSync(path.join(__dirname, 'eng.traineddata'))) {
  fs.copyFileSync(
    path.join(__dirname, 'eng.traineddata'),
    path.join(distRoot, 'eng.traineddata')
  );
  console.log('Copied OCR data file');
}

console.log('Build complete!');
