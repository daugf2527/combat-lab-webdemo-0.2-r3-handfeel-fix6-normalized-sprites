import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const normDir = path.join(root, 'public', 'assets', 'sprites', 'normalized');
const jsonPath = path.join(normDir, 'sprite-normalization.json');

const config = JSON.parse(readFileSync(jsonPath, 'utf-8'));
const pngFiles = new Set(
  readdirSync(normDir).filter(f => f.endsWith('.png'))
);

let passed = true;

for (const [name, entry] of Object.entries(config)) {
  const sheetName = entry.sheet;

  if (!pngFiles.has(sheetName)) {
    console.log(`FAIL ${name}: sheet "${sheetName}" not found in normalized/`);
    passed = false;
    continue;
  }

  const expectedWidth = entry.cols * entry.cellW;
  const expectedHeight = Math.ceil(entry.frames / entry.cols) * entry.cellH;

  if (entry.size[0] !== expectedWidth) {
    console.log(`FAIL ${name}: width ${entry.size[0]} !== cols(${entry.cols}) * cellW(${entry.cellW}) = ${expectedWidth}`);
    passed = false;
  }

  if (entry.size[1] !== expectedHeight) {
    console.log(`FAIL ${name}: height ${entry.size[1]} !== rows(${Math.ceil(entry.frames / entry.cols)}) * cellH(${entry.cellH}) = ${expectedHeight}`);
    passed = false;
  }

  if (entry.size[0] === expectedWidth && entry.size[1] === expectedHeight && pngFiles.has(sheetName)) {
    console.log(`OK ${name}: ${sheetName} (${entry.size[0]}x${entry.size[1]}, ${entry.frames} frames)`);
  }
}

if (!passed) process.exit(1);
console.log('Asset manifest consistency: PASSED');
