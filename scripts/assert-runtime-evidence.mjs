import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function diagnosticsFromBrowserSmoke(browserSmoke = {}) {
  return browserSmoke.evidence?.diagnostics ?? {};
}

export function assertRuntimeEvidence(runtimeEvidence = {}, browserSmoke = {}, options = {}) {
  const errors = [];
  const allowedFallbackKinds = new Set(options.allowedFallbackKinds ?? []);
  const assets = runtimeEvidence.assets ?? {};
  const combat = runtimeEvidence.combat ?? {};
  const diagnostics = diagnosticsFromBrowserSmoke(browserSmoke);

  if (combat.sceneReady !== true) errors.push('combat.sceneReady must be true');

  const missingKeys = asArray(assets.missingKeys);
  if (missingKeys.length > 0) errors.push(`missing asset keys: ${missingKeys.join(', ')}`);

  const failedAssets = asArray(assets.failed);
  if (failedAssets.length > 0) {
    errors.push(`failed assets: ${failedAssets.map(item => item?.key ?? 'unknown').join(', ')}`);
  }

  if (!combat.finalStateHash || typeof combat.finalStateHash !== 'string') {
    errors.push('combat.finalStateHash is required');
  }

  const consoleErrors = asArray(diagnostics.consoleErrors);
  const pageErrors = asArray(diagnostics.pageErrors);
  const failedRequests = asArray(diagnostics.failedRequests);
  const badResponses = asArray(diagnostics.badResponses);
  if (consoleErrors.length > 0) errors.push(`console errors: ${consoleErrors.join(' | ')}`);
  if (pageErrors.length > 0) errors.push(`page errors: ${pageErrors.join(' | ')}`);
  if (failedRequests.length > 0) errors.push(`failed requests: ${failedRequests.map(item => item?.url ?? item).join(' | ')}`);
  if (badResponses.length > 0) errors.push(`bad responses: ${badResponses.map(item => `${item?.status ?? 'unknown'} ${item?.url ?? ''}`.trim()).join(' | ')}`);

  for (const manifest of asArray(runtimeEvidence.dynamicManifests)) {
    if (manifest?.status === 'fallback' && !allowedFallbackKinds.has(manifest.kind)) {
      errors.push(`unauthorized dynamic manifest fallback: ${manifest.kind} ${manifest.url} ${manifest.fallbackReason ?? ''}`.trim());
    }
  }

  return { passed: errors.length === 0, errors };
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

async function main(argv) {
  const [, , runtimeEvidencePath, browserSmokePath] = argv;
  if (!runtimeEvidencePath || !browserSmokePath) {
    console.error('Usage: node scripts/assert-runtime-evidence.mjs <runtime-evidence.json> <browser-smoke.json>');
    return 2;
  }

  const result = assertRuntimeEvidence(readJson(runtimeEvidencePath), readJson(browserSmokePath), {
    allowedFallbackKinds: (process.env.RUNTIME_EVIDENCE_ALLOWED_FALLBACKS ?? '').split(',').map(item => item.trim()).filter(Boolean),
  });

  if (!result.passed) {
    console.error(JSON.stringify(result, null, 2));
    return 1;
  }

  console.log(JSON.stringify(result, null, 2));
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(await main(process.argv));
}
