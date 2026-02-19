/**
 * Converts all JPEG photos in public/photos/ to WebP.
 * Run with: node scripts/convert-images.js
 * Safe to re-run — skips files that already have a .webp counterpart.
 */

import { createRequire } from 'module';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PHOTOS_DIR = join(__dirname, '..', 'public', 'photos');
const WEBP_QUALITY = 82;

async function findJpegs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findJpegs(fullPath)));
    } else if (/\.(jpg|jpeg)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const jpegs = await findJpegs(PHOTOS_DIR);
  console.log(`Found ${jpegs.length} JPEG file(s) in ${PHOTOS_DIR}\n`);

  let converted = 0;
  let skipped = 0;

  for (const file of jpegs) {
    const webpPath = file.replace(/\.(jpg|jpeg)$/i, '.webp');
    try {
      await stat(webpPath);
      // WebP already exists — skip
      skipped++;
    } catch {
      // Convert
      await sharp(file)
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpPath);
      console.log(`  ✓ ${basename(webpPath)}`);
      converted++;
    }
  }

  console.log(`\nDone: ${converted} converted, ${skipped} already existed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
