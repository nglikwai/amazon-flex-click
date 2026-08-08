#!/usr/bin/env node
const { execSync } = require('child_process');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const ROOT = join(__dirname, '..');

function run(cmd, label) {
  console.log(`\n▶  ${label}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

function findDmg() {
  const releaseDir = join(ROOT, 'release');
  try {
    return readdirSync(releaseDir)
      .filter(f => f.endsWith('.dmg'))
      .map(f => join(releaseDir, f))
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
  } catch {
    return null;
  }
}

try {
  run('node build.js', 'Compiling TypeScript + Vite...');
  run('electron-builder --mac --arm64', 'Packaging DMG...');

  const dmg = findDmg();
  if (dmg) {
    console.log(`\n✅  DMG ready → ${dmg}\n`);
    execSync(`open "${join(ROOT, 'release')}"`);
  }
} catch (err) {
  console.error('\n❌  Build failed:', err.message);
  process.exit(1);
}
