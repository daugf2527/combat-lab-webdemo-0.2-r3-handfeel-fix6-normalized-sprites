import assert from 'node:assert/strict';
import { assertRuntimeEvidence } from '../../scripts/assert-runtime-evidence.mjs';

const baseRuntimeEvidence = {
  schemaVersion: 1,
  buildHash: 'abc123',
  assets: {
    expected: [{ key: 'player', url: '/player.png' }],
    loaded: [{ key: 'player', url: '/player.png' }],
    failed: [],
    missingKeys: [],
  },
  combat: {
    sceneReady: true,
    tick: 10,
    eventCount: 2,
    eventTypes: { HitConfirmed: 1 },
    finalStateHash: 'state-hash',
  },
  dynamicManifests: [
    { kind: 'action_manifest', url: '/actions.json', status: 'loaded', hash: 'hash-1', version: 'v1', loadedAtTick: 10 },
  ],
};

const baseBrowserSmoke = {
  passed: true,
  evidence: {
    diagnostics: {
      consoleErrorCount: 0,
      pageErrorCount: 0,
      failedRequestCount: 0,
      badResponseCount: 0,
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
      badResponses: [],
    },
  },
};

assert.deepEqual(assertRuntimeEvidence(baseRuntimeEvidence, baseBrowserSmoke).errors, []);

assert.match(
  assertRuntimeEvidence({
    ...baseRuntimeEvidence,
    assets: { ...baseRuntimeEvidence.assets, missingKeys: ['enemy'] },
  }, baseBrowserSmoke).errors.join('\n'),
  /missing asset keys: enemy/
);

assert.match(
  assertRuntimeEvidence({
    ...baseRuntimeEvidence,
    combat: { ...baseRuntimeEvidence.combat, finalStateHash: null },
  }, baseBrowserSmoke).errors.join('\n'),
  /combat.finalStateHash is required/
);

assert.match(
  assertRuntimeEvidence(baseRuntimeEvidence, {
    ...baseBrowserSmoke,
    evidence: {
      diagnostics: {
        ...baseBrowserSmoke.evidence.diagnostics,
        consoleErrors: ['boom'],
      },
    },
  }).errors.join('\n'),
  /console errors: boom/
);

assert.match(
  assertRuntimeEvidence({
    ...baseRuntimeEvidence,
    dynamicManifests: [
      { kind: 'sprite_manifest', url: '/sprites.json', status: 'fallback', fallbackReason: '404' },
    ],
  }, baseBrowserSmoke).errors.join('\n'),
  /unauthorized dynamic manifest fallback/
);

assert.deepEqual(
  assertRuntimeEvidence({
    ...baseRuntimeEvidence,
    dynamicManifests: [
      { kind: 'local_dev_manifest', url: '/dev.json', status: 'fallback', fallbackReason: 'dev-only' },
    ],
  }, baseBrowserSmoke, { allowedFallbackKinds: ['local_dev_manifest'] }).errors,
  []
);

console.log('runtime evidence assert tests passed');
