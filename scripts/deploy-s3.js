#!/usr/bin/env node
require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { readFileSync, readdirSync, statSync, existsSync } = require('fs');
const { join, relative, extname } = require('path');

const WEBSITE_DIR = join(__dirname, '../website');
const RELEASE_DIR = join(__dirname, '../release');
const DMG_S3_KEY  = 'FlexSlotter-v3.dmg';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.dmg':  'application/x-apple-diskimage',
};

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, S3_REGION } = process.env;

if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_BUCKET || !S3_REGION) {
  console.error('❌  Missing S3 credentials in .env');
  process.exit(1);
}

const client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId:     S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    statSync(full).isDirectory()
      ? files.push(...collectFiles(full))
      : files.push(full);
  }
  return files;
}

function findLatestDmg() {
  if (!existsSync(RELEASE_DIR)) return null;
  const dmgs = readdirSync(RELEASE_DIR)
    .filter(f => f.endsWith('.dmg'))
    .map(f => join(RELEASE_DIR, f))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return dmgs[0] ?? null;
}

async function upload(key, body, contentType) {
  await client.send(new PutObjectCommand({
    Bucket:      S3_BUCKET,
    Key:         key,
    Body:        body,
    ContentType: contentType,
  }));
}

async function deploy() {
  // ── Website files ──
  const files = collectFiles(WEBSITE_DIR);
  console.log(`\n🌐  Deploying website (${files.length} file(s)) → s3://${S3_BUCKET}/\n`);

  for (const file of files) {
    const rel         = relative(WEBSITE_DIR, file).replace(/\\/g, '/');
    const contentType = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
    await upload(rel, readFileSync(file), contentType);
    console.log(`  ✓  ${rel}`);
  }

  // ── DMG ──
  const dmg = findLatestDmg();
  if (dmg) {
    const sizeMb = (statSync(dmg).size / 1024 / 1024).toFixed(1);
    console.log(`\n📦  Uploading DMG (${sizeMb} MB) → s3://${S3_BUCKET}/${DMG_S3_KEY}\n`);
    await upload(DMG_S3_KEY, readFileSync(dmg), MIME['.dmg']);
    console.log(`  ✓  ${DMG_S3_KEY}`);
  } else {
    console.log('\n⚠️   No DMG found in release/ — run npm run dmg first\n');
  }

  const siteUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/index.html`;
  const dmgUrl  = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${DMG_S3_KEY}`;
  console.log(`\n✅  Done`);
  console.log(`    Site → ${siteUrl}`);
  if (dmg) console.log(`    DMG  → ${dmgUrl}`);
  console.log();
}

deploy().catch((err) => {
  console.error('❌ ', err.message);
  process.exit(1);
});
