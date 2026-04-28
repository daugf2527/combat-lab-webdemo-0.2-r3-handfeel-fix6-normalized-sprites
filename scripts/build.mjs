import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const verificationDir = path.join(root, 'verification');
const buildCommand = 'vite build';

function writeResult(result) {
  mkdirSync(verificationDir, { recursive: true });
  writeFileSync(path.join(verificationDir, 'build.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}

const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const vite = spawnSync(process.execPath, [viteBin, 'build'], {
  cwd: root,
  encoding: 'utf8'
});

if (vite.status !== 0) {
  const failed = {
    passed: false,
    command: buildCommand,
    status: vite.status ?? 1,
    stdout: vite.stdout,
    stderr: vite.stderr,
    dist: 'dist/index.html'
  };
  writeResult(failed);
  process.exit(vite.status ?? 1);
}

const indexHtml = path.join(distDir, 'index.html');
const assetsDir = path.join(distDir, 'assets');
const emittedAssets = existsSync(assetsDir)
  ? readdirSync(assetsDir).map((entry) => `dist/assets/${entry}`).sort()
  : [];

const hasMainBundle = emittedAssets.some((asset) => /\/index-[\w-]+\.js$/.test(asset) || /\/main-[\w-]+\.js$/.test(asset));

if (!existsSync(indexHtml) || emittedAssets.length === 0 || !hasMainBundle) {
  const failed = {
    passed: false,
    command: buildCommand,
    status: 1,
    stdout: vite.stdout,
    stderr: `${vite.stderr ?? ''}\nVite build did not emit the expected dist/index.html and JS bundle`.trim(),
    dist: 'dist/index.html',
    assets: emittedAssets
  };
  writeResult(failed);
  process.exit(1);
}

const passed = {
  passed: true,
  command: buildCommand,
  status: 0,
  dist: 'dist/index.html',
  assets: emittedAssets
};
writeResult(passed);
